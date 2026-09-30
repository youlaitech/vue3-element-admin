<template>
  <div class="page-container">
    <el-card class="page-content" shadow="never">
      <template #header>编辑成员信息</template>

      <el-form :model="formData" label-width="80px">
        <el-form-item label="姓名">
          <el-input v-model="formData.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="部门">
          <el-input v-model="formData.dept" placeholder="请输入部门" />
        </el-form-item>
        <el-form-item label="岗位">
          <el-input v-model="formData.post" placeholder="请输入岗位" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSubmit">保存并返回</el-button>
          <el-button @click="handleCancel">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus";

import router from "@/router";

import { getMember, updateMember } from "./data";
import type { MemberItem } from "./data";

defineOptions({
  name: "RouteExampleEdit",
});

const route = useRoute();

const formData = reactive<MemberItem>({ id: 0, name: "", dept: "", post: "" });

onMounted(() => {
  const member = getMember(Number(route.params.id));
  if (!member) {
    ElMessage.warning("记录不存在");
    router.back();
    return;
  }
  Object.assign(formData, member);
});

/**
 * 保存编辑并返回列表
 */
function handleSubmit(): void {
  updateMember({ ...formData });
  ElMessage.success("保存成功");
  router.back();
}

/**
 * 取消编辑并返回列表
 */
function handleCancel(): void {
  router.back();
}
</script>
