<template>
  <div v-if="!item.meta || !item.meta.hidden">
    <!--【叶子节点】显示叶子节点或唯一子节点且父节点未配置始终显示 -->
    <template
      v-if="
        // 未配置始终显示，使用唯一子节点替换父节点显示为叶子节点
        (hasOneShowingChild(item.children, item) &&
          !item.meta?.alwaysShow &&
          (!onlyOneChild.children || onlyOneChild.noShowingChildren)) ||
        // 即使配置了始终显示，但无子节点，也显示为叶子节点
        (item.meta?.alwaysShow && !item.children)
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
          <MenuItemContent
            v-if="onlyOneChild.meta"
            :icon="onlyOneChild.meta.icon || item.meta?.icon"
            :title="onlyOneChild.meta.title"
          />
        </el-menu-item>
      </AppLink>
    </template>

    <!--【非叶子节点】显示含多个子节点的父菜单，或始终显示的单子节点 -->
    <el-sub-menu v-else :index="resolvePath(item.path)" :data-path="item.path" teleported>
      <template #title>
        <MenuItemContent v-if="item.meta" :icon="item.meta.icon" :title="item.meta.title" />
      </template>

      <MenuItem
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
import MenuItemContent from "./MenuItemContent.vue";

defineOptions({
  name: "MenuItem",
  inheritAttrs: false,
});

import path from "path-browserify";
import { RouteRecordRaw } from "vue-router";

import { isExternal } from "@/utils";

const props = defineProps({
  /**
   * 当前路由对象
   */
  item: {
    type: Object as PropType<RouteRecordRaw>,
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

// 可见的唯一子节点
const onlyOneChild = ref();

/**
 * 检查是否仅有一个可见子节点
 *
 * @param children 子路由数组
 * @param parent 父级路由
 * @returns 是否仅有一个可见子节点
 */
function hasOneShowingChild(children: RouteRecordRaw[] = [], parent: RouteRecordRaw) {
  // 过滤出可见子节点
  const showingChildren = children.filter((route: RouteRecordRaw) => {
    if (!route.meta?.hidden) {
      onlyOneChild.value = route;
      return true;
    }
    return false;
  });

  // 仅有一个节点
  if (showingChildren.length === 1) {
    return true;
  }

  // 无子节点时
  if (showingChildren.length === 0) {
    // 父节点设置为唯一显示节点，并标记为无子节点
    onlyOneChild.value = { ...parent, path: "", noShowingChildren: true };
    return true;
  }
  return false;
}

/**
 * 获取完整路径，适配外部链接
 *
 * @param routePath 路由路径
 * @returns 绝对路径
 */
function resolvePath(routePath: string) {
  if (isExternal(routePath)) return routePath;
  if (isExternal(props.basePath)) return props.basePath;

  // 拼接父路径和当前路径
  return path.resolve(props.basePath, routePath);
}
</script>

<style lang="scss">
.hideSidebar {
  .submenu-title-noDropdown {
    position: relative;

    & > span {
      display: inline-block;
      visibility: hidden;
      width: 0;
      height: 0;
      overflow: hidden;
    }
  }

  .el-sub-menu {
    overflow: hidden;

    & > .el-sub-menu__title {
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
      & > .el-sub-menu__title > span {
        display: inline-block;
        visibility: hidden;
        width: 0;
        height: 0;
        overflow: hidden;
      }
    }
  }
}

html.dark {
  .el-menu-item:hover {
    background-color: $menu-hover;
  }
}

html.sidebar-color-blue {
  .el-menu-item:hover {
    background-color: $menu-hover;
  }
}

// 父菜单激活状态样式 - 当子菜单激活时，父菜单显示激活状态
.el-sub-menu {
  // 当父菜单包含激活子菜单时的样式
  &.has-active-child > .el-sub-menu__title {
    color: var(--el-color-primary) !important;
    background-color: var(--el-color-primary-light-9) !important;

    .menu-icon {
      color: var(--el-color-primary) !important;
    }
  }

  // 深色主题下的父菜单激活状态
  html.dark & {
    &.has-active-child > .el-sub-menu__title {
      color: var(--el-color-primary-light-3) !important;
      background-color: rgba(64, 128, 255, 0.15) !important;

      .menu-icon {
        color: var(--el-color-primary-light-3) !important;
      }
    }
  }

  // 深蓝色侧边栏配色下的父菜单激活状态
  html.sidebar-color-blue & {
    &.has-active-child > .el-sub-menu__title {
      color: var(--el-color-primary-light-3) !important;
      background-color: rgba(64, 128, 255, 0.2) !important;

      .menu-icon {
        color: var(--el-color-primary-light-3) !important;
      }
    }
  }
}
</style>
