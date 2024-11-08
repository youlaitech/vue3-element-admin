<template>
  <el-drawer v-model="settingsVisible" size="300" :title="$t('settings.project')">
    <el-divider>{{ $t("settings.theme") }}</el-divider>

    <div class="flex-center">
      <el-switch v-model="isDark" active-icon="Moon" inactive-icon="Sunny" @change="changeTheme" />
    </div>

    <el-divider>{{ $t("settings.interface") }}</el-divider>

    <div class="py-1 flex-x-between">
      <span class="text-xs">{{ $t("settings.themeColor") }}</span>
      <ThemeColorPicker v-model="settingsStore.themeColor" @update:model-value="changeThemeColor" />
    </div>

    <div class="py-1 flex-x-between">
      <span class="text-xs">{{ $t("settings.tagsView") }}</span>
      <el-switch v-model="settingsStore.tagsView" />
    </div>

    <div class="py-1 flex-x-between">
      <span class="text-xs">{{ $t("settings.fixedHeader") }}</span>
      <el-switch v-model="settingsStore.fixedHeader" />
    </div>

    <div class="py-1 flex-x-between">
      <span class="text-xs">{{ $t("settings.sidebarLogo") }}</span>
      <el-switch v-model="settingsStore.sidebarLogo" />
    </div>

    <div class="py-1 flex-x-between">
      <span class="text-xs">{{ $t("settings.watermark") }}</span>
      <el-switch v-model="settingsStore.watermarkEnabled" />
    </div>

    <el-divider>{{ $t("settings.navigation") }}</el-divider>

    <LayoutSelect v-model="settingsStore.layout" @update:model-value="changeLayout" />
  </el-drawer>
</template>

<script setup lang="ts">
import { LayoutEnum } from "@/enums/LayoutEnum";
import { ThemeEnum } from "@/enums/ThemeEnum";

import { useSettingsStore, usePermissionStore, useAppStore } from "@/store";

const route = useRoute();
const appStore = useAppStore();
const settingsStore = useSettingsStore();
const permissionStore = usePermissionStore();
const isDark = ref<boolean>(settingsStore.theme === ThemeEnum.DARK);

const settingsVisible = computed({
  get() {
    return settingsStore.settingsVisible;
  },
  set() {
    settingsStore.settingsVisible = false;
  },
});

/**
 *  切换主题颜色
 *
 * @param color 颜色
 */
function changeThemeColor(color: string) {
  settingsStore.changeThemeColor(color);
}

/**
 * 切换主题
 *
 * @param val 是否为暗黑模式
 */
const changeTheme = (val: any) => {
  isDark.value = val;
  settingsStore.changeTheme(isDark.value ? ThemeEnum.DARK : ThemeEnum.LIGHT);
};

/**
 * 切换布局
 *
 * @param layout 布局  LayoutEnum
 */
function changeLayout(layout: string) {
  settingsStore.changeLayout(layout);
  if (layout === LayoutEnum.MIX) {
    route.name && againActiveTop(route.name as string);
  }
}

/**
 * 重新激活顶部菜单
 *
 * @param routeName 路由名称
 */
function againActiveTop(routeName: string) {
  const parent = findOutermostParent(permissionStore.routes, routeName);
  if (appStore.activeTopMenuPath !== parent.path) {
    appStore.activeTopMenu(parent.path);
  }
}

/**
 * 查找最外层父级
 *
 * @param tree 树形数据
 * @param findName 查找的名称
 */
function findOutermostParent(tree: any[], findName: string) {
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
</script>

<style lang="scss" scoped></style>
