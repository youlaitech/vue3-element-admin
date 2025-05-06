<template>
  <div class="tags-container">
    <!-- 水平滚动容器 -->
    <el-scrollbar ref="scrollbarRef" class="scroll-container" @wheel="handleScroll">
      <router-link
        v-for="tag in visitedViews"
        ref="tagRef"
        :key="tag.fullPath"
        :class="'tags-item ' + (tagsViewStore.isActive(tag) ? 'active' : '')"
        :to="{ path: tag.path, query: tag.query }"
        @click.middle="!isAffix(tag) ? closeSelectedTag(tag) : ''"
        @contextmenu.prevent="openContentMenu(tag, $event)"
      >
        <!-- 标签文本 -->
        <span class="tag-text">{{ translateRouteTitle(tag.title) }}</span>
        <!-- 关闭按钮，固定标签不显示 -->
        <span
          v-if="!isAffix(tag)"
          class="tag-close-icon"
          @click.prevent.stop="closeSelectedTag(tag)"
        >
          ×
        </span>
      </router-link>
    </el-scrollbar>

    <!-- 标签右键菜单 -->
    <ul
      v-show="contentMenuVisible"
      class="contextmenu"
      :style="{ left: left + 'px', top: top + 'px' }"
    >
      <li @click="refreshSelectedTag(selectedTag)">
        <div class="i-svg:refresh" />
        刷新
      </li>
      <li v-if="!isAffix(selectedTag)" @click="closeSelectedTag(selectedTag)">
        <div class="i-svg:close" />
        关闭
      </li>
      <li @click="closeOtherTags">
        <div class="i-svg:close_other" />
        关闭其它
      </li>
      <li v-if="!isFirstView()" @click="closeLeftTags">
        <div class="i-svg:close_left" />
        关闭左侧
      </li>
      <li v-if="!isLastView()" @click="closeRightTags">
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
import { useRoute, useRouter, RouteRecordRaw } from "vue-router";
import { resolve } from "path-browserify";
import { translateRouteTitle } from "@/utils/i18n";

import { usePermissionStore, useTagsViewStore, useSettingsStore, useAppStore } from "@/store";

const instance = getCurrentInstance();
const proxy = instance?.proxy;
const router = useRouter();
const route = useRoute();

// 权限、标签页状态管理
const permissionStore = usePermissionStore();
const tagsViewStore = useTagsViewStore();
const appStore = useAppStore();

// 响应式引用访问已访问的标签视图列表
const { visitedViews } = storeToRefs(tagsViewStore);
const settingsStore = useSettingsStore();
const layout = computed(() => settingsStore.layout);

// 当前选中的标签
const selectedTag = ref<TagView>({
  path: "",
  fullPath: "",
  name: "",
  title: "",
  affix: false,
  keepAlive: false,
});

// 固定标签列表
const affixTags = ref<TagView[]>([]);
// 右键菜单位置
const left = ref(0);
const top = ref(0);

// 监听路由变化，添加标签并移动到当前标签位置
watch(
  route,
  () => {
    addTags();
    moveToCurrentTag();
  },
  {
    immediate: true, // 初始化立即执行
  }
);

// 右键菜单显示状态
const contentMenuVisible = ref(false);
// 监听右键菜单显示状态，添加或移除点击事件监听器
watch(contentMenuVisible, (value) => {
  if (value) {
    document.body.addEventListener("click", closeContentMenu);
  } else {
    document.body.removeEventListener("click", closeContentMenu);
  }
});

/**
 * 过滤出需要固定的标签
 * @param routes 路由配置
 * @param basePath 基础路径
 * @returns 固定标签列表
 */
function filterAffixTags(routes: RouteRecordRaw[], basePath = "/") {
  let tags: TagView[] = [];
  routes.forEach((route: RouteRecordRaw) => {
    const tagPath = resolve(basePath, route.path);
    // 当路由设置了meta.affix属性时，加入固定标签列表
    if (route.meta?.affix) {
      tags.push({
        path: tagPath,
        fullPath: tagPath,
        name: String(route.name),
        title: route.meta?.title || "no-name",
        affix: route.meta?.affix,
        keepAlive: route.meta?.keepAlive,
      });
    }
    // 递归处理子路由
    if (route.children) {
      const tempTags = filterAffixTags(route.children, basePath + route.path);
      if (tempTags.length >= 1) {
        tags = [...tags, ...tempTags];
      }
    }
  });
  return tags;
}

