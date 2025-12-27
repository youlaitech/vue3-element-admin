/**
 * 通知中心逻辑
 */
import { ref, onMounted, onBeforeUnmount } from "vue";
import type { NoticePageVo, NoticeDetailVo, NoticePageQuery } from "@/types/api";
import NoticeAPI from "@/api/system/notice";
import { useStomp } from "@/composables";
import router from "@/router";

const PAGE_SIZE = 5;

export function useNotice() {
  const { subscribe, unsubscribe, isConnected } = useStomp();

  // 状态
  const list = ref<NoticePageVo[]>([]);
  const detail = ref<NoticeDetailVo | null>(null);
  const dialogVisible = ref(false);

  let subscribed = false;

  // ============================================
  // 数据获取
  // ============================================

  async function fetchList(params?: Partial<NoticePageQuery>) {
    const query: NoticePageQuery = {
      pageNum: 1,
      pageSize: PAGE_SIZE,
      isRead: 0,
      ...params,
    } as NoticePageQuery;
    const page = await NoticeAPI.getMyNoticePage(query);
    list.value = page.list || [];
  }

  async function read(id: string) {
    detail.value = await NoticeAPI.getDetail(id);
    dialogVisible.value = true;

    // 从列表中移除已读项
    const idx = list.value.findIndex((item: NoticePageVo) => item.id === id);
    if (idx >= 0) list.value.splice(idx, 1);
  }

  async function readAll() {
    await NoticeAPI.readAll();
    list.value = [];
  }

  function goMore() {
    router.push({ name: "MyNotice" });
  }

  // ============================================
  // WebSocket 订阅
  // ============================================

  function setupSubscription() {
    if (subscribed || !isConnected.value) return;

    subscribe("/user/queue/message", (message: any) => {
      try {
        const data = JSON.parse(message.body || "{}");
        if (!data.id) return;

        // 避免重复
        if (list.value.some((item: NoticePageVo) => item.id === data.id)) return;

        list.value.unshift({
          id: data.id,
          title: data.title,
          type: data.type,
          publishTime: data.publishTime,
        } as NoticePageVo);

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

    subscribed = true;
  }

  // ============================================
  // 生命周期
  // ============================================

  onMounted(() => {
    fetchList();
    setupSubscription();
  });

  onBeforeUnmount(() => {
    unsubscribe("/user/queue/message");
    subscribed = false;
  });

  return {
    list,
    detail,
    dialogVisible,
    fetchList,
    read,
    readAll,
    goMore,
  };
}
