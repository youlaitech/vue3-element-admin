<template>
  <div class="form-renderer">
    <el-card v-loading="loading" class="form-renderer__card" shadow="never">
      <template #header>
        <div class="form-renderer__header">
          <span class="form-renderer__title">{{ title }}</span>
          <div class="form-renderer__extra">
            <el-tag v-if="version" type="info" effect="plain">v{{ version }}</el-tag>
            <slot name="header-extra" />
          </div>
        </div>
      </template>

      <!-- 提交成功态：由承载页通过 success 插槽定制后续动作（继续填写/返回设计器等），替代表单区避免重复编辑 -->
      <slot v-if="submitted" name="success" />

      <form-create
        v-else
        v-model="formData"
        v-model:api="formApi"
        :rule="rule"
        :option="option"
        @submit="handleSubmit"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import type { Options, Rule } from "@form-create/element-ui";

defineOptions({
  name: "FormRenderer",
  inheritAttrs: false,
});

/** 表单渲染组件（填写/公开/预览三页共用；规则加载与提交由承载页实现） */
const props = defineProps<{
  /** 表单标题（卡片头展示） */
  title: string;
  /** 表单版本号（不传则不展示版本标签，如草稿态预览） */
  version?: number;
  /** form-create 渲染规则 */
  rule: Rule[];
  /** form-create 全局配置 */
  option: Options;
  /** 规则加载中 */
  loading?: boolean;
  /** 已提交成功（true 时以 success 插槽替代表单区） */
  submitted?: boolean;
}>();

const emit = defineEmits<{
  /** 表单校验通过后的提交（是否落库由承载页决定） */
  submit: [data: Record<string, unknown>];
}>();

const formApi = ref();
const formData = ref<Record<string, unknown>>({});

// 返回填写态时清掉残留提交值（重新挂载会重新应用规则默认值）
watch(
  () => props.submitted,
  (submitted) => {
    if (!submitted) {
      formData.value = {};
    }
  }
);

// 抛出表单数据（浅拷贝，防异步提交期间被继续编辑污染）
function handleSubmit(): void {
  emit("submit", { ...formData.value });
}
</script>

<style lang="scss" scoped>
.form-renderer {
  display: flex;
  justify-content: center;
  padding: 16px;

  &__card {
    align-self: flex-start;
    width: 100%;
    max-width: 900px;
  }

  &__header {
    display: flex;
    gap: 8px;
    align-items: center;
    justify-content: space-between;
  }

  &__title {
    font-size: 16px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  &__extra {
    display: flex;
    gap: 8px;
    align-items: center;
  }
}
</style>
