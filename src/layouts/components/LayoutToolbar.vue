<template>
  <div :class="['navbar-actions', navbarActionsClass]">
    <!-- 桌面端工具项 -->
    <template v-if="isDesktop">
      <!-- 搜索 -->
      <div class="navbar-actions__item navbar-actions__item--search">
        <CommandPalette />
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
        <NoticeDropdown />
      </div>

      <!-- 租户选择（如果启用多租户）-->
      <div v-if="showTenantSwitcher" class="navbar-actions__item">
        <TenantSwitcher @change="handleTenantChange" />
      </div>
    </template>

    <!-- 用户菜单 -->
    <div class="navbar-actions__item navbar-actions__item--profile">
      <el-dropdown trigger="click">
        <div class="user-profile">
          <div style="width: 28px; height: 28px; overflow: hidden; border-radius: 50%">
            <img
              :src="userStore.userInfo.avatar"
              class="user-profile__avatar"
              style="width: 100%; height: 100%; object-fit: cover; object-position: center"
            />
          </div>
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
    <div v-if="defaults.showSettings" class="navbar-actions__item" @click="handleSettingsClick">
      <div class="i-svg:setting" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
import { defaults } from "@/settings";
import { DeviceEnum, SidebarColor, ThemeMode, LayoutMode } from "@/enums/settings";
import { useAppStore, useSettingsStore, useUserStore } from "@/stores";

// 导入子组件
import CommandPalette from "@/components/CommandPalette/index.vue";
import Fullscreen from "@/components/Fullscreen/index.vue";
import SizeSelect from "@/components/SizeSelect/index.vue";
import LangSelect from "@/components/LangSelect/index.vue";
import NoticeDropdown from "@/components/NoticeDropdown/index.vue";
import TenantSwitcher from "@/components/TenantSwitcher/index.vue";
import { useTenantStoreHook } from "@/stores/tenant";

const { t } = useI18n();
const appStore = useAppStore();
const settingStore = useSettingsStore();
const userStore = useUserStore();
const tenantStore = useTenantStoreHook();

const route = useRoute();
const router = useRouter();

// 是否为桌面设备
const isDesktop = computed(() => appStore.device === DeviceEnum.DESKTOP);

const canSwitchTenant = computed(() => userStore.userInfo?.canSwitchTenant === true);

// 是否显示租户选择
const showTenantSwitcher = computed(() => {
  if (!canSwitchTenant.value) {
    return false;
  }
  return tenantStore.tenantList.length > 1;
});

function handleTenantChange(tenantId: number) {
  tenantStore.switchTenant(tenantId).then(
    () => {
      ElMessage.success("切换租户成功");
      window.location.href = "/";
    },
    (error: unknown) => {
      const message = error instanceof Error ? error.message : "切换租户失败";
      ElMessage.error(message);
    }
  );
}

/**
 * 打开个人中心页面
 */
function handleProfileClick() {
  router.push({ name: "Profile" });
}

// 根据主题和侧边栏配色方案选择样式类
const navbarActionsClass = computed(() => {
  const { resolvedTheme, sidebarColorScheme, layout } = settingStore;

  // 暗黑主题下，所有布局都使用白色文字
  if (resolvedTheme === ThemeMode.DARK) {
    return "navbar-actions--white-text";
  }

  // 明亮主题下
  if (resolvedTheme === ThemeMode.LIGHT) {
    // 顶部布局和混合布局的顶部区域：
    // - 如果侧边栏是经典蓝色，使用白色文字
    // - 如果侧边栏是极简白色，使用深色文字
    if (layout === LayoutMode.TOP || layout === LayoutMode.MIX) {
      if (sidebarColorScheme === SidebarColor.CLASSIC_BLUE) {
        return "navbar-actions--white-text";
      } else {
        return "navbar-actions--dark-text";
      }
    }
  }

  return "navbar-actions--dark-text";
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
      // 若当前已在 404/401 等错误页，退出后不再跳回错误页
      const redirect = ["/404", "/401"].includes(route.path) ? "/" : route.fullPath;
      router.push(`/login?redirect=${encodeURIComponent(redirect)}`);
    });
  });
}

/**
 * 打开系统设置页面
 */
function handleSettingsClick() {
  settingStore.settingsVisible = true;
}
</script>

