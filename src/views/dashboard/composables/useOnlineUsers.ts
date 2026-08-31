import { onMounted, onUnmounted, readonly, ref } from "vue";
import { useSse } from "@/utils/sse";
import { SseTopics } from "@/enums/sse";

/**
 * 在线用户数组合式函数（页面级）
 *
 * 订阅 SSE 在线用户数事件，组件挂载时订阅、卸载时自动取消；
 * 进入页面后需等待下一次推送才有数据。
 */
export function useOnlineUsers() {
  const onlineUserCount = ref(0);

  const { isConnected, on } = useSse();

  let unsubscribe: (() => void) | null = null;

  const handleOnlineUsersMessage = (count: number) => {
    if (!Number.isFinite(count) || count < 0) return;
    onlineUserCount.value = count;
  };

  onMounted(() => {
    unsubscribe = on(SseTopics.ONLINE_USERS, handleOnlineUsersMessage);
  });

  onUnmounted(() => {
    unsubscribe?.();
    unsubscribe = null;
    onlineUserCount.value = 0;
  });

  return {
    onlineUserCount: readonly(onlineUserCount),
    isConnected,
  };
}
