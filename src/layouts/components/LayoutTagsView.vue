<template>
  <div :class="['tags-container', tagsStyleClass]">
    <!-- 页签滚动区 -->
    <el-scrollbar
      ref="scrollbarRef"
      class="scroll-container"
      :view-style="{ height: '100%' }"
      @wheel="handleScroll"
    >
      <div class="tags-wrapper">
        <div
          v-for="tag in visitedViews"
          :key="tag.fullPath"
          class="tags-item"
          :class="{
            'is-active': tagsViewStore.isActive(tag),
            'is-affix': tag.affix,
          }"
          @click="
            router.push({
              path: tag.fullPath,
              query: tag.query,
            })
          "
          @click.middle="handleMiddleClick(tag)"
          @contextmenu.prevent="openContextMenu(tag, $event)"
        >
          <template v-if="tag.icon">
            <el-icon v-if="isEpIcon(tag.icon)" :size="14">
              <component :is="toEpIconName(tag.icon)" />
            </el-icon>
            <span v-else class="tags-item__icon" :class="`i-svg:${tag.icon}`" />
          </template>
          <span class="tags-item__text">
            {{ translateRouteTitle(tag.title) }}
          </span>
          <span v-if="!tag.affix" class="tags-item__close" @click.stop="closeSelectedTag(tag)">
            <div class="i-svg:close" />
          </span>
        </div>
      </div>
    </el-scrollbar>

    <div class="tags-actions">
      <button
        type="button"
        class="tags-actions__btn"
        aria-label="刷新当前"
        title="刷新当前"
        @click="refreshSelectedTag(currentTag)"
      >
        <el-icon :size="16"><Refresh /></el-icon>
      </button>
      <button
        type="button"
        class="tags-actions__btn"
        aria-label="内容全屏"
        title="内容全屏"
        @click="appStore.toggleContentFullscreen()"
      >
        <div v-if="!appStore.contentFullscreen" class="i-svg:fullscreen icon-16" />
        <div v-else class="i-svg:fullscreen-exit icon-16" />
      </button>
      <el-dropdown trigger="click" @command="handleActionCommand">
        <button type="button" class="tags-actions__btn" aria-label="页签操作" title="页签操作">
          <el-icon :size="16"><ArrowDown /></el-icon>
        </button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="refresh">
              <el-icon :size="14" class="icon-14"><Refresh /></el-icon>
              <span>刷新当前</span>
            </el-dropdown-item>
            <el-dropdown-item v-if="currentTag && !currentTag.affix" command="closeCurrent">
              <div class="i-svg:close icon-14" />
              <span>关闭当前</span>
            </el-dropdown-item>
            <el-dropdown-item divided command="closeOtherTags">
              <div class="i-svg:close_other icon-14" />
              <span>关闭其它</span>
            </el-dropdown-item>
            <el-dropdown-item command="closeLeftTags">
              <div class="i-svg:close_left icon-14" />
              <span>关闭左侧</span>
            </el-dropdown-item>
            <el-dropdown-item command="closeRightTags">
              <div class="i-svg:close_right icon-14" />
              <span>关闭右侧</span>
            </el-dropdown-item>
            <el-dropdown-item divided command="closeAllTags">
              <div class="i-svg:close_all icon-14" />
              <span>关闭所有</span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <!-- 右键菜单 -->
    <Teleport to="body">
      <ul v-show="contextMenu.visible" class="contextmenu" :style="contextMenuStyle">
        <li @click="refreshSelectedTag(selectedTag)">
          <el-icon :size="16" class="contextmenu__icon"><Refresh /></el-icon>
          <span>刷新</span>
        </li>
        <li
          v-if="!selectedTag?.affix"
          class="contextmenu__danger"
          @click="closeSelectedTag(selectedTag)"
        >
          <div class="i-svg:close contextmenu__icon" />
          <span>关闭</span>
        </li>
        <li class="contextmenu__divider" />
        <li @click="closeOtherTags">
          <div class="i-svg:close_other contextmenu__icon" />
          <span>关闭其它</span>
        </li>
        <li v-if="!isFirstView" @click="closeLeftTags">
          <div class="i-svg:close_left contextmenu__icon" />
          <span>关闭左侧</span>
        </li>
        <li v-if="!isLastView" @click="closeRightTags">
          <div class="i-svg:close_right contextmenu__icon" />
          <span>关闭右侧</span>
        </li>
        <li class="contextmenu__divider" />
        <li @click="closeAllTags(selectedTag)">
          <div class="i-svg:close_all contextmenu__icon" />
          <span>关闭所有</span>
        </li>
      </ul>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter, type RouteRecordRaw } from "vue-router";
