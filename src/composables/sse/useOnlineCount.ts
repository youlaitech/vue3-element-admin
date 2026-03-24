import { ref, onMounted, getCurrentInstance } from "vue";
import { useSse } from "./useSse";

let globalInstance: ReturnType<typeof createOnlineCountComposable> | null = null;

function createOnlineCountComposable() {
  const onlineUserCount = ref(0);
  const lastUpdateTime = ref(0);

  const sse = useSse();

  let unsubscribe: (() => void) | null = null;

  const handleOnlineCountMessage = (count: number) => {
    if (count !== undefined && !isNaN(count)) {
      onlineUserCount.value = count;
      lastUpdateTime.value = Date.now();
    }
  };

  const initialize = () => {
    sse.connect();
    unsubscribe = sse.on("online-count", handleOnlineCountMessage);
  };

  const cleanup = () => {
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }
    onlineUserCount.value = 0;
    lastUpdateTime.value = 0;
  };

  return {
    onlineUserCount: readonly(onlineUserCount),
    lastUpdateTime: readonly(lastUpdateTime),
    isConnected: sse.isConnected,
    connectionState: sse.connectionState,
    initialize,
    cleanup,
  };
}

/**
 * 在线用户计数组合式函数（单例模式）
 */
export function useOnlineCount(options: { autoInit?: boolean } = {}) {
  const { autoInit = true } = options;

  if (!globalInstance) {
    globalInstance = createOnlineCountComposable();
  }

  const instance = getCurrentInstance();
  if (autoInit && instance) {
    onMounted(() => {
      if (!globalInstance!.isConnected.value) {
        globalInstance!.initialize();
      }
    });
  }

  return globalInstance;
}
