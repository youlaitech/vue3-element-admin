import { computed } from "vue";
import { useRealtime } from "@/composables/useRealtime";

/**
 * 读取当前节点的在线用户数和连接状态。
 */
export function useOnlineUserCount() {
  const { presence, isConnected } = useRealtime();

  return {
    onlineUserCount: computed(() => presence.value?.onlineUsers ?? null),
    presence,
    isConnected,
  };
}
