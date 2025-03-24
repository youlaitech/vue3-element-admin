<!-- 混合布局顶部菜单 -->
<template>
  <el-scrollbar>
    <el-menu
      mode="horizontal"
      :default-active="activePath"
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
      <el-menu-item v-for="route in topMenus" :key="route.path" :index="route.path">
        <template #title>
          <template v-if="route.meta && route.meta.icon">
            <el-icon v-if="route.meta.icon.startsWith('el-icon')" class="sub-el-icon">
              <component :is="route.meta.icon.replace('el-icon-', '')" />
            </el-icon>
            <div v-else :class="`i-svg:${route.meta.icon}`" />
          </template>
          <span v-if="route.path === '/'">首页</span>
          <span v-else-if="route.meta && route.meta.title" class="ml-1">
            {{ translateRouteTitle(route.meta.title) }}
          </span>
        </template>
      </el-menu-item>
    </el-menu>
  </el-scrollbar>
</template>

<script lang="ts" setup>
import { LocationQueryRaw, RouteRecordRaw } from "vue-router";
import { usePermissionStore, useAppStore, useSettingsStore } from "@/store";
import { translateRouteTitle } from "@/utils/i18n";
import variables from "@/styles/variables.module.scss";
import { SidebarColor } from "@/enums/settings/theme.enum";

const router = useRouter();
const appStore = useAppStore();
const permissionStore = usePermissionStore();
const settingsStore = useSettingsStore();

// 当前激活的顶部菜单路径
const activePath = computed(() => appStore.activeTopMenuPath);

// 获取主题
const theme = computed(() => settingsStore.theme);

// 获取浅色主题下的侧边栏配色方案
const sidebarColorScheme = computed(() => settingsStore.sidebarColorScheme);

// 顶部菜单列表
const topMenus = ref<RouteRecordRaw[]>([]);

// 获取当前路由路径的顶部菜单路径
const activeTopMenuPath =
  useRoute().path.split("/").filter(Boolean).length > 1
    ? useRoute().path.match(/^\/[^/]+/)?.[0] || "/"
    : "/";

// 设置当前激活的顶部菜单路径
appStore.activeTopMenu(activeTopMenuPath);

/**
 * 处理菜单点击事件，切换顶部菜单并加载对应的左侧菜单
 * @param routePath 点击的菜单路径
 */
const handleMenuSelect = (routePath: string) => {
  appStore.activeTopMenu(routePath); // 设置激活的顶部菜单
  permissionStore.setMixedLayoutLeftRoutes(routePath); // 更新左侧菜单
  navigateToFirstLeftMenu(permissionStore.mixedLayoutLeftRoutes); // 跳转到左侧第一个菜单
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

onMounted(() => {
  topMenus.value = permissionStore.routes.filter((item) => !item.meta || !item.meta.hidden);
});
</script>
