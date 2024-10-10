<template>
  <!-- 如果菜单项未隐藏，显示菜单项 -->
  <div v-if="!item.meta || !item.meta.hidden">
    <!-- 如果只有一个子路由或没有子路由，显示该菜单项 -->
    <template
      v-if="
        hasOneShowingChild(item.children, item as RouteRecordRaw) &&
        (!onlyOneChild.children || onlyOneChild.noShowingChildren) &&
        !item.meta?.alwaysShow
      "
    >
      <AppLink
        v-if="onlyOneChild.meta"
        :to="{
          path: resolvePath(onlyOneChild.path),
          query: onlyOneChild.meta.params,
        }"
      >
        <el-menu-item
          :index="resolvePath(onlyOneChild.path)"
          :class="{ 'submenu-title-noDropdown': !isNest }"
        >
          <SidebarMenuItemTitle
            :icon="onlyOneChild.meta.icon || (item.meta && item.meta.icon)"
            :title="onlyOneChild.meta.title"
          />
        </el-menu-item>
      </AppLink>
    </template>

    <!-- 如果有多个子路由，显示父菜单项 -->
    <el-sub-menu v-else :index="resolvePath(item.path)" teleported>
      <template #title>
        <SidebarMenuItemTitle
          v-if="item.meta"
          :icon="item.meta && item.meta.icon"
          :title="item.meta.title"
        />
      </template>

      <SidebarMenuItem
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
defineOptions({
  name: "SidebarMenuItem",
  inheritAttrs: false,
});

import path from "path-browserify";
import { isExternal } from "@/utils";
import { RouteRecordRaw } from "vue-router";

const props = defineProps({
  /**
   * 当前路由对象
   */
  item: {
    type: Object,
    required: true,
  },

  /**
   * 父级完整路径
   */
  basePath: {
    type: String,
    required: true,
  },

  /**
   * 是否为嵌套路由
   */
  isNest: {
    type: Boolean,
    default: false,
  },
});

const onlyOneChild = ref();

/**
 * 判断是否只有一个可见的子路由
 *
 * @param children 子路由数组
 * @param parent 父级路由对象
 * @returns 是否只有一个可见子路由
 */
function hasOneShowingChild(
  children: RouteRecordRaw[] = [],
  parent: RouteRecordRaw
) {
  // 筛选出可见的子路由
  const showingChildren = children.filter((route: RouteRecordRaw) => {
    if (route.meta?.hidden) {
      return false;
    } else {
      route.meta!.hidden = false;
      onlyOneChild.value = route;
      return true;
    }
  });

  // 如果只有一个或没有可见的子路由
  if (showingChildren.length === 1) {
    return true;
  }

  // 如果没有子路由，使用父级路由
  if (showingChildren.length === 0) {
    onlyOneChild.value = { ...parent, path: "", noShowingChildren: true };
    return true;
  }
  return false;
}

/**
 * 解析路径，将相对路径转换为绝对路径
 *
 * @param routePath 路由路径
 * @returns 绝对路径
 */
function resolvePath(routePath: string) {
  if (isExternal(routePath)) {
    return routePath;
  }
  if (isExternal(props.basePath)) {
    return props.basePath;
  }

  // 组合父级路径和路由路径形成完整路径
  const fullPath = path.resolve(props.basePath, routePath);
  return fullPath;
}
</script>

<style lang="scss">
.hideSidebar {
  .submenu-title-noDropdown {
    position: relative;
    padding: 0 !important;

    .el-tooltip {
      padding: 0 !important;

      .sub-el-icon {
        margin-left: 19px;
      }
    }

    & > span {
      display: inline-block;
      width: 0;
      height: 0;
      overflow: hidden;
      visibility: hidden;
    }
  }

  .el-sub-menu {
    overflow: hidden;

    & > .el-sub-menu__title {
      padding: 0 !important;

      .sub-el-icon {
        margin-left: 19px;
      }

      .el-sub-menu__icon-arrow {
        display: none;
      }
    }
  }

  .el-menu--collapse {
    width: $sidebar-width-collapsed;

    .el-sub-menu {
      & > .el-sub-menu__title {
        & > span {
          display: inline-block;
          width: 0;
          height: 0;
          overflow: hidden;
          visibility: hidden;
        }
      }
    }
  }
}

.el-menu-item:hover {
  background-color: $menu-hover;
}
</style>
