<template>
  <div class="app-container h-full flex flex-1 flex-col">
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
        @export-click="handleExportClick"
        @search-click="handleSearchClick"
        @toolbar-click="handleToolbarClick"
        @operate-click="handleOperateClick"
        @filter-change="handleFilterChange"
      >
        <template #status="scope">
          <el-tag :type="scope.row[scope.prop] == 1 ? 'success' : 'info'">
            {{ scope.row[scope.prop] == 1 ? "启用" : "禁用" }}
          </el-tag>
        </template>
        <template #gender="scope">
          <DictLabel v-model="scope.row[scope.prop]" code="gender" />
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
          <Dict v-model="scope.formData[scope.prop]" code="gender" v-bind="scope.attrs" />
        </template>
        <template #openModal>
          <el-button type="primary" @click="openSecondModal">打开二级弹窗</el-button>
        </template>
      </page-modal>

      <!-- 二级弹窗 -->
      <page-modal ref="addModalRef2" :modal-config="addModalConfig2" @custom-submit="secondSubmit">
        <template #gender="scope">
          <Dict v-model="scope.formData[scope.prop]" code="gender" v-bind="scope.attrs" />
        </template>
      </page-modal>

      <!-- 编辑 -->
      <page-modal
        ref="editModalRef"
        :modal-config="editModalConfig"
        @submit-click="handleSubmitClick"
      >
        <template #gender="scope">
          <Dict v-model="scope.formData[scope.prop]" code="gender" v-bind="scope.attrs" />
        </template>
      </page-modal>
    </template>
    <template v-else>
      <page-search ref="searchRef" :search-config="searchConfig2" @reset-click="handleResetClick" />

      <page-content
        ref="contentRef"
        :content-config="contentConfig2"
        @operate-click="handleOperateClick2"
      >
        <template #status="scope">
          <el-tag :type="scope.row[scope.prop] == 1 ? 'success' : 'info'">
            {{ scope.row[scope.prop] == 1 ? "启用" : "禁用" }}
          </el-tag>
        </template>
      </page-content>

      <page-modal ref="editModalRef" :modal-config="editModalConfig2">
        <template #suffix>
          <span style="color: black">%</span>
        </template>
        <template #prefix>
          <span>$</span>
        </template>
        <template #gender="scope">
          <Dict v-model="scope.formData[scope.prop]" code="gender" v-bind="scope.attrs" />
        </template>
      </page-modal>
    </template>
  </div>
</template>

<script setup lang="ts">
import UserAPI from "@/api/system/user.api";
import type { IObject, IOperateData, PageModalInstance } from "@/components/CURD/types";
import usePage from "@/components/CURD/usePage";
import addModalConfig from "./config/add";
import contentConfig from "./config/content";
import editModalConfig from "./config/edit";
import searchConfig from "./config/search";
import { initOptions } from "./config/options";

import addModalConfig2 from "./config2/add";
import contentConfig2 from "./config2/content";
import editModalConfig2 from "./config2/edit";
import searchConfig2 from "./config2/search";

const {
  searchRef,
  contentRef,
  addModalRef,
  editModalRef,
  handleQueryClick,
  handleResetClick,
  handleAddClick,
  handleEditClick,
  handleViewClick,
  handleSubmitClick,
  handleExportClick,
  handleSearchClick,
  handleFilterChange,
} = usePage();

// 其他工具栏
function handleToolbarClick(name: string) {
  console.log(name);
  if (name === "custom1") {
    ElMessage.success("点击了自定义1按钮");
  }
}

// 表格工具栏
const handleOperateClick = (data: IObject) => {
  if (data.name === "detail") {
    editModalConfig.drawer = { ...editModalConfig.drawer, title: "查看" };
    handleViewClick(data.row, async () => {
      // 加载下拉数据源，建议在初始化配置项 initFn 中加载，避免多次请求
      // editModalConfig.formItems[2]!.attrs!.data = await DeptAPI.getOptions();
      return await UserAPI.getFormData(data.row.id); // 根据ID获取详情
    });
  } else if (data.name === "edit") {
    editModalConfig.drawer = { ...editModalConfig.drawer, title: "修改" };
    handleEditClick(data.row, async () => {
      return await UserAPI.getFormData(data.row.id); // 根据ID获取详情
    });
  } else if (data.name === "reset_pwd") {
    ElMessageBox.prompt("请输入用户「" + data.row.username + "」的新密码", "重置密码", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
    })
      .then(({ value }) => {
        if (!value || value.length < 6) {
          ElMessage.warning("密码至少需要6位字符，请重新输入");
          return false;
        }
        UserAPI.resetPassword(data.row.id, value).then(() => {
          ElMessage.success("密码重置成功，新密码是：" + value);
        });
      })
      .catch(() => {});
  }
};
const handleOperateClick2 = (data: IOperateData) => {
  if (data.name === "view") {
    editModalConfig.drawer = { ...editModalConfig.drawer, title: "查看" };
    handleViewClick(data.row);
  } else if (data.name === "edit") {
    editModalConfig.drawer = { ...editModalConfig.drawer, title: "修改" };
    handleEditClick(data.row);
  } else if (data.name === "delete") {
    ElMessage.success("模拟删除成功");
  }
};

// 打开二级弹窗
const addModalRef2 = ref();
const openSecondModal = () => {
  handleAddClick(addModalRef2 as Ref<PageModalInstance>);
};
const secondSubmit = (formData: any) => {
  console.log("secondSubmit", formData);
  ElMessage.success("二级弹窗提交成功");
};

// 切换示例
const isA = ref(true);

onMounted(() => {
  initOptions();
});
</script>
