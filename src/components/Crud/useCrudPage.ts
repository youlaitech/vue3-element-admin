import { ref, type Ref } from "vue";
import type { CrudRecord, CrudTableInstance, CrudFormInstance, CrudSearchInstance } from "./types";

/**
 * 连接搜索、表格与共用表单。
 */
function useCrudPage() {
  const searchRef = ref<CrudSearchInstance>();
  const tableRef = ref<CrudTableInstance>();
  const formRef = ref<CrudFormInstance>();

  /**
   * 应用查询并回到第一页；不传参数时读取搜索草稿。
   */
  async function search(queryParams = searchRef.value?.getQueryParams() ?? {}): Promise<void> {
    await tableRef.value?.loadData(queryParams, true).catch(() => undefined);
  }

  /**
   * 恢复搜索初值、清除表头筛选并重新查询。
   */
  async function resetSearch(queryParams?: CrudRecord): Promise<void> {
    const values = queryParams ?? searchRef.value?.reset() ?? {};
    tableRef.value?.clearFilters();
    await search(values);
  }

  /**
   * 重建初值并打开新增表单。
   */
  function openCreate(target: Ref<CrudFormInstance | undefined> = formRef): void {
    target.value?.openForm("create");
  }

  /**
   * 打开表单并加载详情，省略加载器时使用当前行。
   */
  async function openRecord(
    mode: "edit" | "view",
    row: CrudRecord,
    loader?: (row: CrudRecord) => CrudRecord | Promise<CrudRecord>,
    target: Ref<CrudFormInstance | undefined> = formRef,
  ): Promise<void> {
    const form = target.value;
    if (!form?.openForm(mode, row)) return;
    await form.loadFormData(async () => (loader ? await loader(row) : row));
  }

  /**
   * 打开编辑表单，可按需加载完整详情。
   */
  function openEdit(
    row: CrudRecord,
    loader?: (row: CrudRecord) => CrudRecord | Promise<CrudRecord>,
    target?: Ref<CrudFormInstance | undefined>,
  ): Promise<void> {
    return openRecord("edit", row, loader, target);
  }

  /**
   * 打开只读表单，可按需加载完整详情。
   */
  function openView(
    row: CrudRecord,
    loader?: (row: CrudRecord) => CrudRecord | Promise<CrudRecord>,
    target?: Ref<CrudFormInstance | undefined>,
  ): Promise<void> {
    return openRecord("view", row, loader, target);
  }

  /**
   * 沿用已应用条件刷新；查询失败由表格显示。
   */
  async function refresh(): Promise<void> {
    await tableRef.value?.refresh().catch(() => undefined);
  }

  /**
   * 使用已成功查询的条件下载服务端文件。
   */
  async function exportFile(): Promise<void> {
    await tableRef.value?.exportFile();
  }

  /**
   * 切换搜索区域。
   */
  function toggleSearch(): void {
    searchRef.value?.toggleVisible();
  }

  /**
   * 应用表头筛选，保留已提交搜索并回到第一页。
   */
  async function applyFilters(): Promise<void> {
    await tableRef.value?.refresh(true).catch(() => undefined);
  }

  return {
    searchRef,
    tableRef,
    formRef,
    search,
    resetSearch,
    refresh,
    openCreate,
    openEdit,
    openView,
    exportFile,
    toggleSearch,
    applyFilters,
  };
}

export default useCrudPage;
