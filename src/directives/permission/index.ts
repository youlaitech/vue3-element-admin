import type { Directive, DirectiveBinding } from "vue";

import { hasPerm as hasPermFn } from "@/utils/permission";

/**
 * 按钮权限与函数调用共用同一判断。
 */
export const hasPerm: Directive = {
  /**
   * 挂载时校验按钮权限，无权限则移除元素
   */
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const requiredPerms = binding.value;

    if (!requiredPerms || (typeof requiredPerms !== "string" && !Array.isArray(requiredPerms))) {
      throw new Error(
        "需要提供权限标识！例如：v-has-perm=\"'sys:user:create'\" 或 v-has-perm=\"['sys:user:create', 'sys:user:update']\"",
      );
    }

    if (!hasPermFn(requiredPerms) && el.parentNode) {
      el.parentNode.removeChild(el);
    }
  },
};
