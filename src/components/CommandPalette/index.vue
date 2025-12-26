<template>
  <div>
    <el-button type="text" icon="Search" aria-label="打开搜索面板" @click="open" />

    <el-dialog v-model="visible" width="640px" :close-on-click-modal="true" @close="close">
      <template #title>
        <div class="flex items-center gap-2">
          <el-icon><Search /></el-icon>
          <span>搜索菜单</span>
        </div>
      </template>

      <div>
        <el-input
          ref="inputRef"
          v-model="keyword"
          placeholder="输入菜单名称或关键字搜索"
          @input="onSearch"
          @keydown.enter.prevent="onSelect"
        />

        <div class="mt-3">
          <div
            v-if="results.length === 0 && history.length === 0"
            class="text-center text-gray-500"
          >
            没有搜索历史
          </div>

          <ul v-else class="space-y-2">
            <li
              v-for="(item, idx) in results.length ? results : history"
              :key="item.path + idx"
              class="p-2 hover:bg-gray-100 cursor-pointer rounded"
              @click="onGo(item)"
            >
              <div>{{ item.title }}</div>
              <div class="text-sm text-gray-400">{{ item.path }}</div>
            </li>
          </ul>
        </div>
      </div>

      <template #footer>
        <div style="text-align: right">
          <el-button @click="close">关闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { Search } from "@element-plus/icons-vue";
import { useCommandPalette } from "./useCommandPalette";

const { visible, keyword, results, history, inputRef, open, close, onSearch, onSelect, onGo } =
  useCommandPalette();

onMounted(() => {
  // no-op for now
});
</script>

<style scoped></style>
