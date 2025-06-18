<template>
  <div class="tags-container">
    <!-- 水平滚动容器 -->
    <el-scrollbar ref="scrollbarRef" class="scroll-container" @wheel="handleScroll">
      <router-link
        v-for="tag in visitedViews"
        ref="tagRef"
        :key="tag.fullPath"
        :class="['tags-item', { active: tagsViewStore.isActive(tag) }]"
        :to="{ path: tag.path, query: tag.query }"
        @click.middle="handleMiddleClick(tag)"
        @contextmenu.prevent="(event: MouseEvent) => openContextMenu(tag, event)"
      >
        <!-- 标签文本 -->
        <span class="tag-text">{{ translateRouteTitle(tag.title) }}</span>
        <!-- 关闭按钮，固定标签不显示 -->
        <span v-if="!tag.affix" class="tag-close-btn" @click.prevent.stop="closeSelectedTag(tag)">
          ×
        </span>
      </router-link>
    </el-scrollbar>

    <!-- 标签右键菜单 -->
    <ul
      v-show="contextMenu.visible"
      class="contextmenu"
      :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }"
    >
      <li @click="refreshSelectedTag(selectedTag)">
        <div class="i-svg:refresh" />
        刷新
      </li>
      <li v-if="!selectedTag?.affix" @click="closeSelectedTag(selectedTag)">
        <div class="i-svg:close" />
        关闭
      </li>
      <li @click="closeOtherTags">
        <div class="i-svg:close_other" />
        关闭其它
      </li>
      <li v-if="!isFirstView" @click="closeLeftTags">
        <div class="i-svg:close_left" />
        关闭左侧
      </li>
      <li v-if="!isLastView" @click="closeRightTags">
        <div class="i-svg:close_right" />
        关闭右侧
      </li>
      <li @click="closeAllTags(selectedTag)">
        <div class="i-svg:close_all" />
        关闭所有
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter, type RouteRecordRaw } from "vue-router";
import { resolve } from "path-browserify";
import { translateRouteTitle } from "@/utils/i18n";
import { usePermissionStore, useTagsViewStore, useSettingsStore } from "@/store";
import { LayoutMode } from "@/enums";

interface ContextMenu {
  visible: boolean;
  x: number;
  y: number;
}

const instance = getCurrentInstance();
const proxy = instance?.proxy;
const router = useRouter();
const route = useRoute();

// 状态管理
const permissionStore = usePermissionStore();
const tagsViewStore = useTagsViewStore();
const settingsStore = useSettingsStore();

const { visitedViews } = storeToRefs(tagsViewStore);
const layout = computed(() => settingsStore.layout);

// 当前选中的标签
const selectedTag = ref<TagView | null>(null);

// 右键菜单状态
const contextMenu = reactive<ContextMenu>({
  visible: false,
  x: 0,
  y: 0,
});

// 滚动条引用
const scrollbarRef = ref();

// 路由映射缓存，提升查找性能
const routePathMap = computed(() => {
  const map = new Map<string, TagView>();
  visitedViews.value.forEach((tag) => {
    map.set(tag.path, tag);
  });
  return map;
});

// 判断是否为第一个标签
const isFirstView = computed(() => {
  if (!selectedTag.value) return false;
  return (
    selectedTag.value.path === "/dashboard" ||
    selectedTag.value.fullPath === visitedViews.value[1]?.fullPath
  );
});

// 判断是否为最后一个标签
const isLastView = computed(() => {
  if (!selectedTag.value) return false;
  return selectedTag.value.fullPath === visitedViews.value[visitedViews.value.length - 1]?.fullPath;
});

/**
 * 递归提取固定标签
 */
const extractAffixTags = (routes: RouteRecordRaw[], basePath = "/"): TagView[] => {
  const affixTags: TagView[] = [];

  const traverse = (routeList: RouteRecordRaw[], currentBasePath: string) => {
    routeList.forEach((route) => {
      const fullPath = resolve(currentBasePath, route.path);

      // 如果是固定标签，添加到列表
      if (route.meta?.affix) {
        affixTags.push({
          path: fullPath,
          fullPath,
          name: String(route.name || ""),
          title: route.meta.title || "no-name",
          affix: true,
          keepAlive: route.meta.keepAlive || false,
        });
      }

      // 递归处理子路由
      if (route.children?.length) {
        traverse(route.children, fullPath);
      }
    });
  };

  traverse(routes, basePath);
  return affixTags;
};

