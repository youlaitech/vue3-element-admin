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

const route = useRoute();

// 获取当前路由路径的顶部菜单路径
const getActiveTopMenuPath = () => {
  const pathSegments = route.path.split("/").filter(Boolean);
  return pathSegments.length > 0 ? `/${pathSegments[0]}` : "/";
};

// 监听路由变化，更新活跃的顶部菜单
watch(
  () => route.path,
  () => {
    const newActiveTopMenuPath = getActiveTopMenuPath();
    if (newActiveTopMenuPath !== appStore.activeTopMenuPath) {
      appStore.activeTopMenu(newActiveTopMenuPath);
    }
  },
  { immediate: true }
);

/**
 * 处理菜单点击事件，切换顶部菜单并加载对应的左侧菜单
 * @param routePath 点击的菜单路径
 */
const handleMenuSelect = (routePath: string) => {
  appStore.activeTopMenu(routePath); // 设置激活的顶部菜单
  activateFirstLevelMenu(routePath); // 激活一级菜单并设置左侧二级菜单
};

/**
 * 激活一级菜单并设置左侧二级菜单
 * @param routePath 点击的菜单路径
 */
function activateFirstLevelMenu(routePath: string) {
  permissionStore.updateSideMenu(routePath); // 更新左侧菜单

  // 使用 nextTick 确保侧边菜单更新完成后再跳转
  nextTick(() => {
    navigateToFirstLeftMenu(permissionStore.sideMenuRoutes); // 跳转到左侧第一个菜单
  });
}

/**
 * 跳转到左侧第一个可访问的菜单
 * @param menus 左侧菜单列表
 */
const navigateToFirstLeftMenu = (menus: RouteRecordRaw[]) => {
  if (menus.length === 0) return;

  // 查找第一个可访问的菜单项
  const findFirstAccessibleRoute = (routes: RouteRecordRaw[]): RouteRecordRaw | null => {
    for (const route of routes) {
      // 跳过隐藏的菜单项
      if (route.meta?.hidden) continue;

      // 如果有子菜单，递归查找
      if (route.children && route.children.length > 0) {
        const childRoute = findFirstAccessibleRoute(route.children);
        if (childRoute) return childRoute;
      } else if (route.name && route.path) {
        // 找到第一个有名称和路径的菜单项
        return route;
      }
    }
    return null;
  };

  const firstRoute = findFirstAccessibleRoute(menus);

  if (firstRoute && firstRoute.name) {
    console.log("🎯 Navigating to first menu:", firstRoute.name, firstRoute.path);
    router.push({
      name: firstRoute.name,
      query:
        typeof firstRoute.meta?.params === "object"
          ? (firstRoute.meta.params as LocationQueryRaw)
          : undefined,
    });
  }
};

// 当前激活的顶部菜单路径
const activeTopMenuPath = computed(() => appStore.activeTopMenuPath);

onMounted(() => {
  topMenus.value = permissionStore.routes.filter((item) => !item.meta || !item.meta.hidden);
});
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
