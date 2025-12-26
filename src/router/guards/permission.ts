import type { RouteRecordRaw } from "vue-router";
import NProgress from "@/plugins/nprogress";
import router from "@/router";
import { usePermissionStore, useUserStore } from "@/store";
import { useTenantStoreHook } from "@/store/modules/tenant";
import { appConfig } from "@/settings";

/**
 * 路由权限守卫
 *
 * 处理登录验证、动态路由生成、404检测等
 */
export function setupPermissionGuard() {
  const whiteList = ["/login"];

  router.beforeEach(async (to, _from, next) => {
    NProgress.start();

    try {
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

      // 已登录访问登录页，重定向到首页
      if (to.path === "/login") {
        next({ path: "/" });
        return;
      }

      const permissionStore = usePermissionStore();
      const userStore = useUserStore();

      // 动态路由生成
      if (!permissionStore.isRouteGenerated) {
        if (!userStore.userInfo?.roles?.length) {
          await userStore.getUserInfo();
        }

        // 加载用户租户列表（VITE_APP_TENANT_ENABLED=true 时生效）
        await initTenantContext();

        const dynamicRoutes = await permissionStore.generateRoutes();
        dynamicRoutes.forEach((route: RouteRecordRaw) => {
          router.addRoute(route);
        });

        next({ ...to, replace: true });
        return;
      }

      // 路由 404 检查
      if (to.matched.length === 0) {
        next("/404");
        return;
      }

      // 动态标题
      const title = (to.params.title as string) || (to.query.title as string);
      if (title) {
        to.meta.title = title;
      }

      next();
    } catch (error) {
      console.error("Route guard error:", error);
      await useUserStore().resetAllState();
      next("/login");
      NProgress.done();
    }
  });

  router.afterEach(() => {
    NProgress.done();
  });
}

// ============================================
// 多租户支持（可选）
// ============================================

/** 初始化多租户上下文，未启用或失败时静默跳过 */
async function initTenantContext(): Promise<void> {
  if (!appConfig.tenantEnabled) return;

  try {
    await useTenantStoreHook().loadTenant();
  } catch {
    // 静默失败，不影响主流程
  }
}