/**
 * 初始化固定标签
 */
const initAffixTags = () => {
  const affixTags = extractAffixTags(permissionStore.routes);

  affixTags.forEach((tag) => {
    if (tag.name) {
      tagsViewStore.addVisitedView(tag);
    }
  });
};

/**
 * 添加当前路由标签
 */
const addCurrentTag = () => {
  if (!route.meta?.title) return;

  tagsViewStore.addView({
    name: route.name as string,
    title: route.meta.title,
    path: route.path,
    fullPath: route.fullPath,
    affix: route.meta.affix || false,
    keepAlive: route.meta.keepAlive || false,
    query: route.query,
  });
};

/**
 * 更新当前标签
 */
const updateCurrentTag = () => {
  nextTick(() => {
    const currentTag = routePathMap.value.get(route.path);

    if (currentTag && currentTag.fullPath !== route.fullPath) {
      tagsViewStore.updateVisitedView({
        name: route.name as string,
        title: route.meta?.title || "",
        path: route.path,
        fullPath: route.fullPath,
        affix: route.meta?.affix || false,
        keepAlive: route.meta?.keepAlive || false,
        query: route.query,
      });
    }
  });
};

/**
 * 处理中键点击
 */
const handleMiddleClick = (tag: TagView) => {
  if (!tag.affix) {
    closeSelectedTag(tag);
  }
};

/**
 * 打开右键菜单
 */
const openContextMenu = (tag: TagView, event: MouseEvent) => {
  const MENU_MIN_WIDTH = 105;
  const MENU_MARGIN = 15;

  const containerRect = proxy?.$el.getBoundingClientRect();
  const offsetLeft = containerRect?.left || 0;
  const containerWidth = proxy?.$el.offsetWidth || 0;

  const maxLeft = containerWidth - MENU_MIN_WIDTH;
  const leftPosition = event.clientX - offsetLeft + MENU_MARGIN;

  contextMenu.x = Math.min(leftPosition, maxLeft);
  // 混合模式下，需要减去顶部菜单(fixed)的高度
  contextMenu.y = layout.value === LayoutMode.MIX ? event.clientY - 50 : event.clientY;
  contextMenu.visible = true;

  selectedTag.value = tag;
};

/**
 * 关闭右键菜单
 */
const closeContextMenu = () => {
  contextMenu.visible = false;
};

/**
 * 处理滚轮事件
 */
const handleScroll = (event: WheelEvent) => {
  closeContextMenu();

  const scrollWrapper = scrollbarRef.value?.wrapRef;
  if (!scrollWrapper) return;

  const hasHorizontalScroll = scrollWrapper.scrollWidth > scrollWrapper.clientWidth;
  if (!hasHorizontalScroll) return;

  const deltaY = event.deltaY || -(event as any).wheelDelta || 0;
  const newScrollLeft = scrollWrapper.scrollLeft + deltaY;

  scrollbarRef.value.setScrollLeft(newScrollLeft);
};

/**
 * 刷新标签
 */
const refreshSelectedTag = (tag: TagView | null) => {
  if (!tag) return;

  tagsViewStore.delCachedView(tag);
  nextTick(() => {
    router.replace("/redirect" + tag.fullPath);
  });
};

/**
 * 关闭标签
 */
const closeSelectedTag = (tag: TagView | null) => {
  if (!tag) return;

  tagsViewStore.delView(tag).then((result: any) => {
    if (tagsViewStore.isActive(tag)) {
      tagsViewStore.toLastView(result.visitedViews, tag);
    }
  });
};

/**
 * 关闭左侧标签
 */
const closeLeftTags = () => {
  if (!selectedTag.value) return;

  tagsViewStore.delLeftViews(selectedTag.value).then((result: any) => {
    const hasCurrentRoute = result.visitedViews.some((item: TagView) => item.path === route.path);

    if (!hasCurrentRoute) {
      tagsViewStore.toLastView(result.visitedViews);
    }
  });
};

