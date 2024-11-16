<template>
  <el-dropdown trigger="click">
    <div class="flex-center h100% p13px">
      <img :src="userStore.userInfo.avatar" class="rounded-full mr-10px w24px h24px" />
      <span>{{ userStore.userInfo.username }}</span>
    </div>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item @click="handleOpenUserProfile">
          {{ $t("navbar.profile") }}
        </el-dropdown-item>
        <a target="_blank" href="https://gitee.com/youlaiorg/vue3-element-admin">
          <el-dropdown-item>{{ $t("navbar.gitee") }}</el-dropdown-item>
        </a>
        <a target="_blank" href="https://juejin.cn/post/7228990409909108793">
          <el-dropdown-item>{{ $t("navbar.document") }}</el-dropdown-item>
        </a>
        <el-dropdown-item divided @click="logout">
          {{ $t("navbar.logout") }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
defineOptions({
  name: "UserProfile",
});

import { useTagsViewStore, useUserStore } from "@/store";

const tagsViewStore = useTagsViewStore();
const userStore = useUserStore();

const route = useRoute();
const router = useRouter();

/**
 * 打开个人中心页面
 */
function handleOpenUserProfile() {
  router.push({ name: "Profile" });
}

/**
 * 注销登出
 */
function logout() {
  ElMessageBox.confirm("确定注销并退出系统吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
    lockScroll: false,
  }).then(() => {
    userStore
      .logout()
      .then(() => {
        tagsViewStore.delAllViews();
      })
      .then(() => {
        router.push(`/login?redirect=${route.fullPath}`);
      });
  });
}
</script>

<style lang="scss" scoped></style>
