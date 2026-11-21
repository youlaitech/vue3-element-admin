import { computed, shallowRef } from "vue";
import { useRealtime } from "@/composables/useRealtime";
import type { PresenceSnapshot } from "@/utils/realtime/protocol";

/**
 * 读取当前节点的在线用户数和连接状态
 *
 * 实时上下文缺失时（HMR 重挂载、未登录、降级）返回空状态，
 * 避免整个工作台因实时通道不可用而渲染失败
 */
export function useOnlineUserCount() {
  try {
    const { presence, isConnected } = useRealtime();

    return {
      onlineUserCount: computed(() => presence.value?.onlineUsers ?? null),
      presence,
      isConnected,
    };
  } catch {
    return {
      onlineUserCount: computed(() => null),
      presence: shallowRef<PresenceSnapshot | null>(null),
      isConnected: shallowRef(false),
    };
  }
}
