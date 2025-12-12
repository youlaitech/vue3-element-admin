/**
 * 表单验证规则工具
 *
 * @description
 * 提供常用的表单验证规则
 */

import type { FormItemRule } from "element-plus";

/**
 * 验证规则生成器
 */
export const VALIDATORS = {
  /**
   * 必填项验证
   */
  required(message: string): FormItemRule {
    return {
      required: true,
      message,
      trigger: "blur",
    };
  },

  /**
   * 邮箱验证
   */
  email: {
    type: "email",
    message: "请输入正确的邮箱地址",
    trigger: "blur",
  } as FormItemRule,

  /**
   * 手机号验证
   */
  mobile: {
    pattern: /^1[3-9]\d{9}$/,
    message: "请输入正确的手机号码",
    trigger: "blur",
  } as FormItemRule,

  /**
   * URL 验证
   */
  url: {
    type: "url",
    message: "请输入正确的URL地址",
    trigger: "blur",
  } as FormItemRule,

  /**
   * 数字验证
   */
  number: {
    type: "number",
    message: "请输入数字",
    trigger: "blur",
  } as FormItemRule,

  /**
   * 整数验证
   */
  integer: {
    type: "integer",
    message: "请输入整数",
    trigger: "blur",
  } as FormItemRule,
};
