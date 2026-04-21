<template>
  <el-dialog v-model="modelValue" title="写入本地项目" width="640px" class="write-local-dialog">
    <div class="dialog-body">
      <!-- 浏览器不支持提示 -->
      <el-alert
        v-if="!supportsFSAccess"
        title="当前浏览器不支持本地文件写入"
        description="请使用 Chrome 或 Edge 最新版本，或点击「下载 ZIP」替代"
        type="warning"
        show-icon
        :closable="false"
        class="mb-4"
      />

      <!-- 目录选择 -->
      <div class="dir-section">
        <div class="section-title">
          <el-icon><Folder /></el-icon>
          <span>选择项目目录</span>
        </div>

        <div class="dir-item">
          <div class="dir-label">
            <el-tag size="small" type="success" effect="light">前端</el-tag>
          </div>
          <el-input
            :model-value="frontendDirPath"
            placeholder="点击右侧按钮选择前端项目根目录"
            readonly
            class="dir-input"
          >
            <template #prefix>
              <el-icon><FolderOpened /></el-icon>
            </template>
          </el-input>
          <el-button :disabled="!supportsFSAccess" @click="emit('pickFrontendDir')">
            <el-icon><FolderAdd /></el-icon>
            选择
          </el-button>
        </div>

        <div class="dir-item">
          <div class="dir-label">
            <el-tag size="small" type="warning" effect="light">后端</el-tag>
          </div>
          <el-input
            :model-value="backendDirPath"
            placeholder="点击右侧按钮选择后端项目根目录"
            readonly
            class="dir-input"
          >
            <template #prefix>
              <el-icon><FolderOpened /></el-icon>
            </template>
          </el-input>
          <el-button :disabled="!supportsFSAccess" @click="emit('pickBackendDir')">
            <el-icon><FolderAdd /></el-icon>
            选择
          </el-button>
        </div>
      </div>

      <!-- 写入选项 -->
      <div class="option-section">
        <div class="section-title">
          <el-icon><SetUp /></el-icon>
          <span>写入选项</span>
        </div>

        <div class="option-row">
          <span class="option-label">写入范围</span>
          <el-radio-group
            :model-value="writeScope"
            size="small"
            @update:model-value="emit('update:writeScope', $event as any)"
          >
            <el-radio-button value="all">
              <el-icon><Grid /></el-icon>
              全部
            </el-radio-button>
            <el-radio-button value="frontend">
              <el-icon><Monitor /></el-icon>
              仅前端
            </el-radio-button>
            <el-radio-button value="backend">
              <el-icon><Cpu /></el-icon>
              仅后端
            </el-radio-button>
          </el-radio-group>
        </div>

        <div class="option-row">
          <span class="option-label">覆盖策略</span>
          <el-radio-group
            :model-value="overwriteMode"
            size="small"
            @update:model-value="emit('update:overwriteMode', $event as any)"
          >
            <el-radio-button value="overwrite">直接覆盖</el-radio-button>
            <el-radio-button value="skip">跳过已存在</el-radio-button>
            <el-radio-button value="ifChanged">有变更才覆盖</el-radio-button>
          </el-radio-group>
        </div>
      </div>

      <!-- 进度条 -->
      <div v-if="writeProgress.total > 0" class="progress-section">
        <div class="progress-header">
          <span class="progress-title">写入进度</span>
          <span class="progress-count">{{ writeProgress.done }} / {{ writeProgress.total }}</span>
        </div>
        <el-progress
          :percentage="writeProgress.percent"
          :stroke-width="8"
          :status="writeProgress.percent === 100 ? 'success' : ''"
          striped
          striped-flow
        />
        <div class="progress-file">{{ writeProgress.current }}</div>
      </div>
    </div>

    <template #footer>
      <el-button @click="modelValue = false">取消</el-button>
      <el-button type="primary" :disabled="writeRunning || !dirReady" @click="emit('confirmWrite')">
        <el-icon><Download /></el-icon>
        开始写入
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
const modelValue = defineModel<boolean>({ required: true });

const props = defineProps<{
  supportsFSAccess: boolean;
  frontendDirPath: string;
  backendDirPath: string;
  writeScope: "all" | "frontend" | "backend";
  overwriteMode: "overwrite" | "skip" | "ifChanged";
  writeProgress: { total: number; done: number; percent: number; current: string };
  writeRunning: boolean;
  canWriteToLocal: boolean;
}>();

const emit = defineEmits<{
  "update:writeScope": [val: "all" | "frontend" | "backend"];
  "update:overwriteMode": [val: "overwrite" | "skip" | "ifChanged"];
  pickFrontendDir: [];
  pickBackendDir: [];
  confirmWrite: [];
}>();

// 根据写入范围检查目录是否都选好了
const dirReady = computed(() => {
  if (props.writeScope === "all") {
    return !!props.frontendDirPath && !!props.backendDirPath;
  }
  if (props.writeScope === "frontend") {
    return !!props.frontendDirPath;
  }
  return !!props.backendDirPath;
});
</script>

<style scoped lang="scss">
.write-local-dialog {
  :deep(.el-dialog__body) {
    padding: 8px 24px 16px;
  }

  .dialog-body {
    .section-title {
      display: flex;
      gap: 8px;
      align-items: center;
      padding-bottom: 8px;
      margin-bottom: 12px;
      font-size: 14px;
      font-weight: 600;
      color: var(--el-text-color-primary);
      border-bottom: 1px solid var(--el-border-color-lighter);

      .el-icon {
        font-size: 16px;
        color: var(--el-color-primary);
      }
    }

    .dir-section {
      margin-bottom: 20px;

      .dir-item {
        display: flex;
        gap: 10px;
        align-items: center;
        margin-bottom: 10px;

        .dir-label {
          flex-shrink: 0;
          width: 50px;
        }

        .dir-input {
          flex: 1;
        }

        :deep(.el-button) {
          display: inline-flex;
          gap: 4px;
          align-items: center;
        }
      }
    }

    .option-section {
      margin-bottom: 16px;

      .option-row {
        display: flex;
        gap: 16px;
        align-items: center;
        margin-bottom: 12px;

        .option-label {
          flex-shrink: 0;
          width: 60px;
          font-size: 13px;
          color: var(--el-text-color-regular);
        }

        :deep(.el-radio-button__inner) {
          display: inline-flex;
          gap: 4px;
          align-items: center;
        }
      }
    }

    .progress-section {
      padding: 12px 16px;
      background: var(--el-fill-color-light);
      border-radius: 8px;

      .progress-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 8px;

        .progress-title {
          font-size: 13px;
          font-weight: 500;
          color: var(--el-text-color-primary);
        }

        .progress-count {
          font-size: 12px;
          color: var(--el-text-color-secondary);
        }
      }

      .progress-file {
        margin-top: 6px;
        overflow: hidden;
        text-overflow: ellipsis;
        font-family: "JetBrains Mono", monospace;
        font-size: 12px;
        color: var(--el-text-color-secondary);
        white-space: nowrap;
      }
    }
  }
}
</style>
