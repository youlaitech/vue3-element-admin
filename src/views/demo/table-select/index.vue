<!-- 列表选择器示�?-->
<template>
  <div class="app-container">
    <el-link
      href="https://gitee.com/youlaiorg/vue3-element-admin/blob/master/src/views/demo/table-select/index.vue"
      type="primary"
      target="_blank"
      class="mb-10"
    >
      示例源码 请点�?>>>
    </el-link>
    <table-select :text="text" :select-config="selectConfig" @confirm-click="handleConfirm">
      <template #status="scope">
        <el-tag :type="scope.row[scope.prop] == 1 ? 'success' : 'info'">
          {{ scope.row[scope.prop] == 1 ? "启用" : "禁用" }}
        </el-tag>
      </template>
      <template #gender="scope">
        <DictTag v-model="scope.row.gender" code="gender" />
      </template>
    </table-select>
  </div>
</template>

<script setup lang="ts">
import selectConfig from "./config/select";
import { useDictStore } from "@/store";
const dictStore = useDictStore();
interface IUser {
  id: string;
  username: string;
  nickname: string;
  mobile: string;
  gender: string;
  avatar: string;
  email: string | null;
  status: number;
  deptName: string;
  roleNames: string;
  createTime: string;
}
const selectedUser = ref<IUser>();
function handleConfirm(data: IUser[]) {
  selectedUser.value = data[0];
}
const text = computed(() => {
  // 获取字典数据
  const dictData = dictStore.getDictItems("gender");
  const genderLabel = dictData.find((item: any) => item.value == selectedUser.value?.gender)?.label;
  return selectedUser.value
    ? `${selectedUser.value.username} - ${genderLabel} - ${selectedUser.value.deptName}`
    : "";
});
</script>
