<template>
  <el-drawer
    v-model="drawerVisible"
    size="300"
    :title="t('settings.project')"
    :before-close="handleCloseDrawer"
  >
    <section class="config-section">
      <el-divider>{{ t("settings.theme") }}</el-divider>

      <div class="flex-center">
        <el-switch
          v-model="isDark"
          active-icon="Moon"
          inactive-icon="Sunny"
          @change="handleThemeChange"
        />
      </div>
    </section>

    <!-- 界面设置 -->
    <section class="config-section">
      <el-divider>{{ t("settings.interface") }}</el-divider>

      <div class="config-item flex-x-between">
        <span class="text-xs">{{ t("settings.themeColor") }}</span>
        <el-color-picker
          v-model="selectedThemeColor"
          :predefine="colorPresets"
          popper-class="theme-picker-dropdown"
        />
      </div>

      <div class="config-item flex-x-between">
        <span class="text-xs">{{ t("settings.showTagsView") }}</span>
        <el-switch v-model="settingsStore.showTagsView" />
      </div>

      <div class="config-item flex-x-between">
        <span class="text-xs">{{ t("settings.showAppLogo") }}</span>
        <el-switch v-model="settingsStore.showAppLogo" />
      </div>

      <div class="config-item flex-x-between">
        <span class="text-xs">{{ t("settings.showWatermark") }}</span>
        <el-switch v-model="settingsStore.showWatermark" />
      </div>
      <div v-if="!isDark" class="config-item flex-x-between">
        <span class="text-xs">{{ t("settings.sidebarColorScheme") }}</span>
        <el-radio-group v-model="sidebarColor" @change="changeSidebarColor">
          <el-radio :value="SidebarColor.CLASSIC_BLUE">
            {{ t("settings.classicBlue") }}
          </el-radio>
          <el-radio :value="SidebarColor.MINIMAL_WHITE">
            {{ t("settings.minimalWhite") }}
          </el-radio>
        </el-radio-group>
      </div>
    </section>

    <!-- 布局设置 -->
    <section class="config-section">
      <el-divider>{{ t("settings.navigation") }}</el-divider>

      <!-- 整合的布局选择器 -->
      <div class="layout-select">
        <el-tooltip
          v-for="item in layoutOptions"
          :key="item.value"
          :content="item.label"
          placement="bottom"
        >
          <div
            role="button"
            tabindex="0"
            :class="[
              'layout-item',
              item.className,
              { 'is-active': settingsStore.layout === item.value },
            ]"
            @click="handleLayoutChange(item.value)"
            @keydown.enter.space="handleLayoutChange(item.value)"
          >
            <div class="layout-item-part" />
            <div class="layout-item-part" />
          </div>
        </el-tooltip>
      </div>
    </section>
  </el-drawer>
</template>

<script setup lang="ts">
const { t } = useI18n();
import { LayoutMode } from "@/enums/settings/layout.enum";
import { ThemeMode } from "@/enums/settings/theme.enum";
import { SidebarColor } from "@/enums/settings/theme.enum";
import { useSettingsStore, usePermissionStore, useAppStore } from "@/store";

// 布局选项配置
interface LayoutOption {
  value: LayoutMode;
  label: string;
  className: string;
}

const layoutOptions: LayoutOption[] = [
  { value: LayoutMode.LEFT, label: "左侧模式", className: "left" },
  { value: LayoutMode.TOP, label: "顶部模式", className: "top" },
  { value: LayoutMode.MIX, label: "混合模式", className: "mix" },
];

// 颜色预设
const colorPresets = [
  "#4080FF",
  "#626AEF",
  "#ff4500",
  "#ff8c00",
  "#00ced1",
  "#1e90ff",
  "#c71585",
  "rgb(255, 120, 0)",
  "hsva(120, 40, 94)",
];

const route = useRoute();
const appStore = useAppStore();
const settingsStore = useSettingsStore();
const permissionStore = usePermissionStore();

const isDark = ref<boolean>(settingsStore.theme === ThemeMode.DARK);
const sidebarColor = ref(settingsStore.sidebarColorScheme);

const selectedThemeColor = computed({
  get: () => settingsStore.themeColor,
  set: (value) => settingsStore.updateThemeColor(value),
});

