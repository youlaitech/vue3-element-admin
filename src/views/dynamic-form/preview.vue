<template>
  <FormRenderer
    :title="title"
    :rule="rule"
    :option="option"
    :loading="loading"
    :submitted="submitted"
    @submit="handlePreviewSubmit"
  >
    <template #header-extra>
      <el-button type="primary" size="small" @click="handleBack">返回设计器</el-button>
    </template>

    <template #success>
      <el-result icon="success" title="预览提交成功" sub-title="预览模式下数据不会保存">
        <template #extra>
          <el-button @click="refill">继续填写</el-button>
          <el-button type="primary" @click="handleBack">返回设计器</el-button>
        </template>
      </el-result>
    </template>
  </FormRenderer>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus";

import FormAPI from "@/api/form";
import router from "@/router";
import FormRenderer from "./components/FormRenderer.vue";
import { useFormRenderer } from "./composables/useFormRenderer";

defineOptions({
  name: "FormPreview",
  inheritAttrs: false,
});

const route = useRoute();

/** 表单 ID（设计器"预览"按钮携带） */
const formId = computed(() => String(route.query.id ?? ""));

/** 页面标题（设计器携带） */
const title = computed(() => String(route.query.title ?? "表单预览"));

// 走表单定义接口拉草稿规则：render 接口仅返回已发布表单，预览恰恰要覆盖未发布态
const { rule, option, loading, submitted, load, refill } = useFormRenderer(() =>
  FormAPI.getFormData(formId.value)
);

onMounted(async () => {
  if (!formId.value) {
    ElMessage.error("缺少表单ID参数");
    return;
  }
  await load();
});

// 预览不落库，校验通过即进入成功态
function handlePreviewSubmit(): void {
  submitted.value = true;
}

// 返回设计器
function handleBack(): void {
  router.back();
}
</script>
