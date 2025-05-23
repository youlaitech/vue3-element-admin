<!-- 菜单组件 -->
<template>
  <el-menu
    ref="menuRef"
    :default-active="currentRoute.path"
    :collapse="!appStore.sidebar.opened"
    :background-color="
      theme === 'dark' || sidebarColorScheme === SidebarColor.CLASSIC_BLUE
        ? variables['menu-background']
        : undefined
    "
    :text-color="
      theme === 'dark' || sidebarColorScheme === SidebarColor.CLASSIC_BLUE
        ? variables['menu-text']
        : undefined
    "
    :active-text-color="
      theme === 'dark' || sidebarColorScheme === SidebarColor.CLASSIC_BLUE
        ? variables['menu-active-text']
        : undefined
    "
    :popper-effect="theme"
    :unique-opened="false"
    :collapse-transition="false"
    :mode="menuMode"
    @open="onMenuOpen"
    @close="onMenuClose"
  >
    <!-- 菜单项 -->
    <SidebarMenuItem
      v-for="route in data"
      :key="route.path"
      :item="route"
      :base-path="resolveFullPath(route.path)"
    />
  </el-menu>
</template>

<script lang="ts" setup>
import path from "path-browserify";
import type { MenuInstance } from "element-plus";
import type { RouteRecordRaw } from "vue-router";

import { LayoutMode } from "@/enums/settings/layout.enum";
import { SidebarColor } from "@/enums/settings/theme.enum";
import { useSettingsStore, useAppStore } from "@/store";
import { isExternal } from "@/utils/index";

import variables from "@/styles/variables.module.scss";

const props = defineProps({
  data: {
    type: Array<RouteRecordRaw>,
    default: () => [],
  },
  basePath: {
    type: String,
    required: true,
    example: "/system",
  },
});

const menuRef = ref<MenuInstance>();
const settingsStore = useSettingsStore();
const appStore = useAppStore();
const currentRoute = useRoute();

// 存储已展开的菜单项索引
const expandedMenuIndexes = ref<string[]>([]);

// 根据布局模式设置菜单的显示方式：顶部布局使用水平模式，其他使用垂直模式
const menuMode = computed(() => {
  return settingsStore.layout === LayoutMode.TOP ? "horizontal" : "vertical";
});

// 获取主题
const theme = computed(() => settingsStore.theme);

// 获取浅色主题下的侧边栏配色方案
const sidebarColorScheme = computed(() => settingsStore.sidebarColorScheme);

/**
 * 获取完整路径
 *
 * @param routePath 当前路由的相对路径  /user
 * @returns 完整的绝对路径 D://vue3-element-admin/system/user
 */
function resolveFullPath(routePath: string) {
  if (isExternal(routePath)) {
    return routePath;
  }
  if (isExternal(props.basePath)) {
    return props.basePath;
  }

  // 解析路径，生成完整的绝对路径
  return path.resolve(props.basePath, routePath);
}

/**
 * 打开菜单
 *
 * @param index 当前展开的菜单项索引
 */
const onMenuOpen = (index: string) => {
  expandedMenuIndexes.value.push(index);
};

/**
 * 关闭菜单
 *
 * @param index 当前收起的菜单项索引
 */
const onMenuClose = (index: string) => {
  expandedMenuIndexes.value = expandedMenuIndexes.value.filter((item) => item !== index);
};

/**
 * 监听菜单模式变化：当菜单模式切换为水平模式时，关闭所有展开的菜单项，
 * 避免在水平模式下菜单项显示错位。
 *
 * @see https://gitee.com/youlaiorg/vue3-element-admin/issues/IAJ1DR
 */
watch(
  () => menuMode.value,
  () => {
    if (menuMode.value === "horizontal") {
      expandedMenuIndexes.value.forEach((item) => menuRef.value!.close(item));
    }
  }
);
</script>
