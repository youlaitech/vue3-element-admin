<template>
  <div class="preview-step">
    <!-- 工具栏 -->
    <div class="preview-toolbar">
      <div class="toolbar-left">
        <div class="filter-group">
          <span class="filter-label">
            <el-icon><View /></el-icon>
            预览范围
          </span>
          <el-radio-group
            :model-value="previewScope"
            size="small"
            @update:model-value="onScopeChange"
          >
            <el-radio-button value="all">
              <el-icon><Grid /></el-icon>
              全部
            </el-radio-button>
            <el-radio-button value="frontend">
              <el-icon><Monitor /></el-icon>
              前端
            </el-radio-button>
            <el-radio-button value="backend">
              <el-icon><Cpu /></el-icon>
              后端
            </el-radio-button>
          </el-radio-group>
        </div>
        <el-divider direction="vertical" />
        <div class="filter-group">
          <span class="filter-label">
            <el-icon><Files /></el-icon>
            文件类型
          </span>
          <el-checkbox-group
            :model-value="previewTypes"
            size="small"
            @update:model-value="onTypesChange"
          >
            <el-checkbox-button v-for="t in previewTypeOptions" :key="t" :value="t">
              {{ t }}
            </el-checkbox-button>
          </el-checkbox-group>
        </div>
      </div>
      <div class="toolbar-right">
        <el-button size="small" type="primary" plain @click="emit('copy')">
          <template #icon><CopyDocument /></template>
          复制代码
        </el-button>
        <el-button size="small" type="success" plain @click="handleDownload">
          <template #icon><Download /></template>
          下载 ZIP
        </el-button>
      </div>
    </div>

    <!-- 主区域 -->
    <div class="preview-container">
      <!-- 文件树 -->
      <div class="file-tree-panel" :style="{ width: fileTreeWidth + 'px' }">
        <div class="panel-header">
          <div class="header-left">
            <el-icon class="header-icon"><FolderOpened /></el-icon>
            <span class="header-title">文件列表</span>
            <el-tag size="small" type="info" effect="plain">{{ fileCount }} 个文件</el-tag>
          </div>
        </div>
        <el-scrollbar class="panel-body">
          <el-tree
            ref="fileTreeRef"
            :data="filteredTreeData"
            node-key="key"
            default-expand-all
            highlight-current
            :current-node-key="currentFileKey"
            @node-click="(data: any) => emit('file-click', data)"
          >
            <template #default="{ data }">
              <div class="tree-node" :class="{ 'is-active': data.key === currentFileKey }">
                <el-icon class="file-icon" :class="`icon-${getFileIcon(data)}`">
                  <Document />
                </el-icon>
                <span class="node-label">{{ data.label }}</span>
                <el-tag
                  v-if="data.scope"
                  size="small"
                  :type="data.scope === 'frontend' ? 'success' : 'warning'"
                  effect="plain"
                  class="scope-tag"
                >
                  {{ data.scope === "frontend" ? "前端" : "后端" }}
                </el-tag>
              </div>
            </template>
          </el-tree>
        </el-scrollbar>
        <div class="resize-handle" @mousedown="startResize">
          <div class="resize-line" />
        </div>
      </div>

      <!-- 代码预览 -->
      <div class="code-preview-panel">
        <div class="panel-header">
          <div class="header-left">
            <el-icon class="header-icon"><Document /></el-icon>
            <span class="file-path">{{ currentFilePath || "请选择文件预览" }}</span>
          </div>
          <div class="header-right">
            <el-tag
              v-if="currentLanguage"
              size="small"
              type="primary"
              effect="dark"
              class="lang-tag"
            >
              {{ currentLanguage }}
            </el-tag>
          </div>
        </div>
        <el-scrollbar class="panel-body">
          <div v-if="!code" class="empty-code">
            <el-icon class="empty-icon"><DocumentCopy /></el-icon>
            <div class="empty-text">点击左侧文件预览代码</div>
          </div>
          <Codemirror
            v-else
            ref="cmRef"
            :value="code"
            :options="cmOptions"
            border
            :readonly="true"
            height="100%"
            width="100%"
          />
        </el-scrollbar>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import "codemirror/mode/javascript/javascript.js";
