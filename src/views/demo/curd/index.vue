<template>
  <div class="app-container">
    <!-- 搜索 -->
    <page-search
      ref="searchRef"
      :search-config="searchConfig"
      @query-click="handleQueryClick"
      @reset-click="handleResetClick"
    />

    <!-- 列表 -->
    <page-content
      ref="contentRef"
      :content-config="contentConfig"
      @add-click="handleAddClick"
      @edit-click="handleEditClick"
      @export-click="handleExportClick"
      @toolbar-click="handleToolbarClick"
      @operat-click="handleOperatClick"
    >
      <template #status="scope">
        <el-tag :type="scope.row[scope.prop] == 1 ? 'success' : 'info'">{{
          scope.row[scope.prop] == 1 ? "启用" : "禁用"
        }}</el-tag>
      </template>
    </page-content>

    <!-- 新增 -->
    <page-modal
      ref="addModalRef"
      :modal-config="addModalConfig"
      @submit-click="handleSubmitClick"
    />

    <!-- 编辑 -->
    <page-modal
      ref="editModalRef"
      :modal-config="editModalConfig"
      @submit-click="handleSubmitClick"
    />
  </div>
</template>

<script setup lang="ts">
import searchConfig from "./config/search";
import contentConfig from "./config/content";
import addModalConfig from "./config/add";
import editModalConfig from "./config/edit";
import type PageSearch from "@/components/PageSearch/index.vue";
import type PageContent from "@/components/PageContent/index.vue";
import type PageModal from "@/components/PageModal/index.vue";

const searchRef = ref<InstanceType<typeof PageSearch>>();
const contentRef = ref<InstanceType<typeof PageContent>>();
const addModalRef = ref<InstanceType<typeof PageModal>>();

// 搜索
function handleQueryClick(queryParams: any) {
  contentRef.value?.fetchPageData(queryParams, true);
}
// 重置
function handleResetClick() {
  contentRef.value?.fetchPageData({}, true);
}
// 新增
function handleAddClick() {
  console.log("add");
  //显示添加表单
  addModalRef.value?.setModalVisible();
}
// 导出
function handleExportClick() {
  console.log("export", searchRef.value?.getQueryParams());
}
// 其他工具栏
function handleToolbarClick(name: string) {
  console.log(name);
}
// 编辑
const editModalRef = ref<InstanceType<typeof PageModal>>();
function handleEditClick() {
  //显示编辑表单或者根据id获取数据进行填充
  editModalRef.value?.setModalVisible({
    id: 2,
    username: "admin",
    nickname: "系统管理员",
    mobile: "17621210366",
    gender: 1,
    avatar:
      "https://oss.youlai.tech/youlai-boot/2023/05/16/811270ef31f548af9cffc026dfc3777b.gif",
    email: "",
    status: 1,
    deptId: 1,
    roleIds: [2],
  });
}
// 其他操作列
function handleOperatClick(data: any) {
  console.log(data.name, data.row);
}
// 表单提交
function handleSubmitClick() {
  //刷新别表数据
  console.log("submit");
  contentRef.value?.fetchPageData({}, true);
}
</script>