import { resolve } from "path-browserify";
import { TagsViewStyle } from "@/enums";
import { translateRouteTitle } from "@/lang/utils";
import { useAppStore, usePermissionStore, useSettingsStore, useTagsViewStore } from "@/stores";
import type { TagView } from "@/stores/tags-view";

interface ContextMenu {
  visible: boolean;
  x: number;
  y: number;
}

const router = useRouter();
const route = useRoute();

const appStore = useAppStore();
const permissionStore = usePermissionStore();
const settingsStore = useSettingsStore();
const tagsViewStore = useTagsViewStore();

const { visitedViews } = storeToRefs(tagsViewStore);

const selectedTag = ref<TagView | null>(null);

const contextMenu = reactive<ContextMenu>({
  visible: false,
  x: 0,
  y: 0,
});

const scrollbarRef = ref();

const currentTag = computed(() => {
  return visitedViews.value.find((tag) => tagsViewStore.isActive(tag)) || null;
});

const tagsStyleClass = computed(() => {
  switch (settingsStore.tagsViewStyle) {
    case TagsViewStyle.CARD:
      return "tags-container--card";
    case TagsViewStyle.LINE:
    default:
      return "tags-container--line";
  }
});

const isEpIcon = (icon: string) => icon.startsWith("el-icon");

const toEpIconName = (icon: string) =>
  icon.replace("el-icon-", "").replace(/(^|-)\w/g, (s) => s.slice(-1).toUpperCase());

const contextMenuStyle = computed(() => {
  const menuWidth = 160;
  const menuHeight = 220;
  const padding = 8;

  let x = contextMenu.x;
  let y = contextMenu.y;

  if (x + menuWidth > window.innerWidth) {
    x = window.innerWidth - menuWidth - padding;
  }
  if (y + menuHeight > window.innerHeight) {
    y = window.innerHeight - menuHeight - padding;
  }

  return {
    left: `${Math.max(padding, x)}px`,
    top: `${Math.max(padding, y)}px`,
  };
});

const handleActionCommand = (command: string) => {
  switch (command) {
    case "refresh":
      refreshSelectedTag(currentTag.value);
      break;
    case "closeCurrent":
      closeSelectedTag(currentTag.value);
      break;
    case "closeOtherTags":
      closeOtherTagsForActive();
      break;
    case "closeLeftTags":
      closeLeftTagsForActive();
      break;
    case "closeRightTags":
      closeRightTagsForActive();
      break;
    case "closeAllTags":
      closeAllTags(currentTag.value);
      break;
  }
};

const routePathMap = computed(() => {
  const map = new Map<string, TagView>();
  visitedViews.value.forEach((tag) => {
    map.set(tag.path, tag);
  });
  return map;
});

const isFirstView = computed(() => {
  if (!selectedTag.value) return false;
  return (
    selectedTag.value.path === "/dashboard" ||
    selectedTag.value.fullPath === visitedViews.value[1]?.fullPath
  );
});

const isLastView = computed(() => {
  if (!selectedTag.value) return false;
  return selectedTag.value.fullPath === visitedViews.value[visitedViews.value.length - 1]?.fullPath;
});

