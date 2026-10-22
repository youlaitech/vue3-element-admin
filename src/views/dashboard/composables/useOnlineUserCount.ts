import { onMounted, onUnmounted, readonly, ref } from "vue";
import { useSse } from "@/utils/sse";
import { SseTopics } from "@/enums/sse";

/**
 * 订阅在线用户数推送，首次推送前人数为 null
 */
export function useOnlineUserCount() {
  const onlineUserCount = ref<number | null>(null);

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
    onlineUserCount.value = null;
  });

  return {
    onlineUserCount: readonly(onlineUserCount),
    isConnected,
  };
}
