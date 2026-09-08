<template>
  <form-create v-model="formData" v-model:api="formApi" :rule="rule" :option="option" />
</template>

<script setup lang="ts">
import type { Options, Rule } from "@form-create/element-ui";

defineOptions({
  name: "FormDetail",
  inheritAttrs: false,
});

/**
 * 表单只读回显
 *
 * @description 按提交时快照规则渲染表单并禁用全部控件，
 * 供审批办理、实例详情等场景回看发起数据
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
const formData = ref<Record<string, unknown>>({});
// shallowRef：避免深代理破坏 Rule 内部的 Creator 结构
const rule = shallowRef<Rule[]>([]);
const option = ref<Options>({ submitBtn: false, resetBtn: false });

watch(
  () => [props.formJson, props.optionsJson, props.dataJson],
  () => {
    rule.value = props.formJson ? disableRules(JSON.parse(props.formJson)) : [];
    if (props.optionsJson) {
      option.value = { ...JSON.parse(props.optionsJson), submitBtn: false, resetBtn: false };
    }
    formData.value = parseDataJson(props.dataJson);
  },
  { immediate: true }
);

/**
 * 递归禁用规则中的全部控件
 *
 * 同时移除校验规则，只读态不展示必填星号
 *
 * @param rules form-create 规则（JSON 解析值）
 */
function disableRules(rules: unknown): Rule[] {
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
  walk(Array.isArray(cloned) ? cloned : []);
  return cloned as Rule[];
}

/**
 * 解析表单数据（解析失败按空数据兜底）
 *
 * @param dataJson 数据 JSON 字符串
 */
function parseDataJson(dataJson?: string): Record<string, unknown> {
  try {
    return dataJson ? (JSON.parse(dataJson) as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}
</script>