const extractAffixTags = (routes: RouteRecordRaw[], basePath = "/"): TagView[] => {
  const affixTags: TagView[] = [];

  const traverse = (routeList: RouteRecordRaw[], currentBasePath: string) => {
    routeList.forEach((route) => {
      const fullPath = resolve(currentBasePath, route.path);

      if (route.meta?.affix) {
        affixTags.push({
          path: fullPath,
          fullPath,
          name: String(route.name || ""),
          title: route.meta.title || "no-name",
          icon: route.meta.icon,
          affix: true,
          keepAlive: route.meta.keepAlive || false,
        });
      }

      if (route.children?.length) {
        traverse(route.children, fullPath);
      }
    });
  };

  traverse(routes, basePath);
  return affixTags;
};

const initAffixTags = () => {
  const affixTags = extractAffixTags(permissionStore.routes);

  affixTags.forEach((tag) => {
    if (tag.name) {
      tagsViewStore.addVisitedView(tag);
    }
  });
};

const addCurrentTag = () => {
  if (!route.meta?.title) return;

  tagsViewStore.addView({
    name: route.name as string,
    title: route.meta.title,
    path: route.path,
    fullPath: route.fullPath,
    icon: route.meta.icon,
    affix: route.meta.affix || false,
    keepAlive: route.meta.keepAlive || false,
    query: route.query,
  });
};

const updateCurrentTag = () => {
  nextTick(() => {
    const currentTag = routePathMap.value.get(route.path);

    if (currentTag && currentTag.fullPath !== route.fullPath) {
      tagsViewStore.updateVisitedView({
        name: route.name as string,
        title: route.meta?.title || "",
        path: route.path,
        fullPath: route.fullPath,
        icon: route.meta?.icon,
        affix: route.meta?.affix || false,
        keepAlive: route.meta?.keepAlive || false,
        query: route.query,
      });
    }
  });
};

const handleMiddleClick = (tag: TagView) => {
  if (!tag.affix) {
    closeSelectedTag(tag);
  }
};

const openContextMenu = (tag: TagView, event: MouseEvent) => {
  contextMenu.x = event.clientX;
  contextMenu.y = event.clientY;
  contextMenu.visible = true;
  selectedTag.value = tag;
};

const closeContextMenu = () => {
  contextMenu.visible = false;
};

const handleScroll = (event: WheelEvent) => {
  closeContextMenu();

  const scrollWrapper = scrollbarRef.value?.wrapRef;
  if (!scrollWrapper) return;

  const hasHorizontalScroll = scrollWrapper.scrollWidth > scrollWrapper.clientWidth;
  if (!hasHorizontalScroll) return;

  const legacyEvent = event as WheelEvent & { wheelDelta?: number };
  const deltaY = event.deltaY || -(legacyEvent.wheelDelta ?? 0);
  const newScrollLeft = scrollWrapper.scrollLeft + deltaY;

  scrollbarRef.value.setScrollLeft(newScrollLeft);
};

const refreshSelectedTag = (tag: TagView | null) => {
  if (!tag) return;

  tagsViewStore.delCachedView(tag);
  nextTick(() => {
    router.replace("/redirect" + tag.fullPath);
  });
};

const closeSelectedTag = (tag: TagView | null) => {
  if (!tag) return;

  tagsViewStore.delView(tag).then((result) => {
    if (tagsViewStore.isActive(tag)) {
      tagsViewStore.toLastView(result.visitedViews, tag);
    }
  });
};

/**
 * 关闭指定方向的标签
 */
function closeDirectionalTags(
  source: Ref<TagView | null>,
  batchFn: (tag: TagView) => Promise<{ visitedViews: TagView[] }>
) {
  const tag = source.value;
  if (!tag) return;

  batchFn(tag).then(({ visitedViews }) => {
    const stillVisible = visitedViews.some((v) => v.path === route.path);
    if (!stillVisible) {
      tagsViewStore.toLastView(visitedViews);
    }
  });
}

/**
 * 关闭当前激活标签之外的其它标签
 */
