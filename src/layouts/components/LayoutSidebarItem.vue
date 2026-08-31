<template>
  <div v-if="!item.meta || !item.meta.hidden">
    <template
      v-if="
        (hasOneShowingChild(item.children, item) &&
          !item.meta?.alwaysShow &&
          (!onlyOneChild.children || onlyOneChild.noShowingChildren)) ||
        (item.meta?.alwaysShow && !item.children)
      "
    >
      <AppLink
        v-if="onlyOneChild.meta"
        :to="{
          path: resolvePath(onlyOneChild.path),
          meta: onlyOneChild.meta,
          query: onlyOneChild.meta.params,
        }"
      >
        <el-menu-item
          :index="resolvePath(onlyOneChild.path)"
          :class="{ 'submenu-title-noDropdown': !isNest }"
        >
          <template v-if="onlyOneChild.meta">
            <LayoutMenuIcon :icon="onlyOneChild.meta.icon || item.meta?.icon" />
            <span
              v-if="onlyOneChild.meta.title"
              class="ml-1"
              :title="translateRouteTitle(onlyOneChild.meta.title)"
            >
              {{ translateRouteTitle(onlyOneChild.meta.title) }}
            </span>
            <span v-if="getBadge(onlyOneChild.meta)" class="menu-badge">
              {{ getBadge(onlyOneChild.meta) }}
            </span>
          </template>
        </el-menu-item>
      </AppLink>
    </template>

    <el-sub-menu v-else :index="resolvePath(item.path)" :data-path="item.path" teleported>
      <template #title>
        <template v-if="item.meta">
          <LayoutMenuIcon :icon="item.meta.icon" />
          <span v-if="item.meta.title" class="ml-1" :title="translateRouteTitle(item.meta.title)">
            {{ translateRouteTitle(item.meta.title) }}
          </span>
          <span v-if="getBadge(item.meta)" class="menu-badge">
            {{ getBadge(item.meta) }}
          </span>
        </template>
      </template>

      <LayoutSidebarItem
        v-for="child in item.children"
        :key="child.path"
        :is-nest="true"
        :item="child"
        :base-path="resolvePath(child.path)"
      />
    </el-sub-menu>
  </div>
</template>

<script setup lang="ts">
import path from "path-browserify";
import type { RouteMeta, RouteRecordRaw } from "vue-router";
import { isExternal } from "@/utils";
import { translateRouteTitle } from "@/lang/utils";
import LayoutMenuIcon from "./LayoutMenuIcon.vue";

type SidebarRoute = RouteRecordRaw & {
  noShowingChildren?: boolean;
};

defineOptions({
  name: "LayoutSidebarItem",
  inheritAttrs: false,
});

const props = defineProps({
  /** 当前路由对象 */
  item: {
    type: Object as PropType<RouteRecordRaw>,
    required: true,
  },

  /** 父级完整路径 */
  basePath: {
    type: String,
    required: true,
  },

  /** 是否为嵌套路由 */
  isNest: {
    type: Boolean,
    default: false,
  },
});

const onlyOneChild = ref<SidebarRoute>({} as SidebarRoute);

/**
 * 判断当前路由是否应按叶子菜单渲染
 */
function hasOneShowingChild(children: RouteRecordRaw[] = [], parent: RouteRecordRaw) {
  const showingChildren = children.filter((route: RouteRecordRaw) => {
    if (!route.meta?.hidden) {
      onlyOneChild.value = route as SidebarRoute;
      return true;
    }
    return false;
  });

  if (showingChildren.length === 1) {
    return true;
  }

  if (showingChildren.length === 0) {
    onlyOneChild.value = { ...parent, path: "", noShowingChildren: true } as SidebarRoute;
    return true;
  }
  return false;
}

/**
 * 解析菜单跳转路径
 */
function resolvePath(routePath: string) {
  if (isExternal(routePath)) return routePath;
  if (isExternal(props.basePath)) return props.basePath;

  return path.resolve(props.basePath, routePath);
}

/**
 * 读取菜单角标（如 NEW/HOT）：来自 sys_menu.params 的 {"badge":"NEW"}，
 * 经 meta.params 透传至此；不配置则不渲染，纯数据驱动，无需菜单管理表单支持
 */
function getBadge(meta: RouteMeta | undefined): string {
  const params = meta?.params as Record<string, unknown> | undefined;
  return params?.badge ? String(params.badge) : "";
}
</script>

<style lang="scss" scoped>
/* 菜单角标：小巧不抢视觉重心，随侧边栏折叠自动隐藏（折叠态文本 span 均被 el-menu 隐藏） */
.menu-badge {
  height: 16px;
  padding: 0 5px;
  margin-left: 6px;
  font-size: 10px;
  font-weight: 600;
  line-height: 16px;
  color: #fff;
  background-color: var(--el-color-danger);
  border-radius: 8px;
}
</style>
