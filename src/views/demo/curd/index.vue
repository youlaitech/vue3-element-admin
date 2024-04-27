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
import usePage from "@/hooks/usePage";
import type { IOperatData, IObject } from "@/hooks/usePage";

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
} = usePage();
// 编辑
function handleEditClick(row: IObject) {
  // 模拟根据id获取数据进行填充
  const idMap: IObject = {
    2: {
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
    },
    3: {
      id: 3,
      username: "test",
      nickname: "测试小用户",
      mobile: "17621210366",
      gender: 1,
      avatar:
        "https://oss.youlai.tech/youlai-boot/2023/05/16/811270ef31f548af9cffc026dfc3777b.gif",
      email: "youlaitech@163.com",
      status: 1,
      deptId: 3,
      roleIds: [3],
    },
  };
  editModalRef.value?.setModalVisible(idMap[row.id]);
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
      if (!value) {
        ElMessage.warning("请输入新密码");
        return false;
      }
      // 发送网络请求
      ElMessage.success("密码重置成功，新密码是：" + value);
    });
  }
}
</script>
