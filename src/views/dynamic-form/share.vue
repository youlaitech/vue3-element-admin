<template>
  <!-- 公开表单 H5 承载页：匿名访问，不套管理端 Layout -->
  <div class="share-page">
    <!-- 加载失败态：链接失效/未开放公开访问/表单不存在 -->
    <el-card v-if="loadError" class="share-page__card" shadow="never">
      <el-result icon="warning" title="表单暂不可用" :sub-title="loadError">
        <template #extra>
          <div class="share-page__hint">请联系表单发布者确认链接是否有效</div>
        </template>
      </el-result>
    </el-card>

    <FormRenderer
      v-else
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
          </template>
        </el-result>
      </template>
    </FormRenderer>
  </div>
</template>

<script setup lang="ts">
import FormAPI from "@/api/form";
import type { FormRenderData } from "@/api/form";
import FormRenderer from "./components/FormRenderer.vue";
import { useFormRenderer } from "./composables/useFormRenderer";

defineOptions({
  name: "FormShare",
  inheritAttrs: false,
});

const route = useRoute();

/** 表单唯一标识（路由路径段 /f/:formKey） */
const formKey = computed(() => String(route.params.formKey ?? ""));

const renderData = ref<FormRenderData>();
const submitting = ref(false);

/** 加载失败兜底文案（错误消息由拦截器统一弹出） */
const loadError = ref("");

const { rule, option, loading, submitted, load, refill } = useFormRenderer(() =>
  FormAPI.getPublicRender(formKey.value)
);

onMounted(async () => {
  if (!formKey.value) {
    loadError.value = "缺少表单标识参数";
    return;
  }
  try {
    renderData.value = await load();
  } catch {
    loadError.value = "表单不存在或未开放公开访问";
  }
});

/**
 * 匿名提交表单数据（校验通过后触发）
 * @param data 表单数据（field -> value 映射）
 */
async function handleSubmit(data: Record<string, unknown>): Promise<void> {
  if (submitting.value) return;
  submitting.value = true;
  try {
    await FormAPI.submitPublicFormData(formKey.value, data);
    submitted.value = true;
  } catch {
    // 失败不重复提示（拦截器已弹），停留填写态可重试
  } finally {
    submitting.value = false;
  }
}
</script>

<style lang="scss" scoped>
.share-page {
  min-height: 100vh;
  padding: 12px 0;
  background-color: var(--el-fill-color-light);
}

.share-page__card {
  width: 100%;
  max-width: 640px;
  margin: 0 auto;
}

.share-page__hint {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

// 移动端优先：渲染卡片宽度收敛，与桌面端预览宽度区分开
:deep(.form-renderer__card) {
  max-width: 640px;
}
</style>
