/**
 * 表单规则加载与渲染状态
 *
 * @description
 * 填写页（render.vue）、公开填写页（share.vue）、设计器预览页（preview.vue）共用，
 * 保证三处走同一条渲染管线：相同的规则解析、提交按钮策略与成功态切换
 */

import { ref, shallowRef } from "vue";
import type { Options, Rule } from "@form-create/element-ui";

/** 规则来源（表单定义接口与渲染接口返回的 JSON 字段） */
export interface FormRuleSource {
  /** 表单规则（form-create rule 数组 JSON 字符串） */
  formJson?: string;
  /** 表单全局配置 JSON 字符串 */
  optionsJson?: string;
}

/**
 * 加载表单规则并管理渲染状态
 *
 * @param loader 规则加载函数（各承载页的规则来源不同：草稿定义 / 已发布规则 / 公开规则）
 */
export function useFormRenderer<T extends FormRuleSource = FormRuleSource>(
  loader: () => Promise<T | null | undefined>
) {
  // shallowRef：规则与配置整体加载整体替换，无需深层响应式；
  // 深响应式代理会破坏 form-create Rule 内部 Creator 结构（模板 UnwrapRef 深映射导致类型失配）
  const rule = shallowRef<Rule[]>([]);
  const option = shallowRef<Options>({ submitBtn: true });
  const loading = ref(false);
  const submitted = ref(false);

  /**
   * 加载并解析规则，返回接口原始数据
   *
   * 强制开启提交按钮：填写页必须有提交入口，设计器保存时可能关掉了它
   */
  async function load(): Promise<T | undefined> {
    loading.value = true;
    try {
      const data = await loader();
      rule.value = data?.formJson ? JSON.parse(data.formJson) : [];
      const parsedOption: Options = data?.optionsJson ? JSON.parse(data.optionsJson) : {};
      option.value = { ...parsedOption, submitBtn: true };
      return data ?? undefined;
    } finally {
      loading.value = false;
    }
  }

  /** 回到填写态（已填数据清空由 FormRenderer 处理） */
  function refill(): void {
    submitted.value = false;
  }

  return { rule, option, loading, submitted, load, refill };
}
