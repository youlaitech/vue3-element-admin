import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import type { NoticeDetail, NoticeItem, NoticeQueryParams } from "@/api/system/notice";
import NoticeAPI from "@/api/system/notice";
import { useSse } from "@/utils/sse";
import { SseTopics } from "@/enums/sse";
import router from "@/router";

// 下拉面板每页展示条数
const PAGE_SIZE = 5;

/** 通知读取状态：0=未读，1=已读 */
type NoticeStatus = 0 | 1;

/** SSE 推送的新通知消息体 */
interface NoticeMessage {
  id: string;
  title: string;
  type: number;
  publishTime?: Date;
}

/** SSE 推送的通知撤回消息体 */
interface NoticeRevokeMessage {
  id: string;
}

/**
 * 通知下拉面板的响应式数据与业务逻辑
 */
export function useNotice() {
  const { on } = useSse();

  // 当前 Tab 下的通知列表（最多 PAGE_SIZE 条）
  const list = ref<NoticeItem[]>([]);
  // 未读通知总数（红点/角标数字）
  const unreadTotal = ref(0);
  // 当前激活的 Tab：0=未读，1=已读
  const activeStatus = ref<NoticeStatus>(0);
  // 查看详情时加载的完整通知数据
  const detail = ref<NoticeDetail | null>(null);
  // 详情弹窗可见性
  const dialogVisible = ref(false);
  // 列表为空时的占位文案，根据当前 Tab 切换
  const emptyText = computed(() => (activeStatus.value === 0 ? "暂无未读消息" : "暂无已读消息"));

  // SSE 订阅的取消函数集合，用于组件卸载时解绑
  let stopSubscriptions: (() => void) | null = null;

  /**
   * 拉取通知分页列表；未读 Tab 顺带更新未读总数
   */
  async function fetchList(params?: Partial<NoticeQueryParams>) {
    const query: NoticeQueryParams = {
      pageNum: 1,
      pageSize: PAGE_SIZE,
      isRead: activeStatus.value,
      ...params,
    };
    const page = await NoticeAPI.getMyNoticePage(query);
    list.value = page.list || [];

    if (query.isRead === 0) {
      unreadTotal.value = page.total ?? 0;
    }
  }

  /**
   * 仅查询未读通知总数（不更新列表），用于切换到已读 Tab 后刷新角标
   */
  async function fetchUnreadTotal() {
    const page = await NoticeAPI.getMyNoticePage({
      pageNum: 1,
      pageSize: 1,
      isRead: 0,
    });
    unreadTotal.value = page.total ?? 0;
  }

  /**
   * 切换未读/已读 Tab，同 Tab 重复点击不请求
   */
  async function switchStatus(status: NoticeStatus) {
    if (activeStatus.value === status) return;

    activeStatus.value = status;
    await fetchList();
  }

  /**
   * 刷新数据：已读 Tab 额外刷新未读总数以更新角标
   */
  async function refresh() {
    await Promise.all([
      fetchList(),
      activeStatus.value === 0 ? Promise.resolve() : fetchUnreadTotal(),
    ]);
  }

  /**
   * 查看通知详情：从下拉列表移除该条，未读则角标减一
   */
  async function read(id: string) {
    const item = list.value.find((notice: NoticeItem) => notice.id === id);
    const wasUnread = item?.isRead !== 1;

    detail.value = await NoticeAPI.getDetail(id);
    dialogVisible.value = true;

    const idx = list.value.findIndex((item: NoticeItem) => item.id === id);
    if (idx >= 0) list.value.splice(idx, 1);
    if (wasUnread && unreadTotal.value > 0) unreadTotal.value -= 1;

    await refresh();
  }

  /**
   * 全部标为已读
   */
  async function readAll() {
    if (unreadTotal.value <= 0) return;

    await NoticeAPI.readAll();
    unreadTotal.value = 0;
    if (activeStatus.value === 0) {
      list.value = [];
    } else {
      await fetchList();
    }
    ElMessage.success("已全部标记为已读");
  }

  /**
   * 跳转到通知列表页
   */
  function goMore() {
    router.push({ name: "MyNotice" });
  }

  /**
   * 订阅通知推送：NOTICE 插入列表头部并弹浏览器通知，NOTICE_REVOKE 移除该条；已订阅则跳过，避免重复挂载重复订阅
   */
  function setupSubscription() {
    if (stopSubscriptions) return;

    const stopNotice = on<NoticeMessage>(SseTopics.NOTICE, (data) => {
      try {
        if (!data.id) return;

        unreadTotal.value += 1;
        // 当前在已读 Tab 时不操作列表
        if (activeStatus.value !== 0) return;
        // 已存在则跳过（防重）
        if (list.value.some((item: NoticeItem) => item.id === data.id)) return;

        list.value.unshift({
          id: data.id,
          title: data.title,
          content: "",
          type: data.type,
          level: "",
          publishStatus: 1,
          publishTime: data.publishTime,
          isRead: 0,
        });

        // 超出 PAGE_SIZE 时截断尾部
        if (list.value.length > PAGE_SIZE) {
          list.value.length = PAGE_SIZE;
        }

        ElNotification({
          title: "您收到一条新的通知消息！",
          message: data.title,
          type: "success",
          position: "bottom-right",
        });
      } catch (e) {
        console.error("解析通知消息失败", e);
      }
    });

    const stopRevoke = on<NoticeRevokeMessage>(SseTopics.NOTICE_REVOKE, (data) => {
      try {
        if (!data.id) return;

        const index = list.value.findIndex((item: NoticeItem) => item.id === data.id);
        if (index >= 0) {
          const wasUnread = list.value[index].isRead !== 1;
          list.value.splice(index, 1);
          if (wasUnread && unreadTotal.value > 0) unreadTotal.value -= 1;
        }
      } catch (e) {
        console.error("处理撤回通知失败", e);
      }
    });

    stopSubscriptions = () => {
      stopNotice();
      stopRevoke();
    };
  }

  onMounted(() => {
    refresh();
    setupSubscription();
  });

  onBeforeUnmount(() => {
    if (stopSubscriptions) {
      stopSubscriptions();
      stopSubscriptions = null;
    }
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
