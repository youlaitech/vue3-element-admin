import { ref } from "vue";
import type PageSearch from "@/components/PageSearch/index.vue";
import type PageContent from "@/components/PageContent/index.vue";
import type PageModal from "@/components/PageModal/index.vue";
import type { IOperatData, IObject } from "@/components/PageContent/index.vue";
export type { IOperatData, IObject };

function usePage() {
  const searchRef = ref<InstanceType<typeof PageSearch>>();
  const contentRef = ref<InstanceType<typeof PageContent>>();
  const addModalRef = ref<InstanceType<typeof PageModal>>();
  const editModalRef = ref<InstanceType<typeof PageModal>>();

  // 搜索
  function handleQueryClick(queryParams: IObject) {
    contentRef.value?.fetchPageData(queryParams, true);
  }
  // 重置
  function handleResetClick() {
    contentRef.value?.fetchPageData({}, true);
  }
  // 新增
  function handleAddClick() {
    //显示添加表单
    addModalRef.value?.setModalVisible();
  }
  // 编辑
  function handleEditClick(row: IObject) {
    //显示编辑表单 根据数据进行填充
    editModalRef.value?.setModalVisible(row);
  }
  // 表单提交
  function handleSubmitClick() {
    //刷新列表数据
    contentRef.value?.fetchPageData({}, true);
  }
  // 导出
  function handleExportClick() {
    // 根据检索条件导出数据
    const queryParams = searchRef.value?.getQueryParams();
    contentRef.value?.exportPageData(queryParams);
  }
  // 搜索显隐
  function handleSearchClick() {
    searchRef.value?.toggleVisible();
  }

  return {
    searchRef,
    contentRef,
    addModalRef,
    editModalRef,
    handleQueryClick,
    handleResetClick,
    handleAddClick,
    handleEditClick,
    handleSubmitClick,
    handleExportClick,
    handleSearchClick,
  };
}

export default usePage;
