<!-- 菜单组件 -->
<template>
  <el-menu
    ref="menuRef"
    :default-active="activeMenuIndex"
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
    <MenuItem
      v-for="route in data"
      :key="route.path"
      :item="route"
      :base-path="resolveFullPath(route.path)"
    />
  </el-menu>
</template>

<script lang="ts" setup>
import { useRoute } from "vue-router";
import path from "path-browserify";
import type { MenuInstance } from "element-plus";
import type { RouteRecordRaw } from "vue-router";
import { SidebarColor } from "@/enums/settings/theme.enum";
import { useSettingsStore, useAppStore } from "@/store";
import { isExternal } from "@/utils/index";
import MenuItem from "./components/MenuItem.vue";
import variables from "@/styles/variables.module.scss";

const props = defineProps({
  data: {
    type: Array as PropType<RouteRecordRaw[]>,
    default: () => [],
  },
  basePath: {
    type: String,
    required: true,
    example: "/system",
  },
  menuMode: {
    type: String as PropType<"vertical" | "horizontal">,
    default: "vertical",
    validator: (value: string) => ["vertical", "horizontal"].includes(value),
  },
});

const menuRef = ref<MenuInstance>();
const settingsStore = useSettingsStore();
const appStore = useAppStore();
const currentRoute = useRoute();

// 存储已展开的菜单项索引
const expandedMenuIndexes = ref<string[]>([]);

// 获取主题
const theme = computed(() => settingsStore.theme);

// 获取浅色主题下的侧边栏配色方案
const sidebarColorScheme = computed(() => settingsStore.sidebarColorScheme);

// 计算当前激活的菜单项
const activeMenuIndex = computed(() => {
  const currentPath = currentRoute.path;

  // 如果路由设置了 activeMenu，优先使用
  if (currentRoute.meta?.activeMenu) {
    return currentRoute.meta.activeMenu as string;
  }

  // 在水平模式下（顶部布局），需要找到匹配的顶级菜单
  if (props.menuMode === "horizontal") {
    // 首先尝试简单的路径前缀匹配
    const pathSegments = currentPath.split("/").filter(Boolean);
    if (pathSegments.length > 0) {
      const topLevelPath = `/${pathSegments[0]}`;

      // 检查是否有菜单项匹配这个顶级路径
      const matchingMenu = props.data.find((menu) => {
        const menuPath = resolveFullPath(menu.path);
        return menuPath === topLevelPath;
      });

      if (matchingMenu) {
        console.log("🎯 Top menu matched:", topLevelPath, "for route:", currentPath);
        return topLevelPath;
      }
    }

    // 如果简单匹配失败，使用详细匹配
    const findMatchingTopMenu = (menus: RouteRecordRaw[], targetPath: string): string | null => {
      for (const menu of menus) {
        const menuPath = resolveFullPath(menu.path);

        // 精确匹配
        if (targetPath === menuPath) {
          return menuPath;
        }

        // 路径前缀匹配（子路径匹配父菜单）
        if (targetPath.startsWith(menuPath + "/")) {
          return menuPath;
        }

        // 如果有子菜单，检查子菜单是否匹配
        if (menu.children && menu.children.length > 0) {
          const hasMatchingChild = menu.children.some((child) => {
            // 对于子菜单，需要正确解析路径
            let childPath;
            if (child.path.startsWith("/")) {
              // 如果子路径是绝对路径，直接使用
              childPath = child.path;
            } else {
              // 如果是相对路径，基于父菜单路径解析
              childPath = path.resolve(menuPath, child.path);
            }
            return targetPath === childPath || targetPath.startsWith(childPath + "/");
          });

          if (hasMatchingChild) {
            return menuPath;
          }
        }
      }
      return null;
    };

    const matchedMenu = findMatchingTopMenu(props.data, currentPath);
    if (matchedMenu) {
      console.log("🎯 Detailed menu matched:", matchedMenu, "for route:", currentPath);
      return matchedMenu;
    }
  }

  // 默认返回当前路径
  return currentPath;
});

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

  // 如果 basePath 为空（顶部布局），直接返回 routePath
  if (!props.basePath || props.basePath === "") {
    return routePath;
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
 */
watch(
  () => props.menuMode,
  (newMode) => {
    if (newMode === "horizontal" && menuRef.value) {
      expandedMenuIndexes.value.forEach((item) => menuRef.value!.close(item));
    }
  }
);

/**
 * 监听激活菜单变化，为包含激活子菜单的父菜单添加样式类
 */
watch(
  () => activeMenuIndex.value,
  () => {
    nextTick(() => {
      updateParentMenuStyles();
    });
  },
  { immediate: true }
);

/**
 * 更新父菜单样式 - 为包含激活子菜单的父菜单添加 has-active-child 类
 */
function updateParentMenuStyles() {
  if (!menuRef.value?.$el) return;

  const menuEl = menuRef.value.$el as HTMLElement;

  // 移除所有现有的 has-active-child 类
  const allSubMenus = menuEl.querySelectorAll(".el-sub-menu");
  allSubMenus.forEach((subMenu) => {
    subMenu.classList.remove("has-active-child");
  });

  // 查找当前激活的菜单项
  const activeMenuItem = menuEl.querySelector(".el-menu-item.is-active");
  if (activeMenuItem) {
    // 向上查找父级 el-sub-menu 元素
    let parent = activeMenuItem.parentElement;
    while (parent && parent !== menuEl) {
      if (parent.classList.contains("el-sub-menu")) {
        parent.classList.add("has-active-child");
      }
      parent = parent.parentElement;
    }
  }
}

/**
 * 组件挂载后立即更新父菜单样式
 */
onMounted(() => {
  nextTick(() => {
    updateParentMenuStyles();
  });
});
</script>