/**
 * 初始化标签列表，添加需要固定的标签
 */
function initTags() {
  const tags: TagView[] = filterAffixTags(permissionStore.routes);
  affixTags.value = tags;
  for (const tag of tags) {
    // 必须有标签名称才添加
    if (tag.name) {
      tagsViewStore.addVisitedView(tag);
    }
  }
}

/**
 * 添加当前路由到标签列表
 */
function addTags() {
  if (route.meta.title) {
    tagsViewStore.addView({
      name: route.name as string,
      title: route.meta.title,
      path: route.path,
      fullPath: route.fullPath,
      affix: route.meta?.affix,
      keepAlive: route.meta?.keepAlive,
      query: route.query,
    });
  }
}

/**
 * the purpose of this function is make sure to move the current active tag into the view
 */
function moveToCurrentTag() {
  // 使用 nextTick() 确保在更新 tagsView 组件之前滚动到正确位置
  nextTick(() => {
    for (const tag of visitedViews.value) {
      if (tag.path === route.path) {
        // 当查询参数不同时更新标签
        if (tag.fullPath !== route.fullPath) {
          tagsViewStore.updateVisitedView({
            name: route.name as string,
            title: route.meta.title || "",
            path: route.path,
            fullPath: route.fullPath,
            affix: route.meta?.affix,
            keepAlive: route.meta?.keepAlive,
            query: route.query,
          });
        }
      }
    }
  });
}

/**
 * 判断标签是否为固定标签
 * @param tag 标签对象
 * @returns 是否为固定标签
 */
function isAffix(tag: TagView) {
  return tag?.affix;
}

/**
 * 判断选中的标签是否为第一个可见标签
 * @returns 是否为第一个可见标签
 */
function isFirstView() {
  return (
    selectedTag.value.path === "/dashboard" ||
    selectedTag.value.fullPath === tagsViewStore.visitedViews[1]?.fullPath
  );
}

/**
 * 判断选中的标签是否为最后一个可见标签
 * @returns 是否为最后一个可见标签
 */
function isLastView() {
  return (
    selectedTag.value.fullPath ===
    tagsViewStore.visitedViews[tagsViewStore.visitedViews.length - 1]?.fullPath
  );
}

/**
 * 刷新选中的标签页
 * @param view 标签对象
 */
function refreshSelectedTag(view: TagView) {
  tagsViewStore.delCachedView(view);
  const { fullPath } = view;
  nextTick(() => {
    router.replace("/redirect" + fullPath);
  });
}

/**
 * 关闭选中的标签页
 * @param view 标签对象
 */
function closeSelectedTag(view: TagView) {
  tagsViewStore.delView(view).then((res: any) => {
    if (tagsViewStore.isActive(view)) {
      tagsViewStore.toLastView(res.visitedViews, view);
    }
  });
}

/**
 * 关闭选中标签左侧的所有标签
 */
function closeLeftTags() {
  tagsViewStore.delLeftViews(selectedTag.value).then((res: any) => {
    if (!res.visitedViews.find((item: any) => item.path === route.path)) {
      tagsViewStore.toLastView(res.visitedViews);
    }
  });
}

/**
 * 关闭选中标签右侧的所有标签
 */
function closeRightTags() {
  tagsViewStore.delRightViews(selectedTag.value).then((res: any) => {
    if (!res.visitedViews.find((item: any) => item.path === route.path)) {
      tagsViewStore.toLastView(res.visitedViews);
    }
  });
}

/**
 * 关闭除选中标签外的所有标签
 */
function closeOtherTags() {
  router.push(selectedTag.value);
  tagsViewStore.delOtherViews(selectedTag.value).then(() => {
    moveToCurrentTag();
  });
}

/**
 * 关闭所有标签
 * @param view 标签对象
 */
function closeAllTags(view: TagView) {
  tagsViewStore.delAllViews().then((res: any) => {
    tagsViewStore.toLastView(res.visitedViews, view);
  });
}

/**
 * 打开右键菜单
 * @param tag 标签对象
 * @param e 鼠标事件
 */
