<!-- 左侧边菜单：包括左侧布局(left)、顶部布局(all)、混合布局(left) -->
<template>
  <el-menu
    ref="menuRef"
    :default-active="currentRoute.path"
    :collapse="!appStore.sidebar.opened"
    :background-color="variables['menu-background']"
    :text-color="variables['menu-text']"
    :active-text-color="variables['menu-active-text']"
    :unique-opened="false"
    :collapse-transition="false"
    :mode="menuMode"
    @open="handleOpen"
    @close="handleClose"
  >
    <SidebarMenuItem
      v-for="route in menuList"
      :key="route.path"
      :item="route"
      :base-path="getFullPath(route.path)"
    />
  </el-menu>
</template>

<script lang="ts" setup>
import path from "path-browserify"; // 第三方库
import { useSettingsStore, useAppStore } from "@/store"; // 内部模块
import { isExternal } from "@/utils/index"; // 工具函数
import variables from "@/styles/variables.module.scss"; // 样式
import { LayoutEnum } from "@/enums/LayoutEnum"; // 枚举
import type { MenuInstance } from "element-plus"; // 类型

// 定义组件 props
const props = defineProps({
  menuList: {
    type: Array<any>,
    required: true,
    default: () => [],
  },
  basePath: {
    type: String,
    required: true,
  },
});

const menuRef = ref<MenuInstance>();
const settingsStore = useSettingsStore();
const appStore = useAppStore();
const currentRoute = useRoute();

// 根据布局计算菜单模式
const menuMode = computed(() => {
  return settingsStore.layout === LayoutEnum.TOP ? "horizontal" : "vertical";
});
/**
 * 获取完整路径
 * @param routePath 路由路径 /user
 * @returns 完整的路径
 */
function getFullPath(routePath: string) {
  if (isExternal(routePath)) {
    return routePath;
  }
  if (isExternal(props.basePath)) {
    return props.basePath;
  }
  return path.resolve(props.basePath, routePath); // 父路径 + 子路径
}

// 存储已打开菜单的索引
const openMenuIndexes = ref<string[]>([]);

/**
 * 菜单打开时添加索引
 * @param index 当前菜单索引
 */
const handleOpen = (index: string) => {
  openMenuIndexes.value.push(index);
};

/**
 * 菜单关闭时移除索引
 * @param index 当前菜单索引
 */
const handleClose = (index: string) => {
  openMenuIndexes.value = openMenuIndexes.value.filter(
    (item) => item !== index
  );
};

// 监听菜单模式变化，横向时关闭所有菜单
watch(
  () => menuMode.value,
  () => {
    if (menuMode.value === "horizontal") {
      openMenuIndexes.value.forEach((item) => menuRef.value!.close(item));
    }
  }
);
</script>
