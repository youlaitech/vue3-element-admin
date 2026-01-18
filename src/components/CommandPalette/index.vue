<template>
  <div>
    <div
      class="command-palette-trigger"
      role="button"
      tabindex="0"
      aria-label="打开搜索面板"
      @click="open"
      @keydown.enter.prevent="open"
      @keydown.space.prevent="open"
    >
      <div class="command-palette-trigger__left">
        <div class="i-svg:search" />
        <span class="command-palette-trigger__text">搜索菜单</span>
      </div>
      <kbd class="command-palette-trigger__kbd">Ctrl K</kbd>
    </div>

    <el-dialog
      v-model="visible"
      width="720px"
      :close-on-click-modal="true"
      :show-close="false"
      @close="close"
    >
      <div class="command-palette-dialog">
        <el-input
          ref="inputRef"
          v-model="keyword"
          class="command-palette-input"
          placeholder="搜索菜单"
          @input="onSearch"
          @keydown="handleInputKeydown"
        >
          <template #prefix>
            <div class="i-svg:search" />
          </template>
          <template #suffix>
            <div class="command-palette-input__suffix">
              <div
                class="i-svg:close"
                role="button"
                tabindex="0"
                aria-label="关闭"
                @click="close"
              />
            </div>
          </template>
        </el-input>

        <div class="command-palette-results">
          <div v-if="displayList.length === 0" class="command-palette-empty">没有搜索历史</div>

          <ul v-else class="command-palette-list">
            <li
              v-for="(item, idx) in displayList"
              :key="item.path + idx"
              :class="['command-palette-item', { 'is-active': activeIndex === idx }]"
              @mouseenter="activeIndex = idx"
              @click="onGo(item)"
            >
              <div class="command-palette-item__title">{{ item.title }}</div>
              <div class="command-palette-item__path">{{ item.path }}</div>
            </li>
          </ul>
        </div>

        <div class="command-palette-hints">
          <div class="command-palette-hint">
            <div class="command-palette-hint__key"><div class="i-svg:up" /></div>
            <div class="command-palette-hint__key"><div class="i-svg:down" /></div>
            <span class="command-palette-hint__text">切换</span>
          </div>
          <div class="command-palette-hint">
            <div class="command-palette-hint__key"><div class="i-svg:enter" /></div>
            <span class="command-palette-hint__text">选择</span>
          </div>
          <div class="command-palette-hint">
            <div class="command-palette-hint__key"><div class="i-svg:esc" /></div>
            <span class="command-palette-hint__text">关闭</span>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useCommandPalette } from "./useCommandPalette";

const {
  visible,
  keyword,
  results,
  history,
  activeIndex,
  inputRef,
  open,
  close,
  onSearch,
  onSelect,
  onNavigate,
  onGo,
} = useCommandPalette();

const displayList = computed(() => (results.value.length ? results.value : history.value));

const handleInputKeydown: (evt: KeyboardEvent | Event) => any = (evt) => {
  if (!(evt instanceof KeyboardEvent)) return;
  const e = evt;
  const key = e.key.toLowerCase();

  if (key === "escape") {
    e.preventDefault();
    close();
    return;
  }

  if (key === "arrowup") {
    e.preventDefault();
    onNavigate("up");
    return;
  }

  if (key === "arrowdown") {
    e.preventDefault();
    onNavigate("down");
    return;
  }

  if (key === "enter") {
    e.preventDefault();
    if (displayList.value.length === 0) return;
    if (activeIndex.value < 0) activeIndex.value = 0;
    onSelect();
  }
};
</script>

<style scoped>
.command-palette-trigger {
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: space-between;
  height: 32px;
  padding: 0 12px;
  user-select: none;
  background: var(--el-fill-color-light);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 999px;
}

.command-palette-trigger__left {
  display: flex;
  gap: 8px;
  align-items: center;
}

.command-palette-trigger__left :deep([class^="i-svg:"]) {
  color: var(--el-text-color-secondary) !important;
}

.command-palette-trigger__text {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  white-space: nowrap;
}

.command-palette-trigger__kbd {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2px 8px;
  font-size: 12px;
  line-height: 1;
  color: var(--el-text-color-secondary);
  white-space: nowrap;
  background: var(--el-bg-color-overlay);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
}

.command-palette-trigger:focus-visible {
  outline: 2px solid var(--el-color-primary);
  outline-offset: 2px;
}

.command-palette-trigger:hover {
  border-color: var(--el-border-color);
}

.command-palette-dialog {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.command-palette-input :deep(.el-input__wrapper) {
  border-radius: 10px;
}

.command-palette-input__suffix {
  display: inline-flex;
  gap: 10px;
  align-items: center;
}

.command-palette-input__suffix :deep([class^="i-svg:"]) {
  font-size: 16px;
  color: var(--el-text-color-secondary);
}

.command-palette-input__suffix :deep([class^="i-svg:"]):hover {
  color: var(--el-color-primary);
}

.command-palette-results {
  max-height: 48vh;
  overflow: auto;
}

.command-palette-empty {
  padding: 24px 0;
  color: var(--el-text-color-secondary);
  text-align: center;
}

.command-palette-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 0;
  margin: 0;
  list-style: none;
}

.command-palette-item {
  padding: 10px 12px;
  cursor: pointer;
  border-radius: 10px;
}

.command-palette-item:hover {
  background: var(--el-fill-color-light);
}

.command-palette-item.is-active {
  background: var(--el-color-primary-light-9);
}

.command-palette-item__title {
  font-size: 14px;
  color: var(--el-text-color-primary);
}

.command-palette-item__path {
  margin-top: 2px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.command-palette-hints {
  display: flex;
  gap: 14px;
  align-items: center;
  padding-top: 10px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.command-palette-hint {
  display: inline-flex;
  gap: 6px;
  align-items: center;
}

.command-palette-hint__key {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 24px;
  padding: 0 8px;
  background: var(--el-bg-color-overlay);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
}

.command-palette-hint__key :deep([class^="i-svg:"]) {
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

.command-palette-hint__text {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
</style>
