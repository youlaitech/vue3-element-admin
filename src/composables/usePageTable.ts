import { reactive, ref, type Ref } from "vue";

import type { BaseQueryParams, PageResult } from "@/api/common";

/**
 * 分页列表页通用状态管理
 *
 * 只管理请求、分页数据和查询参数，不处理勾选、弹窗、表单
 */
export function usePageTable<T, Q extends BaseQueryParams = BaseQueryParams>(
  options: UsePageTableOptions<T, Q>
): UsePageTableReturn<T, Q> {
  const { initialParams, request, onBeforeReset } = options;

  const loading = ref(false);
  const list = ref<T[]>([]) as Ref<T[]>;
  const total = ref(0);
  const params = reactive({ ...initialParams }) as Q;

  /**
   * 拉取当前查询参数对应的分页数据
   *
   * 只负责请求和回填，不处理弹窗、路由或消息提示
   */
  async function fetchData(): Promise<void> {
    loading.value = true;
    try {
      const data = await request(params);
      list.value = data.list ?? [];
      total.value = data.total ?? 0;
    } finally {
      loading.value = false;
    }
  }

  /**
   * 回到第一页并查询
   */
  function handleQuery(): void {
    params.pageNum = 1;
    fetchData();
  }

  /**
   * 恢复初始查询参数
   *
   * 保持响应式引用不变，不触发查询
   */
  function resetParams(): void {
    Object.assign(params, initialParams);
  }

  /**
   * 恢复初始查询参数并重新查询
   */
  function handleResetQuery(): void {
    onBeforeReset?.();
    resetParams();
    fetchData();
  }

  return {
    loading,
    list,
    total,
    params,
    fetchData,
    handleQuery,
    handleResetQuery,
    resetParams,
  };
}

export interface UsePageTableOptions<T, Q extends BaseQueryParams> {
  /** 初始查询参数，同时作为重置基准 */
  initialParams: Q;
  /**
   * 分页请求函数
   */
  request: (params: Q) => Promise<PageResult<T>>;
  /**
   * 重置查询前的回调
   *
   * 常用于同步重置搜索表单字段
   */
  onBeforeReset?: () => void;
}

export interface UsePageTableReturn<T, Q extends BaseQueryParams> {
  /** 加载状态 */
  loading: Ref<boolean>;
  /** 当前页数据列表 */
  list: Ref<T[]>;
  /** 数据总条数 */
  total: Ref<number>;
  /** 当前查询参数 */
  params: Q;
  /**
   * 拉取分页数据
   */
  fetchData: () => Promise<void>;
  /**
   * 回到第一页并查询
   */
  handleQuery: () => void;
  /**
   * 恢复初始参数并重新查询
   */
  handleResetQuery: () => void;
  /**
   * 恢复初始参数但不触发查询
   */
  resetParams: () => void;
}
