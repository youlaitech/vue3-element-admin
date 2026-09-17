<template>
  <div class="designer-container">
    <div class="designer-toolbar">
      <div class="designer-toolbar__left">
        <el-button circle @click="handleBack">
          <el-icon><ArrowLeft /></el-icon>
        </el-button>
        <span class="designer-toolbar__title">{{ title }}</span>
      </div>
      <div class="designer-toolbar__right">
        <el-button @click="aiDialogVisible = true">
          <template #icon><MagicStick /></template>
          AI 生成
        </el-button>
        <el-button @click="handlePreview">预 览</el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">保 存</el-button>
      </div>
    </div>

    <div class="designer-wrapper">
      <FcDesigner ref="designerRef" :config="designerConfig" height="100%" />
    </div>

    <el-dialog v-model="aiDialogVisible" title="AI 生成表单" width="560px" append-to-body>
      <el-input
        v-model="aiDescription"
        type="textarea"
        :rows="5"
        maxlength="1000"
        show-word-limit
        placeholder="描述需要的表单，例如：请假申请，包含姓名、请假类型、起止日期、请假事由（必填）、附件"
      />
      <template #footer>
        <el-button @click="aiDialogVisible = false">取 消</el-button>
        <el-button type="primary" :loading="aiGenerating" @click="handleAiGenerate">
          生 成
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus";
import { ArrowLeft, MagicStick } from "@element-plus/icons-vue";

import FcDesigner from "@form-create/designer";

import FormAPI from "@/api/form";
import router from "@/router";

defineOptions({
  name: "FormDesigner",
  inheritAttrs: false,
});

const route = useRoute();

/** 表单 ID（列表页"设计"按钮携带） */
const formId = computed(() => String(route.query.id ?? ""));

/** 页面标题（列表页携带） */
const title = computed(() => String(route.query.title ?? "表单设计"));

const designerRef = ref();

/** 隐藏设计器自带保存按钮，统一走工具栏 */
const designerConfig = { showSaveBtn: false };

/** 保存中状态 */
const saving = ref(false);

/** AI 生成弹窗与需求描述 */
const aiDialogVisible = ref(false);
const aiDescription = ref("");
const aiGenerating = ref(false);

/** 表单定义元数据（保存时回传以满足后端非空校验） */
const formMeta = ref<{ formKey?: string; formName?: string }>({});

// 回显已有规则（空规则为空白画布）
onMounted(async () => {
  if (!formId.value) {
    ElMessage.error("缺少表单ID参数");
    return;
  }
  const data = await FormAPI.getFormData(formId.value);
  formMeta.value = { formKey: data.formKey, formName: data.formName };
  if (data.formJson) {
    designerRef.value?.setRule(JSON.parse(data.formJson));
  }
  if (data.optionsJson || data.formName) {
    const option = data.optionsJson ? JSON.parse(data.optionsJson) : {};
    // 画布「表单名称」面板回显读 option.formName，而 getOption 保存产出的是面板字段原名
    // formCreateFormName，键名不对称需转换；画布未填时用表单定义名称预填
    option.formName = option.formName || option.formCreateFormName || data.formName || "";
    delete option.formCreateFormName;
    designerRef.value?.setOption(option);
  }
});

// 保存设计器产出的规则与全局配置
async function handleSave(): Promise<void> {
  if (!formId.value) {
    ElMessage.error("缺少表单ID参数");
    return;
  }
  const formJson = JSON.stringify(designerRef.value?.getRule() ?? []);
  const optionsJson = JSON.stringify(designerRef.value?.getOption() ?? {});
  saving.value = true;
  try {
    await FormAPI.update(formId.value, { ...formMeta.value, formJson, optionsJson });
    ElMessage.success("保存成功");
  } finally {
    saving.value = false;
  }
}

// AI 生成的规则直接覆盖画布，用户确认后再点保存
async function handleAiGenerate(): Promise<void> {
  const description = aiDescription.value.trim();
  if (!description) {
    ElMessage.warning("请输入需求描述");
    return;
  }
  aiGenerating.value = true;
  try {
    const formJson = await FormAPI.aiGenerate(description);
    designerRef.value?.setRule(JSON.parse(formJson));
    aiDialogVisible.value = false;
    ElMessage.success("生成完成，请核对后保存");
  } catch {
    ElMessage.error("AI 生成失败，请确认已开启 AI 配置或调整描述");
  } finally {
    aiGenerating.value = false;
  }
}

// 返回表单列表
function handleBack(): void {
  router.back();
}

// 预览读取已保存规则，未保存改动不体现
function handlePreview(): void {
  if (!formId.value) {
    ElMessage.error("缺少表单ID参数");
    return;
  }
  router.push({
    name: "FormPreview",
    query: { id: formId.value, title: title.value },
  });
}
</script>

<style lang="scss" scoped>
.designer-container {
  display: flex;
  flex-direction: column;
  // 视口高度减去导航栏、标签栏及容器内边距
  height: calc(100vh - 120px);
  overflow: hidden;
  background-color: var(--el-bg-color);
}

.designer-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  border-bottom: 1px solid var(--el-border-color-light);

  &__left {
    display: flex;
    gap: 12px;
    align-items: center;
  }

  &__title {
    font-size: 16px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }
}

.designer-wrapper {
  flex: 1;
  overflow: hidden;
}
</style>
