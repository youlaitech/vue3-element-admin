<script setup lang="ts">
import path from 'path-browserify';
import { isExternal } from '@/utils/validate';
import AppLink from './Link.vue';

import { translateRouteTitleI18n } from '@/utils/i18n';
import SvgIcon from '@/components/SvgIcon/index.vue';

const props = defineProps({
  /**
   * 路由(eg:level_3_1)
   */
  item: {
    type: Object,
    required: true
  },

  /**
   * 父层级完整路由路径(eg:/level/level_3/level_3_1)
   */
  basePath: {
    type: String,
    required: true
  }
});

const onlyOneChild = ref(); // 临时变量，记录仅显示的一个子路由的信息

/**
 * 判断当前路由是否只有一个子路由需要显示
 *
 * 1：如果只有一个子路由，当前路由直接显示子路由
 * 2：如果无子路由，显示当前路由
 *
 * @param children  子路由数组
 * @param parent 当前路由
 */
function hasOneShowingChild(children = [], parent: any) {
  // 需要显示的子路由数组
  const showingChildren = children.filter((item: any) => {
    if (item.meta?.hidden) {
      // 过滤不显示的子路由
      return false;
    } else {
      // 仅有一个子路由生效，其他情况设置无效
      onlyOneChild.value = item;
      return true;
    }
  });

  // 1：如果只有一个子路由，当前路由直接显示子路由
  if (showingChildren.length === 1) {
    return true;
  }

  // 2：如果无子路由，显示当前路由
  if (showingChildren.length === 0) {
    onlyOneChild.value = { ...parent, path: '', noShowingChildren: true };
    return true;
  }
  return false;
}

/**
 * 解析路径
 *
 * @param routePath 路由路径
 */
function resolvePath(routePath: string) {
  if (isExternal(routePath)) {
    return routePath;
  }
  if (isExternal(props.basePath)) {
    return props.basePath;
  }
  // 完整路径 = 父级路径(/level/level_3) + 路由路径
  const fullPath = path.resolve(props.basePath, routePath);
  return fullPath;
}
</script>
<template>
  <div v-if="!item.meta || !item.meta.hidden">
    <!-- 当前路由不包含子路由显示 -->
    <template
      v-if="
        hasOneShowingChild(item.children, item) &&
        (!onlyOneChild.children || onlyOneChild.noShowingChildren)
      "
    >
      <app-link v-if="onlyOneChild.meta" :to="resolvePath(onlyOneChild.path)">
        <el-menu-item :index="resolvePath(onlyOneChild.path)">
          <svg-icon
            v-if="onlyOneChild.meta && onlyOneChild.meta.icon"
            :icon-class="onlyOneChild.meta.icon"
          />
          <template #title>
            {{ translateRouteTitleI18n(onlyOneChild.meta.title) }}
          </template>
        </el-menu-item>
      </app-link>
    </template>

    <!-- 当前路由包含子路显示  -->
    <el-sub-menu v-else :index="resolvePath(item.path)" teleported>
      <template #title>
        <svg-icon
          v-if="item.meta && item.meta.icon"
          :icon-class="item.meta.icon"
        />
        <span v-if="item.meta && item.meta.title">{{
          translateRouteTitleI18n(item.meta.title)
        }}</span>
      </template>

      <sidebar-item
        v-for="child in item.children"
        :key="child.path"
        :item="child"
        :base-path="resolvePath(child.path)"
      />
    </el-sub-menu>
  </div>
</template>
