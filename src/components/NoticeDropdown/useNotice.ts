import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import type { NoticeDetail, NoticeItem, NoticeQueryParams } from "@/api/system/notice";
import NoticeAPI from "@/api/system/notice";
import { useSse } from "@/composables";
import router from "@/router";

const PAGE_SIZE = 5;
const NOTICE_EVENT = "notice";
const NOTICE_REVOKE_EVENT = "notice-revoke";

type NoticeStatus = 0 | 1;

interface NoticeMessage {
  id: string;
  title: string;
  type: number;
  publishTime?: Date;
}

interface NoticeRevokeMessage {
  id: string;
}

export function useNotice() {
  const { on } = useSse();

  const list = ref<NoticeItem[]>([]);
  const unreadTotal = ref(0);
  const activeStatus = ref<NoticeStatus>(0);
  const detail = ref<NoticeDetail | null>(null);
  const dialogVisible = ref(false);
  const emptyText = computed(() => (activeStatus.value === 0 ? "暂无未读消息" : "暂无已读消息"));

  let stopSubscriptions: (() => void) | null = null;

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

  async function fetchUnreadTotal() {
    const page = await NoticeAPI.getMyNoticePage({
      pageNum: 1,
      pageSize: 1,
      isRead: 0,
    });
    unreadTotal.value = page.total ?? 0;
  }

  async function switchStatus(status: NoticeStatus) {
    if (activeStatus.value === status) return;

    activeStatus.value = status;
    await fetchList();
  }

  async function refresh() {
    await Promise.all([
      fetchList(),
      activeStatus.value === 0 ? Promise.resolve() : fetchUnreadTotal(),
    ]);
  }

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

  function goMore() {
    router.push({ name: "MyNotice" });
  }

  function setupSubscription() {
    if (stopSubscriptions) return;

    const stopNotice = on<NoticeMessage>(NOTICE_EVENT, (data) => {
      try {
        if (!data.id) return;

        unreadTotal.value += 1;
        if (activeStatus.value !== 0) return;
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

    const stopRevoke = on<NoticeRevokeMessage>(NOTICE_REVOKE_EVENT, (data) => {
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
