<template>
  <el-drawer v-model="visible" :title="title" size="90%" destroy-on-close @close="handleClose">
    <!-- 步骤导航 -->
    <el-steps :active="currentStep" align-center finish-status="success">
      <el-step v-for="step in STEPS" :key="step.step">
        <template #icon>
          <el-icon :size="20"><component :is="step.icon" /></el-icon>
        </template>
        <template #title>{{ step.title }}</template>
        <template #description>{{ step.description }}</template>
      </el-step>
    </el-steps>

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
        <div>
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
      @pick-frontend-dir="pickFrontendDir"
      @pick-backend-dir="pickBackendDir"
      @confirm-write="confirmWrite"
    />
  </el-drawer>
</template>

<script setup lang="ts">
import GeneratorAPI from "@/api/codegen";
import { useGenConfig } from "../composables/useGenConfig";
import { useCodePreview } from "../composables/useCodePreview";
import { useLocalWrite } from "../composables/useLocalWrite";

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

defineProps<{ title: string }>();
defineEmits<{ success: [] }>();

const currentStep = ref<number>(STEP.BASIC_CONFIG);
const currentTableName = ref("");
const loading = ref(false);
const loadingText = ref("loading...");

const basicConfigRef = ref();
const fieldConfigRef = ref();
const previewRef = ref();

const { genConfigFormData, menuOptions, dictOptions, loadConfig, saveConfig, validateBasic } =
  useGenConfig();

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

async function open(tableName: string) {
  currentTableName.value = tableName;
  currentStep.value = STEP.BASIC_CONFIG;
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

async function handlePrev() {
  if (currentStep.value === STEP.PREVIEW) {
    // 从预览回退要重新加载，不然下次进来数据会有问题
    genConfigFormData.value = { fieldConfigs: [] };
    loading.value = true;
    try {
      genConfigFormData.value = await GeneratorAPI.getGenConfig(currentTableName.value);
    } finally {
      loading.value = false;
    }
  }
  if (currentStep.value > STEP.BASIC_CONFIG) {
    currentStep.value--;
  }
}

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
    GeneratorAPI.download(currentTableName.value, pageType as "classic" | "curd", "ts");
  }
}

async function doPreview(tableName: string) {
  const files = await handlePreview(tableName);
  // 把文件列表传给写入本地模块，这样点写入时能拿到数据
  setPreviewFiles(files);
}

function handleClose() {
  visible.value = false;
  fieldConfigRef.value?.destroySort();
}

defineExpose({ open });
</script>

<style scoped lang="scss">
.drawer-content {
  min-height: 400px;
}
.drawer-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