<style lang="scss" scoped>
.navbar-actions {
  --navbar-action-color: var(--el-text-color-secondary);
  --navbar-action-hover-color: var(--el-color-primary);
  --navbar-action-hover-bg: var(--el-fill-color-light);

  display: flex;
  gap: 4px;
  align-items: center;
  min-height: 32px;

  &__item {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 32px;
    height: 32px;
    padding: 0 6px;
    color: var(--navbar-action-color);
    text-align: center;
    cursor: pointer;
    border-radius: 6px;
    transition:
      background-color 0.16s,
      color 0.16s;

    // 只对需要居中的子元素生效，不使用通配符避免影响选择器组件
    > [class*="i-svg:"] {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    // 确保 Element Plus 组件可以正常工作
    :deep(.el-dropdown),
    :deep(.el-tooltip) {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 32px;
      color: inherit !important;
    }

    :deep(.el-tooltip__trigger),
    :deep(.fullscreen-trigger),
    :deep(.size-trigger),
    :deep(.notice__trigger) {
      color: inherit;
    }

    :deep(.i-svg\:language) {
      flex-shrink: 0;
      width: 16px;
      height: 16px;
      font-size: 16px;
      line-height: 16px;
      background-size: 16px 16px;
    }

    :deep([class*="i-svg:"]),
    :deep(.el-icon) {
      --color: currentColor;

      font-size: 16px;
      line-height: 1;
      color: currentColor !important;
      transition: color 0.16s;
    }

    :deep([class*="i-svg:"]) {
      background-color: currentColor !important;
    }

    &:hover {
      color: var(--navbar-action-hover-color);
      background: var(--navbar-action-hover-bg);
    }
  }

  &__item--search {
    color: var(--el-text-color-secondary);

    &:hover {
      background: transparent;
    }
  }

  &__item--profile {
    padding-right: 4px;
    padding-left: 4px;

    &:hover {
      background: transparent;
    }
  }

  .user-profile {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 32px;
    padding: 0 6px 0 2px;

    &__avatar {
      flex-shrink: 0;
      width: 28px;
      height: 28px;
      border-radius: 50%;
    }

    &__name {
      margin-left: 8px;
      font-size: 13px;
      color: currentColor;
      white-space: nowrap;
      transition: color 0.3s;
    }
  }
}

// 白色文字样式（用于深色背景：暗黑主题、顶部布局、混合布局等）
.navbar-actions--white-text {
  --navbar-action-color: var(--menu-text);
  --navbar-action-hover-color: var(--menu-active-text);
  --navbar-action-hover-bg: var(--menu-hover);

  .user-profile__name {
    color: currentColor;
  }

  // 租户选择器在白色文字模式下的样式
  ::v-deep(.tenant-switcher__trigger) {
    color: currentColor;
    background: transparent;
  }
  ::v-deep(.tenant-switcher__trigger .tenant-switcher__icon) {
    color: currentColor;
  }
  ::v-deep(.tenant-switcher__trigger:hover) {
    color: var(--navbar-action-hover-color);
    background: var(--navbar-action-hover-bg);
  }
  ::v-deep(.tenant-switcher__trigger:hover .tenant-switcher__icon) {
    color: currentColor;
  }
}

// 深色文字样式（用于浅色背景：明亮主题下的左侧布局等）
.navbar-actions--dark-text {
  --navbar-action-color: var(--el-text-color-secondary);
  --navbar-action-hover-color: var(--el-color-primary);
  --navbar-action-hover-bg: var(--el-fill-color-light);

  .user-profile__name {
    color: var(--el-text-color-regular);
  }

  // 租户选择器在深色文字模式下的样式
  ::v-deep(.tenant-switcher__trigger) {
    color: var(--el-text-color-regular);
    background: transparent;
  }
  ::v-deep(.tenant-switcher__trigger .tenant-switcher__icon) {
    color: currentColor;
  }
  ::v-deep(.tenant-switcher__trigger:hover) {
    color: var(--navbar-action-hover-color);
    background: var(--navbar-action-hover-bg);
  }
  ::v-deep(.tenant-switcher__trigger:hover .tenant-switcher__icon) {
    color: currentColor;
  }
}

// 确保下拉菜单中的图标不受影响
::v-deep(.el-dropdown-menu) {
  [class*="i-svg:"] {
    color: var(--el-text-color-regular) !important;

    &:hover {
      color: var(--el-color-primary) !important;
    }
  }
}
</style>
