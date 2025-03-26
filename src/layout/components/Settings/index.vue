<template>
  <el-drawer
    v-model="drawerVisible"
    size="300"
    :title="$t('settings.project')"
    :before-close="handleCloseDrawer"
  >
    <section class="config-section">
      <el-divider>{{ $t("settings.theme") }}</el-divider>

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
      <el-divider>{{ $t("settings.interface") }}</el-divider>

      <div class="config-item flex-x-between">
        <span class="text-xs">{{ $t("settings.themeColor") }}</span>
        <el-color-picker
          v-model="selectedThemeColor"
          :predefine="colorPresets"
          popper-class="theme-picker-dropdown"
        />
      </div>

      <div class="config-item flex-x-between">
        <span class="text-xs">{{ $t("settings.tagsView") }}</span>
        <el-switch v-model="settingsStore.tagsView" />
      </div>

      <div class="config-item flex-x-between">
        <span class="text-xs">{{ $t("settings.sidebarLogo") }}</span>
        <el-switch v-model="settingsStore.sidebarLogo" />
      </div>

      <div class="config-item flex-x-between">
        <span class="text-xs">{{ $t("settings.watermark") }}</span>
        <el-switch v-model="settingsStore.watermarkEnabled" />
      </div>
      <div v-if="!isDark" class="config-item flex-x-between">
        <span class="text-xs">{{ $t("settings.sidebarColorScheme") }}</span>
        <el-radio-group v-model="sidebarColor" @change="changeSidebarColor">
          <el-radio :value="SidebarColor.CLASSIC_BLUE">
            {{ $t("settings.classicBlue") }}
          </el-radio>
          <el-radio :value="SidebarColor.MINIMAL_WHITE">
            {{ $t("settings.minimalWhite") }}
          </el-radio>
        </el-radio-group>
      </div>
    </section>

    <!-- 布局设置 -->
    <section class="config-section">
      <el-divider>{{ $t("settings.navigation") }}</el-divider>
      <LayoutSelect v-model="settingsStore.layout" @update:model-value="handleLayoutChange" />
    </section>
  </el-drawer>
</template>

<script setup lang="ts">
import { LayoutMode } from "@/enums/settings/layout.enum";
import { ThemeMode } from "@/enums/settings/theme.enum";
import { SidebarColor } from "@/enums/settings/theme.enum";
import { useSettingsStore, usePermissionStore, useAppStore } from "@/store";
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
  set: (value) => settingsStore.changeThemeColor(value),
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
  settingsStore.changeTheme(isDark ? ThemeMode.DARK : ThemeMode.LIGHT);
};

/**
 * 更改侧边栏颜色
 *
 * @param val 颜色方案名称
 */
const changeSidebarColor = (val: any) => {
  settingsStore.changeSidebarColor(val);
};

/**
 * 切换布局
 *
 * @param layout - 布局模式
 */
const handleLayoutChange = (layout: LayoutMode) => {
  settingsStore.changeLayout(layout);
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
  let parentMap: any = {};

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
</style>
