import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import NoticeAPI from "@/api/system/notice";
import type { NoticeDetail, NoticeItem, NoticeQuery } from "@/api/system/notice";
import { useRealtime } from "@/composables/useRealtime";
import router from "@/router";
import { authSessionRevision } from "@/utils/auth";

const PAGE_SIZE = 5;
type NoticeStatus = 0 | 1;

/**
 * 通知中心的数据与交互。
 */
export function useNotice() {
  const { onNoticeChange } = useRealtime();
  const list = ref<NoticeItem[]>([]);
  const unreadTotal = ref(0);
  const activeStatus = ref<NoticeStatus>(0);
  const detail = ref<NoticeDetail | null>(null);
  const dialogVisible = ref(false);
  const emptyText = computed(() => (activeStatus.value === 0 ? "暂无未读消息" : "暂无已读消息"));

  let refreshPromise: Promise<void> | null = null;
  let refreshRequested = false;
  let disposed = false;
  let listSequence = 0;
  let unreadSequence = 0;

  /**
   * 加载当前阅读状态的通知，忽略过期响应。
   */
  async function fetchList(params?: Partial<NoticeQuery>): Promise<void> {
    const revision = authSessionRevision.value;
    const sequence = ++listSequence;
    const query: NoticeQuery = {
      pageNum: 1,
      pageSize: PAGE_SIZE,
      isRead: activeStatus.value,
      ...params,
    };
    const page = await NoticeAPI.getMyNoticePage(query);
    if (
      disposed ||
      revision !== authSessionRevision.value ||
      sequence !== listSequence ||
      query.isRead !== activeStatus.value
    )
      return;
    list.value = page.list ?? [];
    if (query.isRead === 0) unreadTotal.value = page.total ?? 0;
  }

  /**
   * 查询未读总数，忽略旧会话及旧请求结果。
   */
  async function fetchUnreadTotal(): Promise<void> {
    const revision = authSessionRevision.value;
    const sequence = ++unreadSequence;
    const page = await NoticeAPI.getMyNoticePage({
      pageNum: 1,
      pageSize: 1,
      isRead: 0,
    });
    if (disposed || revision !== authSessionRevision.value || sequence !== unreadSequence) return;
    unreadTotal.value = page.total ?? 0;
  }

  /**
   * 切换阅读状态并重新加载通知。
   */
  async function switchStatus(status: NoticeStatus): Promise<void> {
    if (activeStatus.value === status) return;
    activeStatus.value = status;
    await fetchList();
  }

  /**
   * 刷新通知列表和未读总数。
   */
  async function refresh(): Promise<void> {
    await Promise.all([
      fetchList(),
      activeStatus.value === 0 ? Promise.resolve() : fetchUnreadTotal(),
    ]);
  }

  /**
   * 同时只执行一次刷新；在途收到新提示时，结束后再补拉一次。
   */
  function scheduleRefresh(): void {
    if (disposed) return;
    if (refreshPromise) {
      refreshRequested = true;
      return;
    }

    refreshPromise = refresh()
      .catch((error) => console.warn("[Notice] 刷新通知失败", error))
      .finally(() => {
        refreshPromise = null;
        if (refreshRequested) {
          refreshRequested = false;
          scheduleRefresh();
        }
      });
  }

  /**
   * 打开通知详情并刷新阅读状态。
   */
  async function read(id: string): Promise<void> {
    const revision = authSessionRevision.value;
    const data = await NoticeAPI.getDetail(id);
    if (disposed || revision !== authSessionRevision.value) return;
    detail.value = data;
    dialogVisible.value = true;
    await refresh();
  }

  /**
   * 将全部通知标为已读并刷新列表。
   */
  async function readAll(): Promise<void> {
    if (unreadTotal.value <= 0) return;

    await NoticeAPI.readAll();
    await refresh();
    ElMessage.success("已全部标记为已读");
  }

  /**
   * 进入我的通知页面。
   */
  function goMore(): void {
    void router.push({ name: "MyNotice" });
  }

  onNoticeChange((message) => {
    if (message?.payload.action === "revoked" && detail.value?.id === message.payload.noticeId) {
      detail.value = null;
      dialogVisible.value = false;
    }
    if (message?.payload.action === "published") {
      ElNotification({
        title: "新通知",
        message: "您收到一条新的通知消息",
        type: "success",
        position: "bottom-right",
      });
    }
    scheduleRefresh();
  });

  onMounted(scheduleRefresh);
  onBeforeUnmount(() => {
    disposed = true;
  });

  return {
    list,
    unreadTotal,
    activeStatus,
    emptyText,
    detail,
    dialogVisible,
    fetchList,
    switchStatus,
    refresh,
    read,
    readAll,
    goMore,
  };
}
