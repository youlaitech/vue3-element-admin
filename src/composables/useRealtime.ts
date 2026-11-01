import {
  computed,
  inject,
  onMounted,
  onScopeDispose,
  provide,
  readonly,
  shallowRef,
  watch,
} from "vue";
import type { InjectionKey, Ref } from "vue";
import RealtimeAPI from "@/api/realtime";
import { ROLE_ROOT } from "@/constants";
import { useDictStore } from "@/stores/dict";
import { useUserStore } from "@/stores/user";
import { AuthStorage, authSessionRevision } from "@/utils/auth";
import { createRealtimeClient, RealtimeConnectionStatus } from "@/utils/realtime/client";
import { parseRealtimeTicket } from "@/utils/realtime/protocol";
import type {
  NoticeChangedMessage,
  PresenceSnapshot,
  RealtimeServerMessage,
  RealtimeTopic,
} from "@/utils/realtime/protocol";

/**
 * 公告变更或 HTTP 校准时调用的处理器。
 */
type NoticeChangeHandler = (message: NoticeChangedMessage | null) => void;
/**
 * 页面共享的连接状态与业务订阅。
 */
interface RealtimeContext {
  readonly status: Readonly<Ref<RealtimeConnectionStatus>>;
  readonly isConnected: Readonly<Ref<boolean>>;
  readonly presence: Readonly<Ref<PresenceSnapshot | null>>;
  readonly onNoticeChange: (handler: NoticeChangeHandler) => () => void;
}

const REALTIME_CONTEXT: InjectionKey<RealtimeContext> = Symbol("realtime-context");

/**
 * 在应用根组件初始化实时连接。
 */