function openContentMenu(tag: TagView, e: MouseEvent) {
  const menuMinWidth = 105;
  const offsetLeft = proxy?.$el.getBoundingClientRect().left; // 容器左边距
  const offsetWidth = proxy?.$el.offsetWidth; // 容器宽度
  const maxLeft = offsetWidth - menuMinWidth; // 左边界
  const leftPosition = e.clientX - offsetLeft + 15; // 15: 右边距

  // 确保菜单不超出容器右边界
  if (leftPosition > maxLeft) {
    left.value = maxLeft;
  } else {
    left.value = leftPosition;
  }

  // 混合模式下，需要减去顶部菜单(fixed)的高度
  if (layout.value === "mix") {
    top.value = e.clientY - 50;
  } else {
    top.value = e.clientY;
  }

  contentMenuVisible.value = true;
  selectedTag.value = tag;
}

/**
 * 关闭右键菜单
 */
function closeContentMenu() {
  contentMenuVisible.value = false;
}

/**
 * 处理鼠标滚轮事件，实现水平滚动
 */
const scrollbarRef = ref();
function handleScroll(event: any) {
  closeContentMenu();
  // 检查是否有横向滚动条
  if (scrollbarRef.value.wrapRef.scrollWidth > scrollbarRef.value.wrapRef.clientWidth) {
    const wheelDelta = event.wheelDelta || 0; // 向上滚动时为120，向下滚动时为-120
    const scrollLeft = scrollbarRef.value.wrapRef.scrollLeft; // 当前滚动条到左边的距离
    // 设置滚动条到左边的距离
    scrollbarRef.value.setScrollLeft(scrollLeft - wheelDelta);
  }
}

/**
 * 寻找最外层父节点
 * @param tree 路由树
 * @param findName 要查找的节点名称
 * @returns 最外层父节点
 */
function findOutermostParent(tree: any[], findName: string) {
  let parentMap: any = {};

  function buildParentMap(node: any, parent: any) {
    parentMap[node.name] = parent;

    if (node.children) {
      for (let i = 0; i < node.children.length; i++) {
        buildParentMap(node.children[i], node);
      }
    }
  }

  for (let i = 0; i < tree.length; i++) {
    buildParentMap(tree[i], null);
  }

  let currentNode = parentMap[findName];
  while (currentNode) {
    if (!parentMap[currentNode.name]) {
      return currentNode;
    }
    currentNode = parentMap[currentNode.name];
  }

  return null;
}

/**
 * 重新激活顶部菜单
 * @param newVal 新的路由名
 */
const againActiveTop = (newVal: string) => {
  if (layout.value !== "mix") return;
  const parent = findOutermostParent(permissionStore.routes, newVal);
  if (appStore.activeTopMenu !== parent.path) {
    appStore.activeTopMenu(parent.path);
  }
};

// 如果是混合模式，更改selectedTag，需要对应高亮的activeTop
watch(
  () => route.name,
  (newVal) => {
    if (newVal) {
      againActiveTop(newVal as string);
    }
  },
  {
    deep: true,
  }
);

// 组件挂载时初始化标签
onMounted(() => {
  initTags();
});
</script>

<style lang="scss" scoped>
.tags-container {
  width: 100%;
  height: $tags-view-height;
  background-color: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  box-shadow: 0 1px 1px var(--el-box-shadow-light);

  /* 滚动容器样式 */
  .scroll-container {
    white-space: nowrap;
  }

  /* 标签项样式 */
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

    /* 第一个和最后一个标签的边距调整 */
    &:first-of-type {
      margin-left: 15px;
    }
    &:last-of-type {
      margin-right: 15px;
    }

    /* 标签文本样式 */
    .tag-text {
      display: inline-block;
      vertical-align: middle;
    }

    /* 关闭按钮样式 */
    .tag-close-icon {
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

    /* 活动标签样式 */
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

      /* 活动标签关闭按钮样式 */
      .tag-close-icon {
        color: var(--el-color-white);

        &:hover {
          color: var(--el-color-white);
          background-color: rgba(255, 255, 255, 0.3);
        }
      }
    }
  }

  /* 右键菜单样式 */
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

    /* 菜单项样式 */
    li {
      padding: 7px 16px;
      margin: 0;
      cursor: pointer;
      &:hover {
        background: var(--el-fill-color-light);
      }
    }
  }
}
</style>
