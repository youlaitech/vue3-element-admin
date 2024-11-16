<template>
  <div class="app-container">
    <div class="flex-x-between mb-10">
      <el-link
        href="https://gitee.com/youlaiorg/vue3-element-admin/blob/master/src/views/demo/curd/index.vue"
        type="primary"
        target="_blank"
      >
        示例源码 请点击>>>>
      </el-link>
      <el-button type="primary" plain round size="small" @click="isA = !isA">切换示例</el-button>
    </div>

    <!-- 列表 -->
    <template v-if="isA">
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
        <template #mobile="scope">
          <el-text>{{ scope.row[scope.prop] }}</el-text>
          <copy-button
            v-if="scope.row[scope.prop]"
            :text="scope.row[scope.prop]"
            style="margin-left: 2px"
          />
        </template>
      </page-content>

      <!-- 新增 -->
      <page-modal
        ref="addModalRef"
        :modal-config="addModalConfig"
        @submit-click="handleSubmitClick"
      >
        <template #gender="scope">
          <Dict v-model="scope.formData[scope.prop]" code="gender" />
        </template>
      </page-modal>

      <!-- 编辑 -->
      <page-modal
        ref="editModalRef"
        :modal-config="editModalConfig"
        @submit-click="handleSubmitClick"
      >
        <template #gender="scope">
          <Dict v-model="scope.formData[scope.prop]" code="gender" />
        </template>
      </page-modal>
    </template>
    <template v-else>
      <page-content
        ref="contentRef"
        :content-config="contentConfig2"
        @operat-click="handleOperatClick"
      >
        <template #status="scope">
          <el-tag :type="scope.row[scope.prop] == 1 ? 'success' : 'info'">
            {{ scope.row[scope.prop] == 1 ? "启用" : "禁用" }}
          </el-tag>
        </template>
      </page-content>
    </template>
  </div>
</template>

<script setup lang="ts">
import UserAPI from "@/api/system/user";
import DeptAPI from "@/api/system/dept";
import RoleAPI from "@/api/system/role";
import type { IObject, IOperatData } from "@/components/CURD/types";
import usePage from "@/components/CURD/usePage";
import addModalConfig from "./config/add";
import contentConfig from "./config/content";
import contentConfig2 from "./config/content2";
import editModalConfig from "./config/edit";
import searchConfig from "./config/search";

const {
  searchRef,
  contentRef,
  addModalRef,
  editModalRef,
  handleQueryClick,
  handleResetClick,
  // handleAddClick,
  // handleEditClick,
  handleSubmitClick,
  handleExportClick,
  handleSearchClick,
  handleFilterChange,
} = usePage();

// 新增
async function handleAddClick() {
  addModalRef.value?.setModalVisible();
  // 加载部门下拉数据源
  addModalConfig.formItems[2]!.attrs!.data = await DeptAPI.getOptions();
  // 加载角色下拉数据源
  addModalConfig.formItems[4]!.options = await RoleAPI.getOptions();
}
// 编辑
async function handleEditClick(row: IObject) {
  editModalRef.value?.setModalVisible();
  // 加载部门下拉数据源
  editModalConfig.formItems[2]!.attrs!.data = await DeptAPI.getOptions();
  // 加载角色下拉数据源
  editModalConfig.formItems[4]!.options = await RoleAPI.getOptions();
  // 根据id获取数据进行填充
  const data = await UserAPI.getFormData(row.id);
  editModalRef.value?.setFormData(data);
}
// 其他工具栏
function handleToolbarClick(name: string) {
  console.log(name);
  if (name === "custom1") {
    ElMessage.success("点击了自定义1按钮");
  }
}
// 其他操作列
function handleOperatClick(data: IOperatData) {
  console.log(data);
  // 重置密码
  if (data.name === "reset_pwd") {
    ElMessageBox.prompt("请输入用户「" + data.row.username + "」的新密码", "重置密码", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
    }).then(({ value }) => {
      if (!value || value.length < 6) {
        ElMessage.warning("密码至少需要6位字符，请重新输入");
        return false;
      }
      UserAPI.resetPassword(data.row.id, value).then(() => {
        ElMessage.success("密码重置成功，新密码是：" + value);
      });
    });
  }
}

// 切换示例
const isA = ref(true);
</script>
