<template>
  <el-alert v-if="loadError" :title="loadError" type="error" :closable="false" />
  <form-create v-else v-model="formData" v-model:api="formApi" :rule="rule" :option="option" />
</template>

<script setup lang="ts">
import type { Options, Rule } from "@form-create/element-ui";

defineOptions({
  name: "FormDetail",
  inheritAttrs: false,
});

/**
 * 按提交时的快照只读回显表单，不使用设计器当前规则。
 * 同一组件切换快照时，重新解析规则、选项和数据。
 */
const props = defineProps<{
  /** 表单规则（form-create rule 数组 JSON 字符串） */
  formJson?: string;
  /** 表单全局配置 JSON 字符串 */
  optionsJson?: string;
  /** 表单数据（field -> value 映射的 JSON 字符串） */
  dataJson?: string;
}>();

const formApi = ref();
const loadError = ref("");
const formData = ref<Record<string, unknown>>({});
// shallowRef：避免深代理破坏 Rule 内部的 Creator 结构
const rule = shallowRef<Rule[]>([]);
const option = ref<Options>({ submitBtn: false, resetBtn: false });

watch(
  () => [props.formJson, props.optionsJson, props.dataJson],
  () => {
    // 每次先恢复默认选项，防止空快照沿用上一份配置。
    rule.value = [];
    option.value = { submitBtn: false, resetBtn: false };
    loadError.value = "";
    try {
      const rules: unknown = props.formJson ? JSON.parse(props.formJson) : [];
      const options: unknown = props.optionsJson ? JSON.parse(props.optionsJson) : {};
      if (
        !Array.isArray(rules) ||
        !options ||
        typeof options !== "object" ||
        Array.isArray(options)
      ) {
        throw new Error("Invalid form snapshot");
      }
      rule.value = disableRules(rules);
      option.value = { ...options, submitBtn: false, resetBtn: false };
    } catch {
      loadError.value = "表单快照格式有误，无法显示";
    }
    formData.value = parseDataJson(props.dataJson);
  },
  { immediate: true }
);

/**
 * 克隆快照后递归禁用控件，并移除只读态不需要的校验。
 * 不修改传入规则，避免影响其他使用同一快照的视图。
 */
function disableRules(rules: unknown[]): Rule[] {
  /**
   * 递归禁用快照中的字段并移除校验规则。
   */
  const walk = (nodes: unknown[]): void => {
    nodes.forEach((node) => {
      if (!node || typeof node !== "object") return;
      const item = node as Record<string, unknown>;
      item.props = { ...(item.props as object), disabled: true };
      delete item.validate;
      if (Array.isArray(item.children)) {
        walk(item.children);
      }
    });
  };
  const cloned = structuredClone(rules);
  walk(cloned);
  return cloned as Rule[];
}

/**
 * 数据必须是字段映射对象，非法 JSON、null 或数组均按空数据处理。
 */
function parseDataJson(dataJson?: string): Record<string, unknown> {
  try {
    const value: unknown = dataJson ? JSON.parse(dataJson) : undefined;
    return value !== null && typeof value === "object" && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
}
</script>
