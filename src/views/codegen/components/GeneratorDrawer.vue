<template>
  <el-drawer
    v-model="visible"
    class="gen-drawer"
    :title="title"
    size="90%"
    destroy-on-close
    @close="handleClose"
  >
    <!-- 步骤导航 -->
    <el-steps class="drawer-steps" :active="currentStep" align-center finish-status="success">
      <el-step v-for="step in STEPS" :key="step.step">
        <template #icon>
          <el-icon :size="20"><component :is="step.icon" /></el-icon>
        </template>
        <template #title>{{ step.title }}</template>
        <template #description>{{ step.description }}</template>
      </el-step>
    </el-steps>

    <!-- AI 入口与结果合成一条：空闲时是入口，填充后是改动摘要与撤销；前端开关关闭时整体隐藏 -->
    <div
      v-if="currentStep !== STEP.PREVIEW && appConfig.aiEnabled"
      class="ai-bar"
      :class="{ 'is-filled': !!aiDiff }"
    >
      <span class="ai-bar-icon i-svg:ai" />
      <div class="ai-bar-text">
        <div class="ai-bar-title">
          AI 智能推断
          <span v-if="aiDiff" class="ai-bar-state">已填充，可撤销</span>
        </div>
        <div v-if="aiDiff" class="ai-bar-desc">
          已推断
          <b>{{ aiDiff.fieldCount }}</b>
          个字段、
          <b>{{ aiDiff.changeCount }}</b>
          处改动
          <span v-if="aiDiff.businessName" class="ai-bar-extra">
            业务名 {{ aiDiff.businessName.from }} → {{ aiDiff.businessName.to }}
          </span>
        </div>
        <div v-else class="ai-bar-desc">
          {{
            currentStep === STEP.BASIC_CONFIG
              ? "根据表结构自动补全业务名、字段描述和表单/查询类型"
              : "根据字段定义自动补全字段描述、表单与查询组件"
          }}，结果可查看、可撤销
        </div>
      </div>
      <div class="ai-bar-actions">
        <el-button v-if="aiDiff" size="small" text type="primary" @click="aiDiffVisible = true">
          查看改动
        </el-button>
        <el-button v-if="aiDiff" size="small" text @click="undoAiFill">撤销</el-button>
        <el-button size="small" type="primary" :loading="aiLoading" @click="handleAiFill">
          <template #icon><span class="i-svg:ai" /></template>
          {{ aiDiff ? "重新推断" : "开始推断" }}
        </el-button>
      </div>
    </div>

    <!-- 步骤内容 -->
    <div class="drawer-content mt-5">
      <BasicConfigStep
        v-show="currentStep === STEP.BASIC_CONFIG"
        ref="basicConfigRef"
        v-model="genConfigFormData"
        :menu-options="menuOptions"
      />

      <FieldConfigStep
        v-show="currentStep === STEP.FIELD_CONFIG"
        ref="fieldConfigRef"
        v-model="genConfigFormData"
        :loading="loading"
        :loading-text="loadingText"
        :dict-options="dictOptions"
        :ai-changes="fieldChanges"
      />

      <PreviewStep
        v-show="currentStep === STEP.PREVIEW"
        ref="previewRef"
        :gen-config-form-data="genConfigFormData"
        :preview-scope="previewScope"
        :preview-types="previewTypes"
        :preview-type-options="previewTypeOptions"
        :filtered-tree-data="filteredTreeData"
        :code="code"
        :current-file-key="currentFileKey"
        :table-name="currentTableName"
        @update:preview-scope="previewScope = $event"
        @update:preview-types="previewTypes = $event"
        @file-click="handleFileTreeNodeClick"
        @copy="handleCopyCode"
      />
    </div>

    <!-- 底部操作栏 -->
    <template #footer>
      <div class="drawer-footer">
        <div class="flex gap-3">
          <el-button v-if="currentStep > STEP.BASIC_CONFIG" @click="handlePrev">
            <el-icon><Back /></el-icon>
            {{ STEPS[currentStep].prevText }}
          </el-button>
        </div>
        <div class="flex gap-3">
          <el-button @click="handleClose">取消</el-button>
          <el-button type="primary" :loading="loading" @click="handleNext">
            {{ STEPS[currentStep].nextText }}
            <el-icon v-if="currentStep < STEP.PREVIEW"><Right /></el-icon>
            <el-icon v-else><Download /></el-icon>
          </el-button>
          <el-button
            v-if="currentStep === STEP.PREVIEW"
            type="primary"
            plain
            :disabled="!canWriteToLocal"
            @click="openWriteDialog()"
          >
            <template #icon><FolderOpened /></template>
            写入本地
          </el-button>
        </div>
      </div>
    </template>

    <!-- 写入本地对话框 -->
    <WriteLocalDialog
      v-model="writeDialogVisible"
      :can-write-to-local="canWriteToLocal"
      :supports-f-s-access="supportsFSAccess"
      :frontend-dir-path="frontendDirPath"
      :backend-dir-path="backendDirPath"
      :write-scope="writeScope"
      :overwrite-mode="overwriteMode"
      :write-progress="writeProgress"
      :write-running="writeRunning"
      @update:write-scope="writeScope = $event"
      @update:overwrite-mode="overwriteMode = $event"
      @pick-frontend-dir="pickFrontendDir"
      @pick-backend-dir="pickBackendDir"
      @confirm-write="confirmWrite"
    />

    <!-- AI 改动明细 -->
    <el-dialog v-model="aiDiffVisible" title="AI 改动明细" width="720px" append-to-body>
      <div class="ai-diff-summary">
        <span>共 {{ aiDiff?.fieldCount ?? 0 }} 个字段、{{ aiDiff?.changeCount ?? 0 }} 处改动</span>
        <span v-if="aiDiff?.businessName">
          业务名：{{ aiDiff.businessName.from }} → {{ aiDiff.businessName.to }}
        </span>
        <span class="ai-diff-hint">点击行选中字段，可定位到字段配置</span>
      </div>
      <el-table
        :data="changeRows"
        size="small"
        max-height="420"
        :span-method="diffSpanMethod"
        highlight-current-row
        class="ai-diff-table"
        @row-click="handleDiffRowClick"
      >
        <el-table-column label="字段" width="200">
          <template #default="{ row }">
            <span class="ai-diff-field">{{ row.columnName }}</span>
            <el-tag v-if="row.first" size="small" type="info" effect="plain">
              {{ row.fieldChangeCount }} 处
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="label" label="改动项" width="110" />
        <el-table-column label="变化">
          <template #default="{ row }">
            <span class="ai-diff-from">{{ row.from }}</span>
            <el-icon class="ai-diff-arrow"><Right /></el-icon>
            <span class="ai-diff-to">{{ row.to }}</span>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <el-button @click="aiDiffVisible = false">关闭</el-button>
        <el-button @click="undoFromDiff">撤销 AI 填充</el-button>
        <el-button type="primary" :disabled="!diffTargetColumn" @click="locateFromDiff">
          定位到字段
        </el-button>
      </template>
    </el-dialog>
  </el-drawer>
