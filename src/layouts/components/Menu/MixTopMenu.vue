<!-- 混合布局顶部菜单 -->
<template>
  <el-menu
    mode="horizontal"
    :default-active="activeTopMenuPath"
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
    @select="handleMenuSelect"
  >
    <el-menu-item v-for="menuItem in processedTopMenus" :key="menuItem.path" :index="menuItem.path">
      <MenuItemContent
        v-if="menuItem.meta"
        :icon="menuItem.meta.icon"
        :title="menuItem.meta.title"
      />
    </el-menu-item>
  </el-menu>
</template>

<script lang="ts" setup>
import MenuItemContent from "./components/MenuItemContent.vue";

defineOptions({
  name: "MixTopMenu",
});

import { LocationQueryRaw, RouteRecordRaw } from "vue-router";
import { usePermissionStore, useAppStore, useSettingsStore } from "@/store";
import variables from "@/styles/variables.module.scss";
import { SidebarColor } from "@/enums/settings/theme.enum";

const router = useRouter();
const appStore = useAppStore();
const permissionStore = usePermissionStore();
const settingsStore = useSettingsStore();

// 获取主题
const theme = computed(() => settingsStore.theme);

// 获取浅色主题下的侧边栏配色方案
const sidebarColorScheme = computed(() => settingsStore.sidebarColorScheme);

// 顶部菜单列表
const topMenus = ref<RouteRecordRaw[]>([]);

// 处理后的顶部菜单列表 - 智能显示唯一子菜单的标题
const processedTopMenus = computed(() => {
  return topMenus.value.map((route) => {
    // 如果路由设置了 alwaysShow=true，或者没有子菜单，直接返回原路由
    if (route.meta?.alwaysShow || !route.children || route.children.length === 0) {
      return route;
    }

    // 过滤出非隐藏的子菜单
    const visibleChildren = route.children.filter((child) => !child.meta?.hidden);

    // 如果只有一个非隐藏的子菜单，显示子菜单的信息
    if (visibleChildren.length === 1) {
      const onlyChild = visibleChildren[0];
      return {
        ...route,
        meta: {
          ...route.meta,
          title: onlyChild.meta?.title || route.meta?.title,
          icon: onlyChild.meta?.icon || route.meta?.icon,
        },
      };
    }

    // 其他情况返回原路由
    return route;
  });
});

/**
 * 处理菜单点击事件，切换顶部菜单并加载对应的左侧菜单
 * @param routePath 点击的菜单路径
 */
const handleMenuSelect = (routePath: string) => {
  updateMenuState(routePath);
};

/**
 * 更新菜单状态 - 同时处理点击和路由变化情况
 * @param topMenuPath 顶级菜单路径
 * @param skipNavigation 是否跳过导航（路由变化时为true，点击菜单时为false）
 */
const updateMenuState = (topMenuPath: string, skipNavigation = false) => {
  // 不相同才更新，避免重复操作
  if (topMenuPath !== appStore.activeTopMenuPath) {
    appStore.activeTopMenu(topMenuPath); // 设置激活的顶部菜单
    permissionStore.setMixLayoutSideMenus(topMenuPath); // 设置混合布局左侧菜单
  }

  // 如果是点击菜单且状态已变更，才进行导航
  if (!skipNavigation) {
    navigateToFirstLeftMenu(permissionStore.mixLayoutSideMenus); // 跳转到左侧第一个菜单
  }
};

/**
 * 跳转到左侧第一个可访问的菜单
 * @param menus 左侧菜单列表
 */
const navigateToFirstLeftMenu = (menus: RouteRecordRaw[]) => {
  if (menus.length === 0) return;

  const [firstMenu] = menus;

  // 如果第一个菜单有子菜单，递归跳转到第一个子菜单
  if (firstMenu.children && firstMenu.children.length > 0) {
    navigateToFirstLeftMenu(firstMenu.children as RouteRecordRaw[]);
  } else if (firstMenu.name) {
    router.push({
      name: firstMenu.name,
      query:
        typeof firstMenu.meta?.params === "object"
          ? (firstMenu.meta.params as LocationQueryRaw)
          : undefined,
    });
  }
};

// 获取当前路由路径的顶部菜单路径
const activeTopMenuPath = computed(() => appStore.activeTopMenuPath);

onMounted(() => {
  topMenus.value = permissionStore.routes.filter((item) => !item.meta || !item.meta.hidden);
  // 初始化顶部菜单
  const currentTopMenuPath =
    useRoute().path.split("/").filter(Boolean).length > 1
      ? useRoute().path.match(/^\/[^/]+/)?.[0] || "/"
      : "/";
  appStore.activeTopMenu(currentTopMenuPath); // 设置激活的顶部菜单
  permissionStore.setMixLayoutSideMenus(currentTopMenuPath); // 设置混合布局左侧菜单
});

// 监听路由变化，同步更新顶部菜单和左侧菜单的激活状态
watch(
  () => router.currentRoute.value.path,
  (newPath) => {
    if (newPath) {
      // 提取顶级路径
      const topMenuPath =
        newPath.split("/").filter(Boolean).length > 1 ? newPath.match(/^\/[^/]+/)?.[0] || "/" : "/";

      // 使用公共方法更新菜单状态，但跳过导航（因为路由已经变化）
      updateMenuState(topMenuPath, true);
    }
  }
);
</script>

<style lang="scss" scoped>
.el-menu {
  width: 100%;
  height: 100%;

  &--horizontal {
    height: $navbar-height !important;

    // 确保菜单项垂直居中
    :deep(.el-menu-item) {
      height: 100%;
      line-height: $navbar-height;
    }

    // 移除默认的底部边框
    &:after {
      display: none;
    }
  }
}
</style>