import Codemirror from "codemirror-editor-vue3";
import type { CmComponentRef } from "codemirror-editor-vue3";
import type { EditorConfiguration } from "codemirror";
import GeneratorAPI from "@/api/codegen";
import type { GenConfigForm } from "@/api/codegen";
import { getFileIcon } from "../utils/tree-builder";

const props = defineProps<{
  genConfigFormData: GenConfigForm;
  previewScope: "all" | "frontend" | "backend";
  previewTypes: string[];
  previewTypeOptions: string[];
  filteredTreeData: any[];
  code: string;
  currentFileKey: string;
  tableName: string;
}>();

const emit = defineEmits<{
  (e: "update:previewScope", val: "all" | "frontend" | "backend"): void;
  (e: "update:previewTypes", val: string[]): void;
  (e: "file-click", data: any): void;
  (e: "copy"): void;
}>();

const cmRef = ref<CmComponentRef>();
const cmOptions: EditorConfiguration = { mode: "text/javascript" };
const fileTreeRef = ref();
const fileTreeWidth = ref(280);

const currentFilePath = computed(() => {
  const key = props.currentFileKey;
  if (!key) return "";
  const idx = key.indexOf(":");
  return idx > -1 ? key.slice(idx + 1) : key;
});

function onScopeChange(val: any) {
  emit("update:previewScope", val as "all" | "frontend" | "backend");
}

function onTypesChange(val: any) {
  emit("update:previewTypes", val as string[]);
}

const currentLanguage = computed(() => {
  if (!props.currentFileKey) return "";
  const parts = currentFilePath.value.split(".");
  return parts.length > 1 ? parts.pop() : "";
});

const fileCount = computed(() => {
  let count = 0;
  function walk(nodes: any[]) {
    nodes.forEach((n) => {
      if (!n.children || !n.children.length) count++;
      else walk(n.children);
    });
  }
  walk(props.filteredTreeData);
  return count;
});

function handleDownload() {
  const pageType = props.genConfigFormData.pageType || "classic";
  GeneratorAPI.download(props.tableName, pageType as "classic" | "curd", "ts");
}

function refreshEditor() {
  const inst = cmRef.value as any;
  inst?.cminstance?.refresh?.();
  inst?.cm?.refresh?.();
  inst?.editor?.refresh?.();
}

function startResize(e: MouseEvent) {
  const startX = e.clientX;
  const startWidth = fileTreeWidth.value;
  const onMove = (ev: MouseEvent) => {
    fileTreeWidth.value = Math.max(200, Math.min(500, startWidth + ev.clientX - startX));
  };
  const onUp = () => {
    document.removeEventListener("mousemove", onMove);
    document.removeEventListener("mouseup", onUp);
  };
  document.addEventListener("mousemove", onMove);
  document.addEventListener("mouseup", onUp);
}

defineExpose({ refreshEditor, fileTreeRef });

onBeforeUnmount(() => {
  cmRef.value?.destroy();
});
</script>

