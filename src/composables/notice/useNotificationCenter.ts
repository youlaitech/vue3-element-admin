import { ref, onMounted, onBeforeUnmount } from "vue";
import NoticeAPI, {
  type NoticePageVO,
  type NoticeDetailVO,
  type NoticePageQuery,
} from "@/api/system/notice-api";
import { useStomp } from "@/composables/websocket/useStomp";
import router from "@/router";

const DEFAULT_PAGE_SIZE = 5;

const noticeList = ref<NoticePageVO[]>([]);
const noticeDialogVisible = ref(false);
const noticeDetail = ref<NoticeDetailVO | null>(null);

const { subscribe, unsubscribe, isConnected } = useStomp();
let subscribed = false;

function normalizeQuery(params?: Partial<NoticePageQuery>): NoticePageQuery {
  return {
    pageNum: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    isRead: 0,
    ...(params || {}),
  } as NoticePageQuery;
}

async function fetchMyNotices(params?: Partial<NoticePageQuery>) {
  const query = normalizeQuery(params);
  const page = await NoticeAPI.getMyNoticePage(query);
  noticeList.value = page.list || [];
}

async function readNotice(id: string) {
  const data = await NoticeAPI.getDetail(id);
  noticeDetail.value = data;
  noticeDialogVisible.value = true;

  const index = noticeList.value.findIndex((item) => item.id === id);
  if (index >= 0) {
    noticeList.value.splice(index, 1);
  }
}

async function markAllAsRead() {
  await NoticeAPI.readAll();
  noticeList.value = [];
}

function viewMore() {
  router.push({ name: "MyNotice" });
}

function setupStompSubscription() {
  if (subscribed || !isConnected.value) return;

  subscribe("/user/queue/message", (message: any) => {
    try {
      const data = JSON.parse(message.body || "{}");
      const id = data.id;
      if (!id) return;

      if (!noticeList.value.some((item) => item.id === id)) {
        noticeList.value.unshift({
          id,
          title: data.title,
          type: data.type,
          publishTime: data.publishTime,
        } as NoticePageVO);

        ElNotification({
          title: "您收到一条新的通知消息！",
          message: data.title,
          type: "success",
          position: "bottom-right",
        });
      }
    } catch (e) {
      console.error("解析通知消息失败", e);
    }
  });

  subscribed = true;
}

export function useNotificationCenter() {
  onMounted(() => {
    fetchMyNotices();
    setupStompSubscription();
  });

  onBeforeUnmount(() => {
    unsubscribe("/user/queue/message");
    subscribed = false;
  });

  return {
    noticeList,
    noticeDialogVisible,
    noticeDetail,
    fetchMyNotices,
    readNotice,
    markAllAsRead,
    viewMore,
  };
}
