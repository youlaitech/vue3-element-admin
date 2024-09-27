import {
  NavigationGuardNext,
  RouteLocationNormalized,
  RouteRecordRaw,
} from "vue-router";

import NProgress from "@/utils/nprogress";
import { isLogin } from "@/utils/auth";

import router from "@/router";
import { usePermissionStore, useUserStore } from "@/store";

export function setupPermission() {
  // 白名单路由
  const whiteList = ["/login"];

  router.beforeEach(async (to, from, next) => {
    NProgress.start();
    if (isLogin()) {
      if (to.path === "/login") {
        // 如果已登录，跳转到首页
        next({ path: "/" });
        NProgress.done();
      } else {
        const userStore = useUserStore();
        const hasRoles =
          userStore.user.roles && userStore.user.roles.length > 0;

        if (hasRoles) {
          // 如果未匹配到任何路由，跳转到404页面
          if (to.matched.length === 0) {
            next(from.name ? { name: from.name } : "/404");
          } else {
            // 如果路由参数中有 title，覆盖路由元信息中的 title
            const title =
              (to.params.title as string) || (to.query.title as string);
            if (title) {
              to.meta.title = title;
            }
            next();
          }
        } else {
          const permissionStore = usePermissionStore();
          try {
            await userStore.getUserInfo();
            const dynamicRoutes = await permissionStore.generateRoutes();
            dynamicRoutes.forEach((route: RouteRecordRaw) =>
              router.addRoute(route)
            );
            next({ ...to, replace: true });
          } catch (error) {
            // 移除 token 并重定向到登录页，携带当前页面路由作为跳转参数
            await userStore.resetToken();
            redirectToLogin(to, next);
            NProgress.done();
          }
        }
      }
    } else {
      // 未登录
      if (whiteList.includes(to.path)) {
        next(); // 在白名单，直接进入
      } else {
        // 不在白名单，重定向到登录页
        redirectToLogin(to, next);
        NProgress.done();
      }
    }
  });

  router.afterEach(() => {
    NProgress.done();
  });
}

/** 重定向到登录页 */
function redirectToLogin(
  to: RouteLocationNormalized,
  next: NavigationGuardNext
) {
  const params = new URLSearchParams(to.query as Record<string, string>);
  const queryString = params.toString();
  const redirect = queryString ? `${to.path}?${queryString}` : to.path;
  next(`/login?redirect=${encodeURIComponent(redirect)}`);
}

/** 判断是否有权限 */
export function hasAuth(
  value: string | string[],
  type: "button" | "role" = "button"
) {
  const { roles, perms } = useUserStore().user;

  // 超级管理员 拥有所有权限
  if (type === "button" && roles.includes("ROOT")) {
    return true;
  }

  const auths = type === "button" ? perms : roles;
  return typeof value === "string"
    ? auths.includes(value)
    : value.some((perm) => auths.includes(perm));
}
