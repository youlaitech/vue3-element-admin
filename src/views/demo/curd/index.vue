<template>
  <div class="app-container">
    <el-link
      href="https://gitee.com/youlaiorg/vue3-element-admin/blob/master/src/views/demo/curd/index.vue"
      type="primary"
      target="_blank"
      class="mb-10"
    >
      示例源码 请点击>>>>
    </el-link>

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
      @search-click="handleSearchClick"
      @toolbar-click="handleToolbarClick"
      @operat-click="handleOperatClick"
      @filter-change="handleFilterChange"
    >
      <template #status="scope">
        <el-tag :type="scope.row[scope.prop] == 1 ? 'success' : 'info'">
          {{ scope.row[scope.prop] == 1 ? "启用" : "禁用" }}
        </el-tag>
      </template>
    </page-content>

    <!-- 新增 -->
    <page-modal
      ref="addModalRef"
      :modal-config="addModalConfig"
      @submit-click="handleSubmitClick"
    >
      <template #gender="scope">
        <dictionary v-model="scope.formData[scope.prop]" type-code="gender" />
      </template>
    </page-modal>

    <!-- 编辑 -->
    <page-modal
      ref="editModalRef"
      :modal-config="editModalConfig"
      @submit-click="handleSubmitClick"
    >
      <template #gender="scope">
        <dictionary v-model="scope.formData[scope.prop]" type-code="gender" />
      </template>
    </page-modal>
  </div>
</template>

<script setup lang="ts">
import UserAPI from "@/api/user";
import type { IObject, IOperatData } from "@/hooks/usePage";
import usePage from "@/hooks/usePage";
import addModalConfig from "./config/add";
import contentConfig from "./config/content";
// import contentConfig from "./config/content2";
import editModalConfig from "./config/edit";
import searchConfig from "./config/search";

const {
  searchRef,
  contentRef,
  addModalRef,
  editModalRef,
  handleQueryClick,
  handleResetClick,
  handleAddClick,
  // handleEditClick,
  handleSubmitClick,
  handleExportClick,
  handleSearchClick,
  handleFilterChange,
} = usePage();
// 编辑
async function handleEditClick(row: IObject) {
  // 根据id获取数据进行填充
  const data = await UserAPI.getFormData(row.id);
  editModalRef.value?.setModalVisible(data);
}
// 其他工具栏
function handleToolbarClick(name: string) {
  console.log(name);
  if (name === "import") {
    ElMessage.success("点击了导入按钮");
  }
}
// 其他操作列
function handleOperatClick(data: IOperatData) {
  console.log(data);
  // 重置密码
  if (data.name === "reset_pwd") {
    ElMessageBox.prompt(
      "请输入用户「" + data.row.username + "」的新密码",
      "重置密码",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
      }
    ).then(({ value }) => {
      if (!value || value.length < 6) {
        ElMessage.warning("密码至少需要6位字符，请重新输入");
        return false;
      }
      UserAPI.updatePassword(data.row.id, value).then(() => {
        ElMessage.success("密码重置成功，新密码是：" + value);
      });
    });
  }
}
</script>
