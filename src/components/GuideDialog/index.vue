<template>
  <el-dialog v-model="visible" :title="title" width="800px" top="6vh">
    <div class="guide-dialog__content" v-html="renderMarkdown(content)"></div>
  </el-dialog>
</template>

<script setup lang="ts">
import { renderMarkdown } from "@/utils/markdown";

/**
 * 通用教程/说明对话框
 *
 * @description
 * 弹开大对话框展示 markdown 教程内容，供各功能模块复用。
 * 用法：`<GuideDialog v-model="visible" title="xxx" content="markdown 文本" />`
 */
defineProps<{
  /** 对话框标题 */
  title: string;
  /** markdown 教程内容 */
  content: string;
}>();

const visible = defineModel<boolean>({ required: true });
</script>

<style scoped lang="scss">
.guide-dialog__content {
  max-height: 70vh;
  padding: 4px 8px;
  overflow-y: auto;
  font-size: 14px;
  line-height: 1.8;
  color: var(--el-text-color-primary);

  h1,
  h2,
  h3,
  h4 {
    margin: 16px 0 8px;
    font-weight: 600;
    color: var(--el-text-color-primary);

    &:first-child {
      margin-top: 0;
    }
  }

  h1 {
    padding-bottom: 8px;
    font-size: 20px;
    border-bottom: 1px solid var(--el-border-color-lighter);
  }

  h2 {
    font-size: 17px;
  }

  h3 {
    font-size: 15px;
  }

  p {
    margin: 6px 0;
  }

  ul {
    padding-left: 20px;
    margin: 6px 0;
    list-style: disc;

    li {
      margin: 3px 0;
    }
  }

  blockquote {
    padding: 8px 12px;
    margin: 10px 0;
    color: var(--el-text-color-secondary);
    background: var(--el-fill-color-light);
    border-left: 4px solid var(--el-color-primary);
    border-radius: 4px;
  }

  code {
    padding: 2px 6px;
    font-family: "JetBrains Mono", Consolas, monospace;
    font-size: 13px;
    color: var(--el-color-primary);
    background: var(--el-fill-color-light);
    border-radius: 4px;
  }

  table {
    width: 100%;
    margin: 10px 0;
    font-size: 13px;
    border-collapse: collapse;

    td {
      padding: 8px 10px;
      border: 1px solid var(--el-border-color-lighter);
    }
  }

  hr {
    margin: 16px 0;
    border: none;
    border-top: 1px solid var(--el-border-color-lighter);
  }
}
</style>
