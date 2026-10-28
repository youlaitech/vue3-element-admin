import { store } from "@/stores";
import DictAPI from "@/api/system/dict";
import type { DictItemOption } from "@/api/system/dict";
import { STORAGE_KEYS } from "@/constants";

/**
 * 字典变更消息体
 */
export interface DictChangeMessage {
  /** 字典编码 */
  dictCode: string;
}

/**
 * 字典变更回调函数类型
 */
export type DictChangeCallback = (message: DictChangeMessage) => void;

/**
 * 管理字典缓存、失效标记和在途查询。
 */
export const useDictStore = defineStore("dict", () => {
  // 字典数据缓存
  const dictCache = useStorage<Record<string, DictItemOption[]>>(STORAGE_KEYS.DICT_CACHE, {});

  const pendingRequests = new Map<string, Promise<void>>();
  // 编码版本隔离局部失效；缓存版本隔离退出登录等整批清理。
  const dictVersions = new Map<string, number>();
  const dictChangeCallbacks = new Set<DictChangeCallback>();
  let cacheVersion = 0;

  /**
   * 按需加载字典，同一编码只保留一个在途请求。
   */
  const loadDictItems = async (dictCode: string) => {
    if (dictCache.value[dictCode]) return;

    let request = pendingRequests.get(dictCode);
    if (!request) {
      const requestCacheVersion = cacheVersion;
      const requestDictVersion = dictVersions.get(dictCode) ?? 0;

      request = (async () => {
        let version = requestDictVersion;
        while (requestCacheVersion === cacheVersion) {
          const data = await DictAPI.getDictItems(dictCode);
          if (requestCacheVersion !== cacheVersion) return;
          if (version === (dictVersions.get(dictCode) ?? 0)) {
            dictCache.value[dictCode] = data;
            return;
          }
          // 只合并补拉最新版本，旧响应不回填。
          version = dictVersions.get(dictCode) ?? 0;
        }
      })().finally(() => {
        // 只移除本次任务，避免旧任务结束时删掉清理后新建的请求。
        if (pendingRequests.get(dictCode) === request) pendingRequests.delete(dictCode);
      });
      pendingRequests.set(dictCode, request);
    }
    await request;
  };

  /**
   * 复用字典缓存与在途请求，丢弃失效后的旧响应。
   */
  const getDictItems = (dictCode: string): DictItemOption[] => {
    return dictCache.value[dictCode] || [];
  };

  /**
   * 清空缓存并使旧请求失效；不取消已发出的 HTTP 请求。
   */
  const clearDictCache = () => {
    cacheVersion += 1;
    pendingRequests.clear();
    dictVersions.clear();
    dictCache.value = {};
  };

  /**
   * 使指定字典失效，并通知正在展示该字典的页面。
   */
  const invalidateDict = (dictCode: string) => {
    const wasLoaded = !!dictCache.value[dictCode] || pendingRequests.has(dictCode);
    dictVersions.set(dictCode, (dictVersions.get(dictCode) ?? 0) + 1);
    Reflect.deleteProperty(dictCache.value, dictCode);
    if (wasLoaded) {
      void loadDictItems(dictCode).catch(() => console.warn("[DictStore] 字典刷新失败"));
    }
    const message: DictChangeMessage = { dictCode };
    for (const callback of dictChangeCallbacks) {
      try {
        callback(message);
      } catch (error) {
        console.error("[DictStore] 字典变更回调执行失败", error);
      }
    }
  };

  /**
   * 重新加载已使用的字典。
   */
  const refreshCachedDicts = () => {
    new Set([...Object.keys(dictCache.value), ...pendingRequests.keys()]).forEach(invalidateDict);
  };

  /**
   * 订阅字典变更，并返回取消订阅函数。
   */
  const onDictChange = (callback: DictChangeCallback) => {
    dictChangeCallbacks.add(callback);
    return () => {
      dictChangeCallbacks.delete(callback);
    };
  };

  return {
    loadDictItems,
    getDictItems,
    clearDictCache,
    invalidateDict,
    refreshCachedDicts,
    onDictChange,
  };
});

/**
 * 在组件外拿 dict store 实例
 */
export function useDictStoreHook() {
  return useDictStore(store);
}
