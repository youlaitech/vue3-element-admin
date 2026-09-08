<template>
  <FormRenderer
    :title="renderData?.formName ?? '表单填写'"
    :version="renderData?.version"
    :rule="rule"
    :option="option"
    :loading="loading"
    :submitted="submitted"
    @submit="handleSubmit"
  >
    <template #success>
      <el-result icon="success" title="提交成功" sub-title="感谢您的填写，信息已成功提交">
        <template #extra>
          <el-button type="primary" @click="refill">继续填写</el-button>
          <el-button v-if="canViewData" @click="handleViewData">查看已提交数据</el-button>
        </template>
      </el-result>
    </template>
  </FormRenderer>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus";

import FormAPI from "@/api/form";
import type { FormRenderData } from "@/api/form";
import { hasPerm } from "@/utils/auth";
import FormRenderer from "./components/FormRenderer.vue";
import { useFormRenderer } from "./composables/useFormRenderer";

defineOptions({
  name: "FormRender",
  inheritAttrs: false,
});

const route = useRoute();
const router = useRouter();

/** 表单唯一标识（优先菜单路由 meta.params，query 兜底） */
const formKey = computed(() => {
  const metaParams = route.meta.params as Record<string, unknown> | undefined;
  return String(metaParams?.formKey ?? route.query.formKey ?? "");
});

const renderData = ref<FormRenderData>();
const submitting = ref(false);

const { rule, option, loading, submitted, load, refill } = useFormRenderer(() =>
  FormAPI.getRender(formKey.value)
);

onMounted(async () => {
  if (!formKey.value) {
    ElMessage.error("缺少表单标识参数，请检查菜单路由参数配置");
    return;
  }
  renderData.value = await load();
});

/**
 * 提交表单数据（校验通过后触发）
 * @param data 表单数据（field -> value 映射）
 */
async function handleSubmit(data: Record<string, unknown>): Promise<void> {
  if (submitting.value) return;
  submitting.value = true;
  try {
    await FormAPI.submitFormData(formKey.value, data);
    ElMessage.success("提交成功");
    submitted.value = true;
  } finally {
    submitting.value = false;
  }
}

/** 是否有权查看收集数据（无权限时不显示"查看已提交数据"按钮） */
const canViewData = computed(() => hasPerm(["form:data:list"]));

// 跳转数据列表（按提交时间倒序，本次提交在首位）
function handleViewData(): void {
  router.push({
    name: "FormData",
    query: { formKey: formKey.value, title: renderData.value?.formName ?? "表单数据" },
  });
}
</script>