</template>

<script setup lang="ts">
import GeneratorAPI from "@/api/codegen";
import { appConfig } from "@/settings";
import { useGenConfig } from "../composables/useGenConfig";
import { useCodePreview } from "../composables/useCodePreview";
import { useLocalWrite } from "../composables/useLocalWrite";
import { useAiFillDiff, type AiChangeRow } from "../composables/useAiFillDiff";

const STEP = { BASIC_CONFIG: 0, FIELD_CONFIG: 1, PREVIEW: 2 } as const;
const STEPS = [
  {
    step: 0,
    title: "基础配置",
    description: "配置表信息和生成选项",
    icon: "Setting",
    prevText: "",
    nextText: "下一步，字段配置",
  },
  {
    step: 1,
    title: "字段配置",
    description: "配置字段显示和表单类型",
    icon: "Grid",
    prevText: "上一步，基础配置",
    nextText: "下一步，确认生成",
  },
  {
    step: 2,
    title: "预览生成",
    description: "预览代码并下载",
    icon: "View",
    prevText: "上一步，字段配置",
    nextText: "下载代码",
  },
];

const visible = defineModel<boolean>("visible", { required: true });

/**
 * 代码生成抽屉：承载三步向导
 */
defineProps<{ title: string }>();
/**
 * 生成成功或重置配置时上抛
 */
defineEmits<{ success: [] }>();

const currentStep = ref<number>(STEP.BASIC_CONFIG);
const currentTableName = ref("");
const loading = ref(false);
const aiLoading = ref(false);
const loadingText = ref("loading...");

const basicConfigRef = ref();
const fieldConfigRef = ref();
const previewRef = ref();

const {
  genConfigFormData,
  menuOptions,
  dictOptions,
  loadConfig,
  saveConfig,
  validateBasic,
  applyDefaults,
} = useGenConfig();

const {
  aiDiff,
  fieldChanges,
  changeRows,
  clear: clearAiDiff,
  snapshotConfig,
  resolveDiff,
  undo,
} = useAiFillDiff();