export function provideRealtime(): RealtimeContext {
  const user = useUserStore();
  const dicts = useDictStore();
  const presence = shallowRef<PresenceSnapshot | null>(null);
  const noticeHandlers = new Set<NoticeChangeHandler>();
  const seenNoticeIds = new Set<string>();
  let mounted = false;
  let disposed = false;
  // 会话或权限变化时递增，使旧的 HTTP 校准响应失效。
  let revision = 0;
  let presenceRequest: Promise<void> | null = null;
  let calibrationTimer: ReturnType<typeof setTimeout> | null = null;

  const client = createRealtimeClient({
    /**
     * 领取并校验票据；服务未启用或无权连接时返回 null。
     */
    async requestTicket(request) {
      const ticket = await RealtimeAPI.createTicket(request);
      if (ticket === null) return null;
      const result = parseRealtimeTicket(ticket);
      if (result.kind === "rejected") throw new Error("领票响应格式不正确");
      return result.value;
    },
  });

  /**
   * 判断当前用户是否有权查看在线人数。
   */
  function hasPresencePermission(): boolean {
    const { roles = [], perms = [] } = user.userInfo;
    return (
      roles.includes(ROLE_ROOT) ||
      perms.some((perm) => perm === "sys:online:view" || perm === "*:*:*")
    );
  }

  /**
   * 按当前权限选择订阅主题。
   */
  function getTopics(): readonly RealtimeTopic[] {
    return hasPresencePermission() ? ["notice", "dict", "presence"] : ["notice", "dict"];
  }

  /**
   * 判断应用和登录状态是否允许建立连接。
   */
  function canRun(): boolean {
    return mounted && !disposed && !!user.userInfo.userId && !!AuthStorage.getAccessToken();
  }

  /**
   * 通知页面刷新公告，隔离处理器异常。
   */
  function notifyNotices(message: NoticeChangedMessage | null): void {
    for (const handler of noticeHandlers) {
      try {
        handler(message);
      } catch {
        console.error("[Realtime] 通知刷新失败");
      }
    }
  }

  /**
   * 应用在线快照，忽略同一节点的过期结果。
   */
  function applyPresence(snapshot: PresenceSnapshot): void {
    if (!hasPresencePermission()) return;
    const previous = presence.value;
    // 仅在同一节点内比较时间；服务重启后的新节点快照可直接替换。
    if (
      previous?.nodeId === snapshot.nodeId &&
      Date.parse(previous.observedAt) > Date.parse(snapshot.observedAt)
    )
      return;
    presence.value = snapshot;
  }

  /**
   * 合并在线人数校准请求，忽略旧会话响应。
   */
  function refreshPresence(): void {
    if (!canRun() || !hasPresencePermission() || presenceRequest) return;
    const startedRevision = revision;
    const request = RealtimeAPI.getPresenceSnapshot()
      .then((snapshot) => {
        if (startedRevision === revision && canRun()) applyPresence(snapshot);
      })
      .catch(() => console.warn("[Realtime] 在线人数校准失败"))
      .finally(() => {
        if (presenceRequest === request) presenceRequest = null;
      });
    presenceRequest = request;
  }

  /**
   * 清除待执行的 HTTP 校准任务。
   */
  function stopCalibration(): void {
    if (calibrationTimer !== null) clearTimeout(calibrationTimer);
    calibrationTimer = null;
  }

  /**
   * 持续在线也定期核对 HTTP，补偿进程重启或队列拒绝造成的漏提示。
   */
  function calibrate(): void {
    stopCalibration();
    if (!canRun() || document.visibilityState !== "visible") return;
    notifyNotices(null);
    dicts.refreshCachedDicts();
    refreshPresence();
    calibrationTimer = setTimeout(calibrate, 120_000 + Math.random() * 180_000);
  }

  /**
   * 将实时消息分发给通知、字典和在线状态。
   */
  function handleMessage(message: RealtimeServerMessage): void {
    if (!canRun()) return;
    switch (message.type) {
      case "connection.ready":
        calibrate();
        break;
      case "notice.changed":
        // 只保留有限去重窗口，不将消息 ID 当作持久投递记录。
        if (seenNoticeIds.has(message.id)) return;
        seenNoticeIds.add(message.id);
        if (seenNoticeIds.size > 128) {
          const first = seenNoticeIds.values().next().value;
          if (first) seenNoticeIds.delete(first);
        }
        notifyNotices(message);
        break;
      case "dict.changed":
        dicts.invalidateDict(message.payload.dictCode);
        break;
      case "presence.snapshot":
        applyPresence(message.payload);
        break;
    }
  }

  /**
   * 清理旧会话状态，并按当前权限重新连接。
   */
  function resetConnection(): void {
    revision += 1;
    presenceRequest = null;
    presence.value = null;
    seenNoticeIds.clear();
    stopCalibration();
    client.disconnect();
    if (canRun()) {
      client.connect(getTopics());
      calibrate();
    }
  }

  /**
   * 前台恢复时检查连接并校准业务数据。
   */
  function resume(): void {
    if (!canRun() || document.visibilityState !== "visible") return;
    client.connect(getTopics());
    calibrate();
  }

  /**
   * 随页面可见状态恢复或暂停 HTTP 校准。
   */
  function handleVisibility(): void {
    if (document.visibilityState === "visible") resume();
    // 浏览器隐藏时保留连接，只暂停 HTTP 校准。
    else stopCalibration();
  }

  const stopMessages = client.onMessage(handleMessage);
  const stopSessionWatcher = watch(
    () =>
      [
        authSessionRevision.value,
        user.userInfo.userId,
        [...(user.userInfo.roles ?? [])].sort().join(),
        [...(user.userInfo.perms ?? [])].sort().join(),
      ].join("|"),
    resetConnection,
    { flush: "sync" },
  );

  const context: RealtimeContext = {
    status: client.status,
    isConnected: computed(() => client.status.value === RealtimeConnectionStatus.CONNECTED),
    presence: readonly(presence),
    /**
     * 在 setup 中订阅公告，随当前作用域释放，也可手动取消。
     */
    onNoticeChange(handler) {
      noticeHandlers.add(handler);
      /**
       * 取消当前公告订阅。
       */
      function unsubscribe(): void {
        noticeHandlers.delete(handler);
      }
      onScopeDispose(unsubscribe);
      return unsubscribe;
    },
  };
  provide(REALTIME_CONTEXT, context);

  onMounted(() => {
    mounted = true;
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("online", resume);
    resetConnection();
  });

  /**
   * 释放连接、监听器和定时器。
   */
  function dispose(): void {
    if (disposed) return;
    disposed = true;
    revision += 1;
    stopSessionWatcher();
    stopMessages();
    stopCalibration();
    noticeHandlers.clear();
    client.disconnect();
    if (mounted) {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("online", resume);
    }
  }
  onScopeDispose(dispose);
  if (import.meta.hot) import.meta.hot.dispose(dispose);
  return context;
}

/**
 * 获取应用提供的实时状态与公告订阅入口。
 */
export function useRealtime(): RealtimeContext {
  const context = inject(REALTIME_CONTEXT);
  if (!context) throw new Error("实时通信尚未初始化");
  return context;
}
