import { useDictStoreHook } from "@/stores/dict";
import { useSse } from "./useSse";

export interface DictChangeMessage {
  dictCode: string;
  timestamp: number;
}

export type DictMessage = DictChangeMessage;

export type DictChangeCallback = (message: DictChangeMessage) => void;

let singletonInstance: ReturnType<typeof createDictSyncComposable> | null = null;

function createDictSyncComposable() {
  const dictStore = useDictStoreHook();
  const sse = useSse();

  const messageCallbacks = ref<DictChangeCallback[]>([]);

  let unsubscribe: (() => void) | null = null;

  const handleDictChangeMessage = (data: DictChangeMessage) => {
    const { dictCode } = data;

    if (!dictCode) {
      console.warn("[DictSync] 收到无效的字典变更消息：缺少 dictCode");
      return;
    }

    dictStore.removeDictItem(dictCode);

    messageCallbacks.value.forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error("[DictSync] 回调函数执行失败:", error);
      }
    });
  };

  const initialize = () => {
    sse.connect();
    unsubscribe = sse.on("dict", handleDictChangeMessage);
  };

  const cleanup = () => {
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }
    messageCallbacks.value = [];
  };

  const onDictChange = (callback: DictChangeCallback) => {
    messageCallbacks.value.push(callback);

    return () => {
      const index = messageCallbacks.value.indexOf(callback);
      if (index !== -1) {
        messageCallbacks.value.splice(index, 1);
      }
    };
  };

  return {
    isConnected: sse.isConnected,
    connectionState: sse.connectionState,
    initialize,
    cleanup,
    onDictChange,
  };
}

/**
 * 字典同步组合式函数（单例模式）
 */
export function useDictSync() {
  if (!singletonInstance) {
    singletonInstance = createDictSyncComposable();
  }
  return singletonInstance;
}
