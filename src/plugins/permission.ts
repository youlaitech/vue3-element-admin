import type { RouteRecordRaw } from "vue-router";
import NProgress from "@/utils/nprogress";
import router from "@/router";
import { usePermissionStore, useUserStore } from "@/store";
import { ROLE_ROOT } from "@/constants";

export function setupPermission() {
  const whiteList = ["/login"]; // 无需登录的页面

  router.beforeEach(async (to, from, next) => {
    NProgress.start();

    try {
      // 使用 store 暴露的登录态，便于后续扩展（如基于过期时间等）
      const isLoggedIn = useUserStore().isLoggedIn();

      // 未登录处理
      if (!isLoggedIn) {
        if (whiteList.includes(to.path)) {
          next();
        } else {
          next(`/login?redirect=${encodeURIComponent(to.fullPath)}`);
          NProgress.done();
        }
        return;
      }

      // 已登录且访问登录页，重定向到首页
      if (to.path === "/login") {
        next({ path: "/" });
        return;
      }

      // 已登录用户的正常访问
      const permissionStore = usePermissionStore();
      const userStore = useUserStore();

      // 路由未生成则生成
      if (!permissionStore.isDynamicRoutesGenerated) {
        if (!userStore.userInfo?.roles?.length) {
          await userStore.getUserInfo();
        }

        const dynamicRoutes = await permissionStore.generateRoutes();
        dynamicRoutes.forEach((route: RouteRecordRaw) => {
          router.addRoute(route);
        });

        next({ ...to, replace: true });
        return;
      }

      // 检查路由是否存在
      if (to.matched.length === 0) {
        next("/404");
        return;
      }

      // 设置页面标题
      const title = (to.params.title as string) || (to.query.title as string);
      if (title) {
        to.meta.title = title;
      }

      next();
    } catch (error) {
      console.error("❌ Route guard error:", error);
      // 出错时清理状态并重定向到登录页
      try {
        await useUserStore().resetAllState();
      } catch (resetError) {
        console.error("❌ Failed to reset user state:", resetError);
      }
      next("/login");
      NProgress.done();
    }
  });

  router.afterEach(() => {
    NProgress.done();
  });
}

/** 判断是否有权限 */
export function hasAuth(value: string | string[], type: "button" | "role" = "button") {
  const { roles, perms } = useUserStore().userInfo;

  // 超级管理员 拥有所有权限
  if (type === "button" && roles.includes(ROLE_ROOT)) {
    return true;
  }

  const auths = type === "button" ? perms : roles;
  return typeof value === "string"
    ? auths.includes(value)
    : value.some((perm) => auths.includes(perm));
}