/**
 * 关闭右侧标签
 */
const closeRightTags = () => {
  if (!selectedTag.value) return;

  tagsViewStore.delRightViews(selectedTag.value).then((result: any) => {
    const hasCurrentRoute = result.visitedViews.some((item: TagView) => item.path === route.path);

    if (!hasCurrentRoute) {
      tagsViewStore.toLastView(result.visitedViews);
    }
  });
};

/**
 * 关闭其他标签
 */
const closeOtherTags = () => {
  if (!selectedTag.value) return;

  router.push(selectedTag.value);
  tagsViewStore.delOtherViews(selectedTag.value).then(() => {
    updateCurrentTag();
  });
};

/**
 * 关闭所有标签
 */
const closeAllTags = (tag: TagView | null) => {
  tagsViewStore.delAllViews().then((result: any) => {
    tagsViewStore.toLastView(result.visitedViews, tag || undefined);
  });
};

// 右键菜单管理
const useContextMenuManager = () => {
  const handleOutsideClick = () => {
    closeContextMenu();
  };

  watchEffect(() => {
    if (contextMenu.visible) {
      document.addEventListener("click", handleOutsideClick);
    } else {
      document.removeEventListener("click", handleOutsideClick);
    }
  });

  // 组件卸载时清理
  onBeforeUnmount(() => {
    document.removeEventListener("click", handleOutsideClick);
  });
};

// 监听路由变化
watch(
  route,
  () => {
    addCurrentTag();
    updateCurrentTag();
  },
  { immediate: true }
);

// 初始化
onMounted(() => {
  initAffixTags();
});

// 启用右键菜单管理
useContextMenuManager();
</script>

<style lang="scss" scoped>
.tags-container {
  width: 100%;
  height: $tags-view-height;
  background-color: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  box-shadow: 0 1px 1px var(--el-box-shadow-light);

  .scroll-container {
    white-space: nowrap;
  }

  .tags-item {
    position: relative;
    display: inline-flex;
    align-items: center;
    height: 26px;
    padding: 0 8px;
    margin-top: 4px;
    margin-left: 5px;
    font-size: 12px;
    line-height: 26px;
    color: var(--el-text-color-primary);
    background: var(--el-bg-color);
    border: 1px solid var(--el-border-color);
    transition: all 0.2s ease;

    &:first-of-type {
      margin-left: 15px;
    }
    &:last-of-type {
      margin-right: 15px;
    }

    .tag-text {
      display: inline-block;
      vertical-align: middle;
    }

    .tag-close-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 16px;
      height: 16px;
      margin-left: 5px;
      font-size: 12px;
      font-weight: bold;
      color: var(--el-text-color-secondary);
      cursor: pointer;
      border-radius: 50%;
      transition: all 0.2s ease;

      &:hover {
        color: var(--el-color-white);
        background-color: var(--el-text-color-placeholder);
      }
    }

    &.active {
      color: var(--el-color-white);
      background-color: var(--el-color-primary);
      border-color: var(--el-color-primary);

      &::before {
        position: relative;
        display: inline-block;
        width: 8px;
        height: 8px;
        margin-right: 2px;
        content: "";
        background: var(--el-color-white);
        border-radius: 50%;
      }

      .tag-close-btn {
        color: var(--el-color-white);

        &:hover {
          color: var(--el-color-white);
          background-color: rgba(255, 255, 255, 0.3);
        }
      }
    }
  }

  .contextmenu {
    position: absolute;
    z-index: 3000;
    padding: 5px 0;
    margin: 0;
    font-size: 12px;
    font-weight: 400;
    color: var(--el-text-color-primary);
    list-style-type: none;
    background: var(--el-bg-color);
    border-radius: 4px;
    box-shadow: var(--el-box-shadow-light);

    li {
      display: flex;
      gap: 8px;
      align-items: center;
      padding: 7px 16px;
      margin: 0;
      cursor: pointer;
      transition: background-color 0.2s;

      &:hover {
        background: var(--el-fill-color-light);
      }
    }
  }
}
</style>
