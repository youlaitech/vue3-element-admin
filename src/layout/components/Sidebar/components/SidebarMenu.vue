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
    :mode="mode"
    @open="handleOpen"
    @close="handleClose"
  >
    <SidebarMenuItem
      v-for="route in menuList"
      :key="route.path"
      :item="route"
      :base-path="resolvePath(route.path)"
    />
  </el-menu>
</template>

<script lang="ts" setup>
import { useSettingsStore, useAppStore } from "@/store";
import { isExternal } from "@/utils/index";
import path from "path-browserify";
import variables from "@/styles/variables.module.scss";
import { LayoutEnum } from "@/enums/LayoutEnum";
import type { MenuInstance } from "element-plus";

const menuRef = ref<MenuInstance>();
const settingsStore = useSettingsStore();
const appStore = useAppStore();
const currentRoute = useRoute();
const props = defineProps({
  menuList: {
    required: true,
    default: () => {
      return [];
    },
    type: Array<any>,
  },
  basePath: {
    type: String,
    required: true,
  },
});
const mode = computed(() => {
  return settingsStore.layout === LayoutEnum.TOP ? "horizontal" : "vertical";
});

/**
 * 解析路径
 *
 * @param routePath 路由路径 /user
 */
function resolvePath(routePath: string) {
  if (isExternal(routePath)) {
    return routePath;
  }
  if (isExternal(props.basePath)) {
    return props.basePath;
  }

  // 完整绝对路径 = 父级路径(/system) + 路由路径(/user)
  const fullPath = path.resolve(props.basePath, routePath);
  return fullPath;
}
/**
 * 修复切换到horizontal时，展开的菜单显示问题，切换时关闭全部菜单
 */
const menuIndexArray = ref<string[]>([]);
const handleOpen = (index: string, keyPath: string[]) => {
  menuIndexArray.value.push(index);
};
const handleClose = (index: string) => {
  menuIndexArray.value = menuIndexArray.value.filter((item) => item !== index);
};
watch(
  () => mode.value,
  () => {
    if (mode.value === "horizontal") {
      menuIndexArray.value.map((item: string) => menuRef.value!.close(item));
    }
  }
);
</script>