const drawerVisible = computed({
  get: () => settingsStore.settingsVisible,
  set: (value) => (settingsStore.settingsVisible = value),
});

/**
 * 处理主题切换
 *
 * @param isDark 是否启用暗黑模式
 */
const handleThemeChange = (isDark: string | number | boolean) => {
  settingsStore.updateTheme(isDark ? ThemeMode.DARK : ThemeMode.LIGHT);
};

/**
 * 更改侧边栏颜色
 *
 * @param val 颜色方案名称
 */
const changeSidebarColor = (val: any) => {
  settingsStore.updateSidebarColorScheme(val);
};

/**
 * 切换布局
 *
 * @param layout - 布局模式
 */
const handleLayoutChange = (layout: LayoutMode) => {
  settingsStore.updateLayout(layout);
  if (layout === LayoutMode.MIX && route.name) {
    const topLevelRoute = findTopLevelRoute(permissionStore.routes, route.name as string);
    if (appStore.activeTopMenuPath !== topLevelRoute.path) {
      appStore.activeTopMenu(topLevelRoute.path);
    }
  }
};

/**
 * 查找路由的顶层父路由
 *
 * @param tree 树形数据
 * @param findName 查找的名称
 */
function findTopLevelRoute(tree: any[], findName: string) {
  const parentMap: any = {};

  function buildParentMap(node: any, parent: any) {
    parentMap[node.name] = parent;

    if (node.children) {
      for (let i = 0; i < node.children.length; i++) {
        buildParentMap(node.children[i], node);
      }
    }
  }

  for (let i = 0; i < tree.length; i++) {
    buildParentMap(tree[i], null);
  }

  let currentNode = parentMap[findName];
  while (currentNode) {
    if (!parentMap[currentNode.name]) {
      return currentNode;
    }
    currentNode = parentMap[currentNode.name];
  }
  return null;
}

/**
 * 关闭抽屉前的回调
 */
const handleCloseDrawer = () => {
  settingsStore.settingsVisible = false;
};
</script>

<style lang="scss" scoped>
.config-section {
  margin-bottom: 24px;

  .config-item {
    padding: 12px 0;
    border-bottom: 1px solid var(--el-border-color-light);

    &:last-child {
      border-bottom: none;
    }
  }
}

/* 布局选择器样式 */
.layout-select {
  display: flex;
  gap: 10px;
  justify-content: space-evenly;
  padding: 10px 0;
  --layout-primary: #1b2a47;
  --layout-background: #f0f2f5;
  --layout-shadow: 0 0 8px rgba(0, 0, 0, 0.1);
  --layout-hover: #e3f1f9;
}

.layout-item {
  position: relative;
  width: 18%;
  height: 50px;
  cursor: pointer;
  background: var(--layout-background);
  border-radius: 8px;
  box-shadow: var(--layout-shadow);

  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    background-color: var(--layout-hover);
    transform: scale(1.02);
  }

  &:focus-visible {
    outline: 2px solid var(--el-color-primary);
  }

  &-part {
    position: absolute;
    background: var(--layout-primary);
    border-radius: 4px;
    box-shadow: var(--layout-shadow);
    transition: all 0.3s ease;
  }

  &.left {
    .layout-item-part {
      &:first-child {
        width: 30%;
        height: 100%;
        border-radius: 4px 0 0 4px;
      }
      &:last-child {
        top: 0;
        right: 0;
        width: 70%;
        height: 30%;
        background: #fff;
        border-radius: 0 4px 4px 0;
      }
    }
  }

  &.top {
    .layout-item-part:first-child {
      width: 100%;
      height: 30%;
      border-radius: 4px 4px 0 0;
    }
  }

  &.mix {
    .layout-item-part {
      &:first-child {
        width: 100%;
        height: 30%;
        border-radius: 4px 4px 0 0;
      }
      &:last-child {
        bottom: 0;
        left: 0;
        width: 30%;
        height: 70%;
        border-radius: 0 0 4px 4px;
      }
    }
  }
}

.is-active {
  background-color: var(--layout-hover);
  border: 2px solid var(--el-color-primary);
  transform: scale(1.05);
}
</style>
