<template>
  <div :class="['navbar-actions', navbarActionsClass]">
    <!-- 桌面端工具项 -->
    <template v-if="isDesktop">
      <!-- 搜索 -->
      <div class="navbar-actions__item">
        <MenuSearch />
      </div>

      <!-- 全屏 -->
      <div class="navbar-actions__item">
        <Fullscreen />
      </div>

      <!-- 布局大小 -->
      <div class="navbar-actions__item">
        <SizeSelect />
      </div>

      <!-- 语言选择 -->
      <div class="navbar-actions__item">
        <LangSelect />
      </div>

      <!-- 通知 -->
      <div class="navbar-actions__item">
        <Notification />
      </div>
    </template>

    <!-- 用户菜单 -->
    <div class="navbar-actions__item">
      <el-dropdown trigger="click">
        <div class="user-profile">
          <img class="user-profile__avatar" :src="userStore.userInfo.avatar" />
          <span class="user-profile__name">{{ userStore.userInfo.username }}</span>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="handleProfileClick">
              {{ t("navbar.profile") }}
            </el-dropdown-item>
            <el-dropdown-item divided @click="logout">
              {{ t("navbar.logout") }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <!-- 系统设置 -->
    <div
      v-if="defaultSettings.showSettings"
      class="navbar-actions__item"
      @click="settingStore.settingsVisible = true"
    >
      <div class="i-svg:setting" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
import { ElMessageBox } from "element-plus";
import defaultSettings from "@/settings";
import { DeviceEnum } from "@/enums/settings/device.enum";
import { useAppStore, useSettingsStore, useUserStore } from "@/store";
import { SidebarColor, ThemeMode } from "@/enums/settings/theme.enum";

const { t } = useI18n();
const appStore = useAppStore();
const settingStore = useSettingsStore();
const userStore = useUserStore();

const route = useRoute();
const router = useRouter();

// 是否为桌面设备
const isDesktop = computed(() => appStore.device === DeviceEnum.DESKTOP);

/**
 * 打开个人中心页面
 */
function handleProfileClick() {
  router.push({ name: "Profile" });
}

// 根据主题和侧边栏配色方案选择样式类
const navbarActionsClass = computed(() => {
  // 暗黑主题
  if (settingStore.theme === ThemeMode.DARK) {
    return "navbar-actions--white-text";
  }

  // 经典蓝侧边栏
  if (settingStore.sidebarColorScheme === SidebarColor.CLASSIC_BLUE) {
    return "navbar-actions--white-text";
  }
});

/**
 * 退出登录
 */
function logout() {
  ElMessageBox.confirm("确定注销并退出系统吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
    lockScroll: false,
  }).then(() => {
    userStore.logout().then(() => {
      router.push(`/login?redirect=${route.fullPath}`);
    });
  });
}
</script>

<style lang="scss" scoped>
.navbar-actions {
  display: flex;
  align-items: center;
  height: 100%;

  &__item {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 40px;
    height: $navbar-height;
    text-align: center;
    cursor: pointer;

    :deep([class^="i-svg:"]) {
      color: var(--el-text-color);

      &:hover {
        color: var(--el-text-color-primary);
      }
    }

    &:hover {
      color: var(--el-text-color-primary);
      background: rgb(0 0 0 / 10%);
    }
  }

  .user-profile {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 0 13px;

    &__avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
    }

    &__name {
      margin-left: 10px;
    }
  }
}

.layout-top,
.layout-mix {
  .user-profile__name {
    color: #fff !important;
  }
}

.layout-top .navbar-actions--white-text :deep([class^="i-svg:"]),
.layout-mix .navbar-actions--white-text :deep([class^="i-svg:"]) {
  color: #fff !important;
}
</style>