const closeOtherTagsForActive = () => {
  if (!currentTag.value) return;
  tagsViewStore.delOtherViews(currentTag.value).then(() => {
    updateCurrentTag();
  });
};

const closeLeftTagsForActive = () => closeDirectionalTags(currentTag, tagsViewStore.delLeftViews);
const closeRightTagsForActive = () => closeDirectionalTags(currentTag, tagsViewStore.delRightViews);
const closeLeftTags = () => closeDirectionalTags(selectedTag, tagsViewStore.delLeftViews);
const closeRightTags = () => closeDirectionalTags(selectedTag, tagsViewStore.delRightViews);

const closeOtherTags = () => {
  if (!selectedTag.value) return;
  router.push(selectedTag.value);
  tagsViewStore.delOtherViews(selectedTag.value).then(() => {
    updateCurrentTag();
  });
};

const closeAllTags = (tag: TagView | null) => {
  tagsViewStore.delAllViews().then((result) => {
    tagsViewStore.toLastView(result.visitedViews, tag || undefined);
  });
};

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

  onBeforeUnmount(() => {
    document.removeEventListener("click", handleOutsideClick);
  });
};

watch(
  route,
  () => {
    addCurrentTag();
    updateCurrentTag();
  },
  { immediate: true }
);

onMounted(() => {
  initAffixTags();
});

useContextMenuManager();
</script>

<style lang="scss" scoped>
// ============================================
// 容器
// ============================================

.tags-container {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  width: 100%;
  height: $tags-view-height;
  padding: 0 12px;
  background-color: var(--content-bg);
  border-bottom: 1px solid var(--card-border);
}

.scroll-container {
  flex: 1;
  min-width: 0;
  height: 100%;

  :deep(.el-scrollbar__wrap) {
    overflow-y: hidden;
  }
}

// ============================================
// 标签列表
// ============================================

.tags-wrapper {
  display: flex;
  gap: 4px;
  align-items: center;
  height: 100%;
}

// ============================================
// 标签项
// ============================================

.tags-item {
  position: relative;
  display: inline-flex;
  flex-shrink: 0;
  gap: 6px;
  align-items: center;
  height: 26px;
  padding: 0 12px;
  font-size: 13px;
  color: var(--el-text-color-regular);
  cursor: pointer;
  user-select: none;
  background: #f8fafc;
  border: 1px solid var(--card-border);
  border-radius: 2px;
  transition:
    color 0.15s ease,
    background-color 0.15s ease,
    border-color 0.15s ease;

  &__icon {
    flex-shrink: 0;
    width: 14px;
    height: 14px;
    opacity: 0.5;
    transition: opacity 0.15s ease;
  }

  &__text {
    white-space: nowrap;
  }

  &__close {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    margin-left: 1px;
    font-size: 0;
    border-radius: 4px;
    opacity: 0;
    transition:
      opacity 0.12s ease,
      background-color 0.12s ease;

    :deep(div) {
      width: 12px;
      height: 12px;
    }

    &:hover {
      background-color: rgb(0 0 0 / 10%);
    }
  }

  &:hover {
    color: var(--el-text-color-primary);
    background-color: var(--content-bg);
    border-color: var(--el-border-color);

    .tags-item__close {
      opacity: 1;
    }

    .tags-item__icon {
      opacity: 0.7;
    }
  }

  &.is-active {
    font-weight: 500;
    color: var(--el-color-primary);
    background-color: var(--content-bg);
    border-color: var(--el-color-primary-light-5);

    .tags-item__icon {
      color: var(--el-color-primary);
      opacity: 1;
    }

    .tags-item__close {
      opacity: 0.6;

      &:hover {
        background-color: var(--el-color-primary-light-7);
        opacity: 1;
      }
    }
  }

  // 固定标签 — 不可关闭，视觉上与未激活一致
  &.is-affix {
    .tags-item__text {
      font-weight: 500;
    }
  }
}

