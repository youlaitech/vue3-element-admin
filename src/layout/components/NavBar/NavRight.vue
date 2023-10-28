<template>
  <!-- 导航栏设置(窄屏隐藏)-->
  <div v-if="device !== 'mobile'" class="setting-container">
    <!--全屏 -->
    <div class="setting-item" @click="toggle">
      <svg-icon :icon-class="isFullscreen ? 'exit-fullscreen' : 'fullscreen'" />
    </div>
    <!-- 布局大小 -->
    <el-tooltip content="布局大小" effect="dark" placement="bottom">
      <size-select class="setting-item" />
    </el-tooltip>
  </div>

  <!-- 用户头像 -->
  <el-dropdown trigger="click">
    <div class="avatar-container">
      <img :src="userStore.user.avatar + '?imageView2/1/w/80/h/80'" />
      <i-ep-caret-bottom class="w-3 h-3" />
    </div>
    <template #dropdown>
      <el-dropdown-menu>
        <router-link to="/">
          <el-dropdown-item>{{ $t("navbar.dashboard") }}</el-dropdown-item>
        </router-link>
        <a
          target="_blank"
          href="https://github.com/youlaitech/vue3-element-admin"
        >
          <el-dropdown-item>Github</el-dropdown-item>
        </a>
        <a target="_blank" href="https://gitee.com/haoxr">
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
import { storeToRefs } from "pinia";
import { useRoute, useRouter } from "vue-router";
import { useAppStore } from "@/store/modules/app";
import { useTagsViewStore } from "@/store/modules/tagsView";
import { useUserStore } from "@/store/modules/user";

const appStore = useAppStore();
const tagsViewStore = useTagsViewStore();
const userStore = useUserStore();

const route = useRoute();
const router = useRouter();

const { device } = storeToRefs(appStore); // 设备类型：desktop-宽屏设备 || mobile-窄屏设备

/**
 * vueUse 全屏
 */
const { isFullscreen, toggle } = useFullscreen();

/**
 * 注销
 */
function logout() {
  ElMessageBox.confirm("确定注销并退出系统吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
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
<style lang="scss" scoped>
.setting-container {
  display: flex;
  align-items: center;

  .setting-item {
    display: inline-block;
    width: 30px;
    height: 50px;
    line-height: 50px;
    color: var(--el-text-color-regular);
    text-align: center;
    cursor: pointer;

    &:hover {
      background: var(--el-disabled-bg-color);
    }
  }
}

.avatar-container {
  display: flex;
  align-items: center;
  justify-items: center;
  margin: 0 5px;
  cursor: pointer;

  img {
    width: 40px;
    height: 40px;
    border-radius: 5px;
  }
}
</style>