// AI 改动明细弹窗
const aiDiffVisible = ref(false);
// 明细中选中的字段，定位到字段配置时用
const diffTargetColumn = ref("");

// 每次打开清掉上次的选择，避免定位到上一轮残留的字段
watch(aiDiffVisible, (visible) => {
  if (visible) diffTargetColumn.value = "";
});

/**
 * 点击改动明细定位到对应字段
 */
function handleDiffRowClick(row: AiChangeRow) {
  diffTargetColumn.value = row.columnName;
}

const {
  filteredTreeData,
  previewScope,
  previewTypes,
  previewTypeOptions,
  code,
  currentFileKey,
  handlePreview,
  handleFileTreeNodeClick,
  handleCopyCode,
} = useCodePreview(genConfigFormData);

const {
  supportsFSAccess,
  writeDialog,
  frontendDirPath,
  backendDirPath,
  writeScope,
  overwriteMode,
  writeProgress,
  writeRunning,
  canWriteToLocal,
  openWriteDialog,
  setPreviewFiles,
  pickFrontendDir,
  pickBackendDir,
  confirmWrite,
} = useLocalWrite(genConfigFormData);

const writeDialogVisible = computed({
  get: () => writeDialog.visible,
  set: (val) => {
    writeDialog.visible = val;
  },
});

watch(currentStep, (val) => {
  if (val === STEP.FIELD_CONFIG) {
    nextTick(() => fieldConfigRef.value?.initSort());
  }
  if (val === STEP.PREVIEW) {
    nextTick(() => previewRef.value?.refreshEditor());
  }
});

/**
 * 打开生成向导并加载表配置
 */
async function open(tableName: string) {
  currentTableName.value = tableName;
  currentStep.value = STEP.BASIC_CONFIG;
  clearAiDiff();
  aiDiffVisible.value = false;
  loading.value = true;
  try {
    const config = await loadConfig(tableName);
    if (config.id) {
      currentStep.value = STEP.PREVIEW;
      await doPreview(tableName);
    }
  } catch {
    ElMessage.error("获取生成配置失败");
    visible.value = false;
  } finally {
    loading.value = false;
  }
}

/**
 * 回到上一步
 */
async function handlePrev() {
  if (currentStep.value === STEP.PREVIEW) {
    // 从预览回退要重新加载，不然下次进来数据会有问题
    genConfigFormData.value = { fieldConfigs: [] };
    loading.value = true;
    try {
      genConfigFormData.value = applyDefaults(
        await GeneratorAPI.getGenConfig(currentTableName.value)
      );
    } finally {
      loading.value = false;
    }
  }
  if (currentStep.value > STEP.BASIC_CONFIG) {
    currentStep.value--;
  }
}

/**
 * AI 推断字段描述、表单/查询类型并回填，回填后跳到字段配置核对差异
 */
async function handleAiFill() {
  aiLoading.value = true;
  loadingText.value = "AI 推断中，请稍候...";
  try {
    snapshotConfig(genConfigFormData.value);
    const filled = await GeneratorAPI.aiFillConfig(currentTableName.value);
    // 接口按表结构重建配置，页面类型等非字段项可能为空，沿用当前选择再补默认
    filled.pageType = filled.pageType || genConfigFormData.value.pageType || "classic";
    const diff = resolveDiff(filled);
    genConfigFormData.value = applyDefaults(filled);
    if (diff.changeCount === 0) {
      ElMessage.warning("AI 未推断出可应用的改动");
      return;
    }
    gotoFieldChanges();
  } catch {
    // 业务异常已由请求拦截器统一提示后端 message（含 AI 未开启的具体原因），此处不再重复
  } finally {
    aiLoading.value = false;
    loadingText.value = "loading...";
  }
}

/**
 * 跳到字段配置，并只显示 AI 改动过的字段
 */
function gotoFieldChanges() {
  currentStep.value = STEP.FIELD_CONFIG;
  nextTick(() => fieldConfigRef.value?.showOnlyAiChanged());
}

/**
 * 同一字段的多条改动合并字段列，避免字段名反复出现
 */
function diffSpanMethod({ rowIndex, columnIndex }: { rowIndex: number; columnIndex: number }) {
  if (columnIndex !== 0) return;
  const rows = changeRows.value;
  const columnName = rows[rowIndex]?.columnName;
  if (rowIndex > 0 && rows[rowIndex - 1]?.columnName === columnName) {
    return { rowspan: 0, colspan: 0 };
  }
  let rowspan = 1;
  while (rowIndex + rowspan < rows.length && rows[rowIndex + rowspan].columnName === columnName) {
    rowspan++;
  }
  return { rowspan, colspan: 1 };
}