.tags-container--line {
  .tags-wrapper {
    gap: 8px;
  }

  .tags-item {
    height: 100%;
    padding: 0 8px;
    color: var(--el-text-color-secondary);
    background: transparent;
    border: 0;
    border-radius: 0;

    &::after {
      position: absolute;
      right: 6px;
      bottom: 0;
      left: 6px;
      height: 2px;
      content: "";
      background: var(--el-color-primary);
      transform: scaleX(0);
      transform-origin: center;
      transition: transform 0.16s ease;
    }

    &:hover {
      color: var(--el-text-color-primary);
      background: var(--el-fill-color-lighter);
      border-color: transparent;
      border-radius: 4px 4px 0 0;
    }

    &.is-active {
      color: var(--el-color-primary);
      background: transparent;
      border-color: transparent;

      &::after {
        transform: scaleX(1);
      }
    }
  }
}

.tags-container--card {
  .tags-wrapper {
    gap: 8px;
  }

  .tags-item {
    height: 28px;
    padding: 0 10px;
    color: var(--el-text-color-secondary);
    background: transparent;
    border-color: transparent;
    border-radius: 4px;

    &:hover {
      color: var(--el-text-color-primary);
      background: var(--el-fill-color-lighter);
      border-color: transparent;
    }

    &.is-active {
      color: var(--el-color-primary);
      background: var(--el-color-primary-light-9);
      border-color: var(--el-color-primary-light-6);
    }
  }
}

// ============================================
// 右侧操作按钮
// ============================================

.tags-actions {
  display: flex;
  flex-shrink: 0;
  gap: 4px;
  align-items: center;
  height: 100%;
  padding-left: 8px;

  &__btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    padding: 0;
    font: inherit;
    color: var(--el-text-color-regular);
    appearance: none;
    cursor: pointer;
    background: transparent;
    border: 0;
    border-radius: 6px;
    transition:
      color 0.15s ease,
      background-color 0.15s ease;

    &:hover {
      color: var(--el-color-primary);
      background-color: color-mix(in srgb, var(--el-color-primary) 10%, transparent);
    }

    &:focus-visible {
      outline: 2px solid var(--el-color-primary-light-5);
      outline-offset: 1px;
    }

    :deep(.el-icon) {
      color: currentcolor;
      --color: currentcolor;
    }

    .icon-16 {
      color: currentcolor;
      background-color: currentcolor;
    }
  }
}

.icon-16 {
  width: 16px;
  height: 16px;
}

.icon-14 {
  flex-shrink: 0;
  width: 14px;
  height: 14px;
  margin-right: 6px;
  opacity: 0.55;

  &.el-icon {
    width: 14px;
    height: 14px;
  }
}

// ============================================
// 右键菜单
// ============================================

.contextmenu {
  position: fixed;
  z-index: 3000;
  min-width: 150px;
  padding: 6px;
  margin: 0;
  font-size: 13px;
  color: var(--el-text-color-primary);
  list-style-type: none;
  background: var(--el-bg-color-overlay);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
  box-shadow: var(--el-box-shadow);

  li {
    display: flex;
    gap: 10px;
    align-items: center;
    padding: 7px 10px;
    margin: 1px 0;
    cursor: pointer;
    border-radius: 6px;
    transition: background-color 0.15s ease;

    &:hover {
      background: var(--el-fill-color-light);
    }
  }

  &__icon {
    flex-shrink: 0;
    width: 16px;
    height: 16px;
    opacity: 0.55;
  }

  &__danger {
    &:hover {
      color: var(--el-color-danger);
      background-color: var(--el-color-danger-light-9);

      .contextmenu__icon {
        opacity: 1;
      }
    }
  }

  &__divider {
    height: 1px;
    padding: 0 !important;
    margin: 5px 8px !important;
    pointer-events: none;
    cursor: default !important;
    background-color: var(--el-border-color-lighter);

    &:hover {
      background-color: var(--el-border-color-lighter) !important;
    }
  }
}
</style>
