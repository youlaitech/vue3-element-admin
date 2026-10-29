import { getCurrentScope, onScopeDispose, reactive, ref, shallowRef } from "vue";
import type { Ref } from "vue";
import { cloneDeep } from "lodash-es";
import type { PageQuery, PageResult } from "@/api/common";

/**
 * 分页查询只接收最近一次请求的结果；勾选与弹窗状态由页面持有。
 */
export function usePageTable<T, Q extends PageQuery = PageQuery>(
  options: UsePageTableOptions<T, Q>
): UsePageTableReturn<T, Q> {
  const { request, onBeforeReset } = options;
  const initialParams = cloneDeep(options.initialParams);
  const params = reactive(cloneDeep(initialParams)) as Q;
  const loading = ref(false);
  const list = shallowRef<T[]>([]);
  const total = ref(0);
  let requestSequence = 0;

  /**
   * 按当前条件查询；结果和 loading 只由最近一次请求更新。
   */
  async function fetchData(): Promise<void> {
    const sequence = ++requestSequence;
    // 请求使用独立快照，等待期间修改表单不会改变本次参数。
    const snapshot = cloneDeep(params);
    loading.value = true;
    try {
      const data = await request(snapshot);
      if (sequence !== requestSequence) return;
      list.value = data.list ?? [];
      total.value = data.total ?? 0;
    } finally {
      // 旧请求结束时，不能提前关闭新请求的 loading。
      if (sequence === requestSequence) loading.value = false;
    }
  }

  /**
   * 按当前条件查询第一页。
   */
  function handleQuery(): Promise<void> {
    params.pageNum = 1;
    return fetchData();
  }

  /**
   * 保持响应式引用，删除新增条件，并从独立初值恢复。
   */
  function resetParams(): void {
    requestSequence += 1;
    loading.value = false;
    Object.keys(params).forEach((key) => Reflect.deleteProperty(params, key));
    Object.assign(params, cloneDeep(initialParams));
  }

  /**
   * 重置查询条件并加载第一页。
   */
  function handleResetQuery(): Promise<void> {
    onBeforeReset?.();
    resetParams();
    return fetchData();
  }

  if (getCurrentScope()) {
    onScopeDispose(() => {
      requestSequence += 1;
    });
  }

  return { loading, list, total, params, fetchData, handleQuery, handleResetQuery, resetParams };
}

/**
 * 分页请求、查询初值与重置回调。
 */
export interface UsePageTableOptions<T, Q extends PageQuery> {
  /** 初值会深复制，请求和编辑不会改变重置基准。 */
  initialParams: Q;
  /**
   * 接收查询快照；请求异常由调用方处理。
   */
  request: (params: Q) => Promise<PageResult<T>>;
  /** 恢复参数前，同步重置页面自有的搜索控件。 */
  onBeforeReset?: () => void;
}

/**
 * 列表查询状态与分页操作。
 */
export interface UsePageTableReturn<T, Q extends PageQuery> {
  loading: Ref<boolean>;
  list: Ref<T[]>;
  total: Ref<number>;
  params: Q;
  fetchData: () => Promise<void>;
  /**
   * 回到第一页并查询。
   */
  handleQuery: () => Promise<void>;
  /**
   * 恢复初始条件后重新查询。
   */
  handleResetQuery: () => Promise<void>;
  /**
   * 仅恢复参数，不发请求。
   */
  resetParams: () => void;
}
