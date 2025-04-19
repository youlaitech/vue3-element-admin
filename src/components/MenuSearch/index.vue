<template>
  <div @click="openSearchModal">
    <div class="i-svg:search" />
    <el-dialog
      v-model="isModalVisible"
      width="30%"
      :append-to-body="true"
      :show-close="false"
      @close="closeSearchModal"
    >
      <template #header>
        <el-input
          ref="searchInputRef"
          v-model="searchKeyword"
          size="large"
          placeholder="输入菜单名称关键字搜索"
          clearable
          @keyup.enter="selectActiveResult"
          @input="updateSearchResults"
          @keydown.up.prevent="navigateResults('up')"
          @keydown.down.prevent="navigateResults('down')"
          @keydown.esc="closeSearchModal"
        >
          <template #prepend>
            <el-button icon="Search" />
          </template>
        </el-input>
      </template>

      <div class="search-result">
        <ul v-if="displayResults.length > 0">
          <li
            v-for="(item, index) in displayResults"
            :key="item.path"
            :class="[
              'search-result__item',
              {
                'search-result__item--active': index === activeIndex,
              },
            ]"
            @click="navigateToRoute(item)"
          >
            <el-icon v-if="item.icon && item.icon.startsWith('el-icon')">
              <component :is="item.icon.replace('el-icon-', '')" />
            </el-icon>
            <div v-else-if="item.icon" :class="`i-svg:${item.icon}`" />
            <div v-else class="i-svg:menu" />
            <span class="ml-2">{{ item.title }}</span>
          </li>
        </ul>
        <el-empty v-else description="暂无数据" />
      </div>

      <template #footer>
        <div class="dialog-footer">
          <div class="ctrl-k-hint">
            <span class="ctrl-k-text">Ctrl+K 快速打开</span>
          </div>
          <div class="shortcuts-group">
            <div class="key-box">
              <div class="key-btn">选择</div>
            </div>
            <div class="arrow-box">
              <div class="arrow-up-down">
                <div class="key-btn">
                  <div class="i-svg:up" />
                </div>
                <div class="key-btn ml-1">
                  <div class="i-svg:down" />
                </div>
              </div>
              <span class="key-text">切换</span>
            </div>
            <div class="key-box">
              <div class="key-btn esc-btn">ESC</div>
              <span class="key-text">关闭</span>
            </div>
          </div>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import router from "@/router";
import { usePermissionStore } from "@/store";
import { isExternal } from "@/utils";
import { RouteRecordRaw } from "vue-router";

const permissionStore = usePermissionStore();
const isModalVisible = ref(false);
const searchKeyword = ref("");
const searchInputRef = ref();
const excludedRoutes = ref(["/redirect", "/login", "/401", "/404"]);
const menuItems = ref<SearchItem[]>([]);
const searchResults = ref<SearchItem[]>([]);
const activeIndex = ref(-1);

interface SearchItem {
  title: string;
  path: string;
  name?: string;
  icon?: string;
  redirect?: string;
}

// 注册全局快捷键
function handleKeyDown(e: KeyboardEvent) {
  // 判断是否为Ctrl+K组合键
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
    e.preventDefault(); // 阻止默认行为
    openSearchModal();
  }
}

// 添加键盘事件监听
onMounted(() => {
  loadRoutes(permissionStore.routes);
  document.addEventListener("keydown", handleKeyDown);
});

// 移除键盘事件监听
onBeforeUnmount(() => {
  document.removeEventListener("keydown", handleKeyDown);
});

// 打开搜索模态框
function openSearchModal() {
  searchKeyword.value = "";
  activeIndex.value = -1;
  isModalVisible.value = true;
  setTimeout(() => {
    searchInputRef.value.focus();
  }, 100);
}

// 关闭搜索模态框
function closeSearchModal() {
  isModalVisible.value = false;
}

// 更新搜索结果
function updateSearchResults() {
  activeIndex.value = -1;
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase();
    searchResults.value = menuItems.value.filter((item) =>
      item.title.toLowerCase().includes(keyword)
    );
  } else {
    searchResults.value = [];
  }
}

// 显示搜索结果
const displayResults = computed(() => searchResults.value);

// 执行搜索
function selectActiveResult() {
  if (displayResults.value.length > 0 && activeIndex.value >= 0) {
    navigateToRoute(displayResults.value[activeIndex.value]);
  }
}

// 导航搜索结果
function navigateResults(direction: string) {
  if (displayResults.value.length === 0) return;

  if (direction === "up") {
    activeIndex.value =
      activeIndex.value <= 0 ? displayResults.value.length - 1 : activeIndex.value - 1;
  } else if (direction === "down") {
    activeIndex.value =
      activeIndex.value >= displayResults.value.length - 1 ? 0 : activeIndex.value + 1;
  }
}

// 跳转到
function navigateToRoute(item: SearchItem) {
  closeSearchModal();
  if (isExternal(item.path)) {
    window.open(item.path, "_blank");
  } else {
    router.push(item.path);
  }
}

function loadRoutes(routes: RouteRecordRaw[], parentPath = "") {
  routes.forEach((route) => {
    const path = route.path.startsWith("/") ? route.path : `${parentPath}/${route.path}`;
    if (excludedRoutes.value.includes(route.path) || isExternal(route.path)) return;

    if (route.children) {
      loadRoutes(route.children, path);
    } else if (route.meta?.title) {
      const title = route.meta.title === "dashboard" ? "首页" : route.meta.title;
      menuItems.value.push({
        title,
        path,
        name: typeof route.name === "string" ? route.name : undefined,
        icon: route.meta.icon,
        redirect: typeof route.redirect === "string" ? route.redirect : undefined,
      });
    }
  });
}
</script>

<style scoped lang="scss">
.search-result {
  max-height: 400px;
  overflow-y: auto;

  ul {
    padding: 0;
    margin: 0;
    list-style: none;
  }

  &__item {
    display: flex;
    align-items: center;
    padding: 10px;
    text-align: left;
    cursor: pointer;

    &--active {
      color: var(--el-color-primary);
      background-color: var(--el-menu-hover-bg-color);
    }
  }
}

.dialog-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.shortcuts-group {
  display: flex;
  gap: 15px;
  align-items: center;
}

.key-box {
  display: flex;
  gap: 5px;
  align-items: center;
}

.arrow-box {
  display: flex;
  gap: 5px;
  align-items: center;
}

.arrow-up-down {
  display: flex;
  gap: 2px;
  align-items: center;
}

.key-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 20px;
  padding: 0 4px;
  font-size: 12px;
  color: #606266;
  background-color: white;
  border: 1px solid #cdcde6;
  border-radius: 3px;
  box-shadow:
    inset 0 -2px 0 0 #cdcde6,
    inset 0 0 1px 1px #fff,
    0 1px 2px rgba(30, 35, 90, 0.2);

  &::before {
    position: absolute;
    top: 1px;
    right: 1px;
    left: 1px;
    height: 50%;
    pointer-events: none;
    content: "";
    background: linear-gradient(to bottom, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0));
    border-radius: 2px 2px 0 0;
  }
}

.esc-btn {
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
  font-size: 11px;
}

.key-text {
  font-size: 12px;
  color: #909399;
}

.ctrl-k-hint {
  display: flex;
  align-items: center;
}

.ctrl-k-text {
  font-size: 12px;
  color: #909399;
}

// 适配Element Plus对话框
:deep(.el-dialog__footer) {
  box-sizing: border-box;
  padding-top: 10px;
  text-align: right;
}
</style>
