import { hasAuth } from "@/plugins/permission";
import { Directive, DirectiveBinding } from "vue";

/**
 * 按钮权限
 */
export const hasPerm: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    // DOM绑定需要的按钮权限标识
    const { value: requiredPerms } = binding;
    if (requiredPerms) {
      if (!hasAuth(requiredPerms)) {
        el.parentNode && el.parentNode.removeChild(el);
      }
    } else {
      throw new Error(
        "need perms! Like v-has-perm=\"['sys:user:add','sys:user:edit']\""
      );
    }
  },
};

/**
 * 角色权限
 */
export const hasRole: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    // DOM绑定需要的角色编码
    const { value: requiredRoles } = binding;
    if (requiredRoles) {
      if (!hasAuth(requiredRoles, "role")) {
        el.parentNode && el.parentNode.removeChild(el);
      }
    } else {
      throw new Error("need roles! Like v-has-role=\"['admin','test']\"");
    }
  },
};