/**
 * 从明细弹窗定位到选中字段：切到字段配置并滚动高亮该字段
 */
function locateFromDiff() {
  const columnName = diffTargetColumn.value;
  if (!columnName) return;
  aiDiffVisible.value = false;
  gotoFieldChanges();
  nextTick(() => fieldConfigRef.value?.locateField(columnName));
}

/**
 * 恢复到 AI 填充前的配置
 */
function undoAiFill() {
  const config = undo();
  if (!config) return;
  genConfigFormData.value = config;
  ElMessage.info("已撤销 AI 填充");
}

/**
 * 从明细弹窗撤销
 */
function undoFromDiff() {
  aiDiffVisible.value = false;
  undoAiFill();
}

/**
 * 进入下一步
 */
async function handleNext() {
  if (currentStep.value === STEP.BASIC_CONFIG) {
    if (!validateBasic()) return;
    currentStep.value = STEP.FIELD_CONFIG;
    return;
  }

  if (currentStep.value === STEP.FIELD_CONFIG) {
    loading.value = true;
    loadingText.value = "代码生成中，请稍候...";
    try {
      await saveConfig(currentTableName.value);
      await doPreview(currentTableName.value);
      currentStep.value = STEP.PREVIEW;
    } catch {
      ElMessage.error("代码生成失败");
    } finally {
      loading.value = false;
      loadingText.value = "loading...";
    }
    return;
  }

  if (currentStep.value === STEP.PREVIEW) {
    const pageType = genConfigFormData.value.pageType || "classic";
    GeneratorAPI.download(currentTableName.value, pageType as "classic" | "crud", "ts");
  }
}

/**
 * 生成预览文件
 */
async function doPreview(tableName: string) {
  const files = await handlePreview(tableName);
  // 把文件列表传给写入本地模块，这样点写入时能拿到数据
  setPreviewFiles(files);
}

/**
 * 关闭生成向导
 */
function handleClose() {
  visible.value = false;
  fieldConfigRef.value?.destroySort();
}

/**
 * 暴露 open 供列表页打开抽屉
 */
defineExpose({ open });
</script>

<style scoped lang="scss">
.gen-drawer {
  // body 默认 20px 上内边距落在滚动容器内，吸顶的 AI 条上方会露出滚动内容，把它挪到步骤条上
  :deep(.el-drawer__body) {
    padding-top: 0;
  }
}

.drawer-steps {
  padding-top: 20px;
}

.drawer-content {
  min-height: 400px;
}
.drawer-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.ai-bar {
  position: sticky;
  top: 0;
  z-index: 3;
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 12px 16px;
  margin-top: 16px;
  background: linear-gradient(
    135deg,
    var(--el-color-primary-light-9),
    var(--el-color-primary-light-8)
  );
  border-radius: 10px;

  // 填充后加深描边，标记为结果条
  &.is-filled {
    border: 1px solid var(--el-color-primary-light-7);
  }

  .ai-bar-icon {
    flex: none;
    font-size: 28px;
    color: var(--el-color-primary);
  }

  .ai-bar-text {
    flex: 1;
    min-width: 0;
  }

  .ai-bar-title {
    display: flex;
    gap: 8px;
    align-items: center;
    font-size: 14px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  .ai-bar-state {
    font-size: 12px;
    font-weight: 400;
    color: var(--el-text-color-secondary);
  }

  .ai-bar-desc {
    margin-top: 2px;
    font-size: 13px;
    color: var(--el-text-color-secondary);

    b {
      font-weight: 600;
      color: var(--el-color-primary);
    }
  }

  .ai-bar-extra {
    margin-left: 8px;
  }

  .ai-bar-actions {
    display: flex;
    flex: none;
    gap: 8px;
    align-items: center;
  }
}
.ai-diff-summary {
  display: flex;
  gap: 16px;
  align-items: center;
  margin-bottom: 12px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}
.ai-diff-hint {
  margin-left: auto;
  color: var(--el-text-color-placeholder);
}
.ai-diff-table {
  :deep(.el-table__row) {
    cursor: pointer;
  }
}
.ai-diff-field {
  margin-right: 6px;
  font-weight: 600;
}
.ai-diff-from {
  padding: 1px 6px;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color);
  border-radius: 4px;
}
.ai-diff-arrow {
  margin: 0 6px;
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}
.ai-diff-to {
  padding: 1px 6px;
  font-weight: 600;
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  border-radius: 4px;
}
</style>
