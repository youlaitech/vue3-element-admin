/**
 * 通知中心逻辑
 */
import { ref, onMounted, onBeforeUnmount } from "vue";
import type { NoticeItem, NoticeDetail, NoticeQueryParams } from "@/types/api";
import NoticeAPI from "@/api/system/notice";
import { useSse } from "@/composables";
import router from "@/router";

const PAGE_SIZE = 5;

// SSE 事件名称：通知消息
const NOTICE_EVENT = "notice";

export function useNotice() {
  const { on, isConnected } = useSse();

  // 状态
  const list = ref<NoticeItem[]>([]);
  const unreadTotal = ref(0);
  const detail = ref<NoticeDetail | null>(null);
  const dialogVisible = ref(false);

  let unsubscribe: (() => void) | null = null;

  // ============================================
  // 数据获取
  // ============================================

  async function fetchList(params?: Partial<NoticeQueryParams>) {
    const query: NoticeQueryParams = {
      pageNum: 1,
      pageSize: PAGE_SIZE,
      isRead: 0,
      ...params,
    };
    const page = await NoticeAPI.getMyNoticePage(query);
    list.value = page.list || [];
    unreadTotal.value = page.total ?? 0;
  }

  async function read(id: string) {
    detail.value = await NoticeAPI.getDetail(id);
    dialogVisible.value = true;

    // 从列表中移除已读项
    const idx = list.value.findIndex((item: NoticeItem) => item.id === id);
    if (idx >= 0) list.value.splice(idx, 1);
    if (unreadTotal.value > 0) unreadTotal.value -= 1;

    await fetchList();
  }

  async function readAll() {
    await NoticeAPI.readAll();
    list.value = [];
    unreadTotal.value = 0;
    ElMessage.success("已全部标记为已读");
  }

  function goMore() {
    router.push({ name: "MyNotice" });
  }

  // ============================================
  // SSE 订阅
  // ============================================

  function setupSubscription() {
    if (unsubscribe) return;

    // 订阅新通知事件
    unsubscribe = on(NOTICE_EVENT, (data: any) => {
      try {
        if (!data.id) return;

        // 避免重复
        if (list.value.some((item: NoticeItem) => item.id === data.id)) return;

        unreadTotal.value += 1;

        list.value.unshift({
          id: data.id,
          title: data.title,
          type: data.type,
          publishTime: data.publishTime,
        } as NoticeItem);

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

    // 订阅撤回通知事件
    on("notice-revoke", (data: any) => {
      try {
        if (!data.id) return;

        // 从列表中移除已撤回的通知
        const idx = list.value.findIndex((item: NoticeItem) => item.id === data.id);
        if (idx >= 0) {
          list.value.splice(idx, 1);
          if (unreadTotal.value > 0) unreadTotal.value -= 1;
        }
      } catch (e) {
        console.error("处理撤回通知失败", e);
      }
    });
  }

  // ============================================
  // 生命周期
  // ============================================

  onMounted(() => {
    fetchList();
    setupSubscription();
  });

  onBeforeUnmount(() => {
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }
  });

  return {
    list,
    unreadTotal,
    detail,
    dialogVisible,
    fetchList,
    read,
    readAll,
    goMore,
  };
}
