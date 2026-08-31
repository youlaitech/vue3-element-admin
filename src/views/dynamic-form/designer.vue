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
        <el-button @click="handlePreview">预 览</el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">保 存</el-button>
      </div>
    </div>

    <div class="designer-wrapper">
      <FcDesigner ref="designerRef" :config="designerConfig" height="100%" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus";
import { ArrowLeft } from "@element-plus/icons-vue";

import FcDesigner from "@form-create/designer";

import FormAPI from "@/api/form";
import router from "@/router";

defineOptions({
  name: "FormDesigner",
  inheritAttrs: false,
});

const route = useRoute();

/** 表单 ID（设计器始终由列表页"设计"按钮带参进入） */
const formId = computed(() => String(route.query.id ?? ""));

/** 页面标题（列表页携带，如【入职信息采集】表单设计） */
const title = computed(() => String(route.query.title ?? "表单设计"));

const designerRef = ref();

/** 设计器配置：隐藏自带保存按钮，保存统一走工具栏 */
const designerConfig = { showSaveBtn: false };

/** 保存中状态 */
const saving = ref(false);

/** 回显已有规则（空规则为空白画布） */
onMounted(async () => {
  if (!formId.value) {
    ElMessage.error("缺少表单ID参数");
    return;
  }
  const data = await FormAPI.getFormData(formId.value);
  if (data.formJson) {
    designerRef.value?.setRule(JSON.parse(data.formJson));
  }
  if (data.optionsJson) {
    designerRef.value?.setOption(JSON.parse(data.optionsJson));
  }
});

/**
 * 保存设计器产出的规则与全局配置
 */
async function handleSave(): Promise<void> {
  if (!formId.value) {
    ElMessage.error("缺少表单ID参数");
    return;
  }
  const formJson = JSON.stringify(designerRef.value?.getRule() ?? []);
  const optionsJson = JSON.stringify(designerRef.value?.getOption() ?? {});
  saving.value = true;
  try {
    await FormAPI.update(formId.value, { formJson, optionsJson });
    ElMessage.success("保存成功");
  } finally {
    saving.value = false;
  }
}

/**
 * 返回表单管理列表
 */
function handleBack(): void {
  router.back();
}

/**
 * 运行态真预览：跳预览页用与填写承载页相同的渲染管线查看效果
 *
 * 预览读取的是已保存规则，未保存的改动不会体现，需先保存再预览
 */
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
