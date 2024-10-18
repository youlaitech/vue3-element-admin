import { store } from "@/store";
import DictionaryAPI, { type DictVO, type DictData } from "@/api/system/dict";

export const useDictStore = defineStore("dict", () => {
  const dictionary = useStorage<Record<string, DictData[]>>("dictionary", {});

  const setDictionary = (dict: DictVO) => {
    dictionary.value[dict.dictCode] = dict.dictDataList;
  };

  const loadDictionaries = async () => {
    const dictList = await DictionaryAPI.getList();
    dictList.forEach(setDictionary);
  };

  const getDictionary = (dictCode: string): DictData[] => {
    return dictionary.value[dictCode] || [];
  };

  const clearDictionaryCache = () => {
    dictionary.value = {};
  };

  const updateDictionaryCache = async () => {
    clearDictionaryCache(); // 先清除旧缓存
    await loadDictionaries(); // 重新加载最新字典数据
  };

  return {
    dictionary,
    setDictionary,
    loadDictionaries,
    getDictionary,
    clearDictionaryCache,
    updateDictionaryCache,
  };
});

export function useDictStoreHook() {
  return useDictStore(store);
}
