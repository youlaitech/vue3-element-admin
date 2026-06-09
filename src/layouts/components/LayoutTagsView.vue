<template>
  <div class="tags-container">
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

    <!-- 右侧操作 -->
    <div class="tags-actions">
      <!-- 刷新当前 -->
      <span class="tags-actions__btn" @click="refreshSelectedTag(currentTag)">
        <el-icon :size="16"><Refresh /></el-icon>
      </span>
      <!-- 内容全屏 -->
      <span class="tags-actions__btn" @click="appStore.toggleContentFullscreen()">
        <el-icon :size="16">
          <FullScreen v-if="!appStore.contentFullscreen" />
          <Close v-else />
        </el-icon>
      </span>
      <!-- 下拉菜单 -->
      <el-dropdown trigger="click" @command="handleActionCommand">
        <span class="tags-actions__btn">
          <el-icon :size="16"><ArrowDown /></el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="refresh">
              <el-icon :size="14" class="tags-actions__dropdown-icon">
                <Refresh />
              </el-icon>
              <span>刷新当前</span>
            </el-dropdown-item>
            <el-dropdown-item v-if="currentTag && !currentTag.affix" command="closeCurrent">
              <el-icon :size="14" class="tags-actions__dropdown-icon">
                <Close />
              </el-icon>
              <span>关闭当前</span>
            </el-dropdown-item>
            <el-dropdown-item divided command="closeOthers">
              <el-icon :size="14" class="tags-actions__dropdown-icon">
                <Remove />
              </el-icon>
              <span>关闭其它</span>
            </el-dropdown-item>
            <el-dropdown-item command="closeLeft">
              <el-icon :size="14" class="tags-actions__dropdown-icon">
                <DArrowLeft />
              </el-icon>
              <span>关闭左侧</span>
            </el-dropdown-item>
            <el-dropdown-item command="closeRight">
              <el-icon :size="14" class="tags-actions__dropdown-icon">
                <DArrowRight />
              </el-icon>
              <span>关闭右侧</span>
            </el-dropdown-item>
            <el-dropdown-item divided command="closeAll">
              <el-icon :size="14" class="tags-actions__dropdown-icon">
                <CircleClose />
              </el-icon>
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
          <el-icon :size="16" class="contextmenu__icon"><Close /></el-icon>
          <span>关闭</span>
        </li>
        <li class="contextmenu__divider" />
        <li @click="closeOtherTags">
          <el-icon :size="16" class="contextmenu__icon"><Remove /></el-icon>
          <span>关闭其它</span>
        </li>
        <li v-if="!isFirstView" @click="closeLeftTags">
          <el-icon :size="16" class="contextmenu__icon"><DArrowLeft /></el-icon>
          <span>关闭左侧</span>
        </li>
        <li v-if="!isLastView" @click="closeRightTags">
          <el-icon :size="16" class="contextmenu__icon"><DArrowRight /></el-icon>
          <span>关闭右侧</span>
        </li>
        <li class="contextmenu__divider" />
        <li @click="closeAllTags(selectedTag)">
          <el-icon :size="16" class="contextmenu__icon"><CircleClose /></el-icon>
          <span>关闭所有</span>
        </li>
      </ul>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter, type RouteRecordRaw } from "vue-router";
import { resolve } from "path-browserify";
import { translateRouteTitle } from "@/lang/utils";
import { useAppStore, usePermissionStore, useTagsViewStore } from "@/stores";

interface ContextMenu {
  visible: boolean;
  x: number;
  y: number;
}

const router = useRouter();
const route = useRoute();

const appStore = useAppStore();
const permissionStore = usePermissionStore();
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

// 图标兼容：判断是否为 Element Plus 图标 (el-icon-xxx)
const isEpIcon = (icon: string) => icon.startsWith("el-icon");

// 图标兼容：el-icon-xxx → PascalCase 组件名
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

// 标签栏右侧操作按钮分发
const handleActionCommand = (command: string) => {
  switch (command) {
    case "refresh":
      refreshSelectedTag(currentTag.value);
      break;
    case "closeCurrent":
      closeSelectedTag(currentTag.value);
      break;
    case "closeOthers":
      closeOtherTagsForActive();
      break;
    case "closeLeft":
      closeLeftTagsForActive();
      break;
    case "closeRight":
      closeRightTagsForActive();
      break;
    case "closeAll":
      closeAllTags(currentTag.value);
      break;
  }
};

// path → TagView 映射，用于快速查找标签
const routePathMap = computed(() => {
  const map = new Map<string, TagView>();
  visitedViews.value.forEach((tag) => {
    map.set(tag.path, tag);
  });
  return map;
});

// 判断右键选中标签是否为最左侧（不可关闭左侧）
const isFirstView = computed(() => {
  if (!selectedTag.value) return false;
  return (
    selectedTag.value.path === "/dashboard" ||
    selectedTag.value.fullPath === visitedViews.value[1]?.fullPath
  );
});

