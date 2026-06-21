<template>
  <div :class="['layout-toolbar', toolbarToneClass]">
    <template v-if="isDesktop">
      <div class="layout-toolbar__item layout-toolbar__item--search">
        <CommandPalette />
      </div>

      <div class="layout-toolbar__item">
        <Fullscreen />
      </div>

      <div class="layout-toolbar__item">
        <SizeSelect />
      </div>

      <div class="layout-toolbar__item">
        <LangSelect />
      </div>

      <div class="layout-toolbar__item">
        <NoticeDropdown />
      </div>

      <div v-if="showTenantSwitcher" class="layout-toolbar__item">
        <TenantSwitcher @change="handleTenantChange" />
      </div>
    </template>

    <div class="layout-toolbar__item layout-toolbar__item--profile">
      <el-dropdown trigger="click">
        <div class="layout-user">
          <div class="layout-user__avatar">
            <img :src="userStore.userInfo.avatar" class="layout-user__avatar-img" />
          </div>
          <span class="layout-user__name">{{ userStore.userInfo.username }}</span>
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

    <div v-if="defaults.showSettings" class="layout-toolbar__item" @click="handleSettingsClick">
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

const isDesktop = computed(() => appStore.device === DeviceEnum.DESKTOP);

const canSwitchTenant = computed(() => userStore.userInfo?.canSwitchTenant === true);

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

const toolbarToneClass = computed(() => {
  const { resolvedTheme, sidebarColorScheme, layout } = settingStore;

  if (resolvedTheme === ThemeMode.DARK) {
    return "layout-toolbar--light";
  }

  const isHeaderMenuLayout = layout === LayoutMode.TOP || layout === LayoutMode.MIX;
  if (isHeaderMenuLayout && sidebarColorScheme === SidebarColor.CLASSIC_BLUE) {
    return "layout-toolbar--light";
  }

  return "layout-toolbar--dark";
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
.layout-toolbar {
  --layout-toolbar-color: var(--el-text-color-secondary);
  --layout-toolbar-hover-color: var(--el-color-primary);
  --layout-toolbar-hover-bg: var(--el-fill-color-light);

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
    color: var(--layout-toolbar-color);
    text-align: center;
    cursor: pointer;
    border-radius: 6px;
    transition:
      background-color 0.16s,
      color 0.16s;

    > [class*="i-svg:"] {
      display: flex;
      align-items: center;
      justify-content: center;
    }

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
      color: var(--layout-toolbar-hover-color);
      background: var(--layout-toolbar-hover-bg);
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
}

.layout-user {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  padding: 0 6px 0 2px;

  &__avatar {
    flex-shrink: 0;
    width: 28px;
    height: 28px;
    overflow: hidden;
    border-radius: 50%;
  }

  &__avatar-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
  }

  &__name {
    margin-left: 8px;
    font-size: 13px;
    color: currentColor;
    white-space: nowrap;
    transition: color 0.3s;
  }
}

.layout-toolbar--light {
  --layout-toolbar-color: var(--menu-text);
  --layout-toolbar-hover-color: var(--menu-active-text);
  --layout-toolbar-hover-bg: var(--menu-hover);

  .layout-user__name {
    color: currentColor;
  }

  ::v-deep(.tenant-switcher__trigger) {
    color: currentColor;
    background: transparent;
  }
  ::v-deep(.tenant-switcher__trigger .tenant-switcher__icon) {
    color: currentColor;
  }
  ::v-deep(.tenant-switcher__trigger:hover) {
    color: var(--layout-toolbar-hover-color);
    background: var(--layout-toolbar-hover-bg);
  }
  ::v-deep(.tenant-switcher__trigger:hover .tenant-switcher__icon) {
    color: currentColor;
  }
}

.layout-toolbar--dark {
  --layout-toolbar-color: var(--el-text-color-secondary);
  --layout-toolbar-hover-color: var(--el-color-primary);
  --layout-toolbar-hover-bg: var(--el-fill-color-light);

  .layout-user__name {
    color: var(--el-text-color-regular);
  }

  ::v-deep(.tenant-switcher__trigger) {
    color: var(--el-text-color-regular);
    background: transparent;
  }
  ::v-deep(.tenant-switcher__trigger .tenant-switcher__icon) {
    color: currentColor;
  }
  ::v-deep(.tenant-switcher__trigger:hover) {
    color: var(--layout-toolbar-hover-color);
    background: var(--layout-toolbar-hover-bg);
  }
  ::v-deep(.tenant-switcher__trigger:hover .tenant-switcher__icon) {
    color: currentColor;
  }
}

::v-deep(.el-dropdown-menu) {
  [class*="i-svg:"] {
    color: var(--el-text-color-regular) !important;

    &:hover {
      color: var(--el-color-primary) !important;
    }
  }
}
</style>