<style scoped lang="scss">
.preview-step {
  display: flex;
  flex-direction: column;
  height: 100%;

  .preview-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    margin-bottom: 12px;
    background: var(--el-bg-color);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 12px;

    .toolbar-left {
      display: flex;
      gap: 12px;
      align-items: center;

      .filter-group {
        display: flex;
        gap: 8px;
        align-items: center;

        .filter-label {
          display: inline-flex;
          gap: 4px;
          align-items: center;
          font-size: 13px;
          font-weight: 500;
          color: var(--el-text-color-secondary);
        }
      }
    }

    .toolbar-right {
      display: flex;
      gap: 8px;
      align-items: center;
    }
  }

  .preview-container {
    display: flex;
    flex: 1;
    gap: 12px;
    min-height: 0;

    .file-tree-panel,
    .code-preview-panel {
      display: flex;
      flex-direction: column;
      overflow: hidden;
      background: var(--el-bg-color);
      border: 1px solid var(--el-border-color-lighter);
      border-radius: 12px;
      transition: box-shadow 0.3s ease;

      &:hover {
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
      }

      .panel-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 16px;
        background: var(--el-fill-color-light);
        border-bottom: 1px solid var(--el-border-color-lighter);

        .header-left,
        .header-right {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .header-icon {
          font-size: 16px;
          color: var(--el-color-primary);
        }

        .header-title {
          font-size: 14px;
          font-weight: 600;
          color: var(--el-text-color-primary);
        }

        .file-path {
          font-family: "JetBrains Mono", "Fira Code", Consolas, Monaco, monospace;
          font-size: 13px;
          color: var(--el-text-color-regular);
        }

        .lang-tag {
          font-family: "JetBrains Mono", monospace;
          font-size: 11px;
          text-transform: uppercase;
        }
      }

      .panel-body {
        flex: 1;
        min-height: 0;
      }
    }

    .file-tree-panel {
      position: relative;
      min-width: 200px;
      max-width: 500px;

      :deep(.el-tree) {
        padding: 4px;

        .el-tree-node__content {
          height: 32px;
          padding: 0 8px;
          margin: 1px 0;
          border-radius: 6px;
          transition: all 0.2s ease;

          &:hover {
            background: var(--el-fill-color-light);
          }
        }

        .el-tree-node.is-current > .el-tree-node__content {
          font-weight: 500;
          color: var(--el-color-primary);
          background: var(--el-color-primary-light-9);
        }

        // 文件夹图标颜色
        .el-tree-node__expand-icon {
          color: var(--el-color-warning);
        }
      }

      .tree-node {
        display: flex;
        flex: 1;
        gap: 6px;
        align-items: center;

        .file-icon {
          font-size: 15px;
          transition: transform 0.2s ease;

          &.icon-java {
            color: #b07219;
          }
          &.icon-vue {
            color: #42b883;
          }
          &.icon-typescript {
            color: #3178c6;
          }
          &.icon-xml {
            color: #f60;
          }
          &.icon-html {
            color: #e34c26;
          }
          &.icon-javascript {
            color: #f7df1e;
          }
          &.icon-scss {
            color: #c6538c;
          }
          &.icon-sql {
            color: #336791;
          }
          &.icon-folder {
            color: var(--el-color-warning);
          }
        }

        .node-label {
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          font-size: 13px;
          white-space: nowrap;
        }

        .scope-tag {
          height: 20px;
          padding: 0 6px;
          margin-left: auto;
          font-size: 11px;
        }

        &:hover .file-icon {
          transform: scale(1.15);
        }

        // 当前选中的行标签样式调整
        &.is-active .scope-tag {
          color: #fff;
          background: var(--el-color-primary);
          border-color: var(--el-color-primary);
        }
      }

      .resize-handle {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        z-index: 10;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 12px;
        cursor: col-resize;

        .resize-line {
          width: 2px;
          height: 40px;
          background: var(--el-border-color);
          border-radius: 1px;
          transition: background 0.2s ease;
        }

        &:hover .resize-line {
          background: var(--el-color-primary);
        }
      }
    }

    .code-preview-panel {
      flex: 1;
      min-width: 0;

      .empty-code {
        display: flex;
        flex-direction: column;
        gap: 12px;
        align-items: center;
        justify-content: center;
        height: 100%;
        color: var(--el-text-color-secondary);

        .empty-icon {
          font-size: 48px;
          opacity: 0.3;
        }

        .empty-text {
          font-size: 14px;
        }
      }
    }
  }
}
</style>