// 判断右键选中标签是否为最右侧（不可关闭右侧）
const isLastView = computed(() => {
  if (!selectedTag.value) return false;
  return selectedTag.value.fullPath === visitedViews.value[visitedViews.value.length - 1]?.fullPath;
});

// 从路由表中提取所有 affix 固定标签
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

// 鼠标滚轮横向滚动（标签栏超出可视区时生效）
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

// 刷新指定标签页：移除缓存后跳转 redirect 中转页重新加载
const refreshSelectedTag = (tag: TagView | null) => {
  if (!tag) return;

  tagsViewStore.delCachedView(tag);
  nextTick(() => {
    router.replace("/redirect" + tag.fullPath);
  });
};

// 关闭指定标签页，若关闭的是当前激活标签则跳转到最后一个
const closeSelectedTag = (tag: TagView | null) => {
  if (!tag) return;

  tagsViewStore.delView(tag).then((result: any) => {
    if (tagsViewStore.isActive(tag)) {
      tagsViewStore.toLastView(result.visitedViews, tag);
    }
  });
};

/* ------------------------------------------------------------------ */
/*  批量关闭标签（左/右/其它方向）                                     */
/* ------------------------------------------------------------------ */

/**
 * 按方向批量关闭标签的通用执行器。
 *
 * closeLeftTagsForActive / closeRightTagsForActive / closeLeftTags /
 * closeRightTags 四个公开函数均委托此函数，仅 source（标签来源 ref）
 * 和 batchFn（调用的 store 方法）不同。
 *
 * 关闭后若当前路由对应的标签已被移除，自动跳转到最后一个剩余标签。
 */
function closeDirectional(
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

/** 关闭当前激活标签之外的其它标签 */
const closeOtherTagsForActive = () => {
  if (!currentTag.value) return;
  tagsViewStore.delOtherViews(currentTag.value).then(() => {
    updateCurrentTag();
  });
};

// 关闭左侧（当前激活标签）
const closeLeftTagsForActive = () => closeDirectional(currentTag, tagsViewStore.delLeftViews);
// 关闭右侧（当前激活标签）
const closeRightTagsForActive = () => closeDirectional(currentTag, tagsViewStore.delRightViews);
// 关闭左侧（右键选中标签）
const closeLeftTags = () => closeDirectional(selectedTag, tagsViewStore.delLeftViews);
// 关闭右侧（右键选中标签）
const closeRightTags = () => closeDirectional(selectedTag, tagsViewStore.delRightViews);

// 关闭右键选中标签以外的其他标签
const closeOtherTags = () => {
  if (!selectedTag.value) return;
  router.push(selectedTag.value);
  tagsViewStore.delOtherViews(selectedTag.value).then(() => {
    updateCurrentTag();
  });
};

// 关闭所有标签页
const closeAllTags = (tag: TagView | null) => {
  tagsViewStore.delAllViews().then((result: any) => {
    tagsViewStore.toLastView(result.visitedViews, tag || undefined);
  });
};

// 右键菜单生命周期：显示时监听外部点击关闭，卸载时移除监听
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

// 路由变化时同步添加标签并更新激活状态
watch(
  route,
  () => {
    addCurrentTag();
    updateCurrentTag();
  },
  { immediate: true }
);

// 初始化固定标签（affix）
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
  padding: 0 4px 0 8px;
  background-color: var(--content-bg);
  border-bottom: 1px solid var(--border-color);
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
  gap: 6px;
  align-items: center;
  height: 100%;
}

// ============================================
// 标签项
// 未激活: 透明底，融入白色容器背景
// 激活:   浅主色底 + 边框，从背景中"跳"出来
// ============================================

.tags-item {
  display: inline-flex;
  flex-shrink: 0;
  gap: 6px;
  align-items: center;
  height: 30px;
  padding: 0 14px;
  font-size: 13px;
  color: var(--el-text-color-regular);
  cursor: pointer;
  user-select: none;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 8px;
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

  // 悬浮态 — 浅灰底浮现
  &:hover {
    color: var(--el-text-color-primary);
    background-color: var(--el-fill-color-light);

    .tags-item__close {
      opacity: 1;
    }

    .tags-item__icon {
      opacity: 0.7;
    }
  }

  // 激活态 — 浅主色块突出显示
  &.is-active {
    font-weight: 500;
    color: var(--el-color-primary);
    background-color: var(--el-color-primary-light-9);
    border-color: var(--el-color-primary-light-7);

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

// ============================================
// 右侧操作按钮
// ============================================

.tags-actions {
  display: flex;
  flex-shrink: 0;
  gap: 2px;
  align-items: center;
  height: 100%;
  padding-left: 4px;

  &__btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    cursor: pointer;
    border-radius: 6px;
    transition: background-color 0.15s ease;

    &:hover {
      background-color: var(--el-fill-color-light);
    }

    :deep(.el-icon) {
      opacity: 0.45;
    }

    &:hover :deep(.el-icon) {
      opacity: 0.7;
    }
  }

  &__dropdown-icon {
    flex-shrink: 0;
    margin-right: 6px;
    opacity: 0.55;
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
