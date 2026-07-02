<template>
  <el-menu
    ref="menuRef"
    :default-active="activeMenuPath"
    :collapse="props.collapseOverride ?? (props.alwaysExpand ? false : !appStore.sidebar.opened)"
    :background-color="menuThemeProps.backgroundColor"
    :text-color="menuThemeProps.textColor"
    :active-text-color="menuThemeProps.activeTextColor"
    :popper-effect="theme"
    :unique-opened="false"
    :collapse-transition="false"
    :mode="menuMode"
    @open="onMenuOpen"
    @close="onMenuClose"
  >
    <LayoutSidebarItem
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
import { SidebarColor, ThemeMode } from "@/enums/settings";
import { useSettingsStore, useAppStore } from "@/stores";
import { isExternal } from "@/utils/index";
import LayoutSidebarItem from "./LayoutSidebarItem.vue";
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
  /** 强制展开，忽略全局 sidebar.opened 状态（DoubleLayout 第二列需要始终展开） */
  alwaysExpand: {
    type: Boolean,
    default: false,
  },
  /** 显式覆盖 collapse 状态，优先级高于 alwaysExpand 和全局 sidebar.opened */
  collapseOverride: {
    type: Boolean,
    default: null,
  },
});

const menuRef = ref<MenuInstance>();
const settingsStore = useSettingsStore();
const appStore = useAppStore();
const currentRoute = useRoute();

const expandedMenuIndexes = ref<string[]>([]);

const theme = computed(() => settingsStore.resolvedTheme);

const sidebarColorScheme = computed(() => settingsStore.sidebarColorScheme);

const menuThemeProps = computed(() => {
  const isDarkOrClassicBlue =
    theme.value === ThemeMode.DARK || sidebarColorScheme.value === SidebarColor.CLASSIC_BLUE;

  return {
    backgroundColor: isDarkOrClassicBlue ? variables["menu-background"] : undefined,
    textColor: isDarkOrClassicBlue ? variables["menu-text"] : undefined,
    activeTextColor: isDarkOrClassicBlue ? variables["menu-active-text"] : undefined,
  };
});

const activeMenuPath = computed((): string => {
  const { meta, path } = currentRoute;

  if (meta?.activeMenu && typeof meta.activeMenu === "string") {
    return meta.activeMenu;
  }

  return path;
});

/**
 * 解析菜单跳转路径
 */
function resolveFullPath(routePath: string) {
  if (isExternal(routePath)) {
    return routePath;
  }
  if (isExternal(props.basePath)) {
    return props.basePath;
  }

  if (!props.basePath || props.basePath === "") {
    return routePath;
  }

  return path.resolve(props.basePath, routePath);
}

/**
 * 记录展开的子菜单
 */
const onMenuOpen = (index: string) => {
  if (expandedMenuIndexes.value.includes(index)) return;
  expandedMenuIndexes.value.push(index);
};

/**
 * 移除已收起的子菜单
 */
const onMenuClose = (index: string) => {
  expandedMenuIndexes.value = expandedMenuIndexes.value.filter((item) => item !== index);
};

/**
 * 展开状态变化后同步父级菜单激活态
 */
watch(
  () => expandedMenuIndexes.value,
  () => {
    syncActiveParentMenus();
  }
);

/**
 * 水平菜单切换时收起弹出的垂直菜单
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
 * 路由激活项变化后同步父级菜单激活态
 */
watch(
  () => activeMenuPath.value,
  () => {
    nextTick(() => {
      syncActiveParentMenus();
    });
  },
  { immediate: true }
);

/**
 * TagsView 切换时重新计算父级菜单激活态
 */
watch(
  () => currentRoute.path,
  () => {
    nextTick(() => {
      syncActiveParentMenus();
    });
  }
);

/**
 * 标记包含当前路由的父级菜单
 */
function syncActiveParentMenus() {
  if (!menuRef.value?.$el) return;

  nextTick(() => {
    try {
      const menuEl = menuRef.value?.$el as HTMLElement;
      if (!menuEl) return;

      const allSubMenus = menuEl.querySelectorAll(".el-sub-menu");
      allSubMenus.forEach((subMenu) => {
        subMenu.classList.remove("has-active-child");
      });

      const activeMenuItem = menuEl.querySelector(".el-menu-item.is-active");

      if (activeMenuItem) {
        let parent = activeMenuItem.parentElement;
        while (parent && parent !== menuEl) {
          if (parent.classList.contains("el-sub-menu")) {
            parent.classList.add("has-active-child");
          }
          parent = parent.parentElement;
        }
        return;
      }

      if (props.menuMode !== "horizontal") return;

      const currentPath = activeMenuPath.value;
      allSubMenus.forEach((subMenu) => {
        const subMenuEl = subMenu as HTMLElement;
        const subMenuPath =
          subMenuEl.getAttribute("data-path") ||
          subMenuEl.querySelector(".el-sub-menu__title")?.getAttribute("data-path");

        if (subMenuPath && currentPath.startsWith(subMenuPath)) {
          subMenuEl.classList.add("has-active-child");
        }
      });
    } catch (error) {
      console.error("Error updating parent menu styles:", error);
    }
  });
}

/**
 * 首次挂载后同步父级菜单激活态
 */
onMounted(() => {
  syncActiveParentMenus();
});
</script>
