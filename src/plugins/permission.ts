import type { RouteRecordRaw } from "vue-router";
import NProgress from "@/utils/nprogress";
import router from "@/router";
import { usePermissionStore, useUserStore } from "@/store";
import { useTenantStoreHook } from "@/store/modules/tenant-store";

/**
 * 多租户功能是否启用
 * 通过环境变量控制，实现零侵入的可插拔设计
 */
const TENANT_ENABLED = import.meta.env.VITE_APP_TENANT_ENABLED === "true";

/**
 * 初始化多租户上下文（插件式设计）
 * - 仅在启用多租户时执行
 * - 失败不影响主流程（优雅降级）
 * - 完全解耦，可随时移除
 */
async function initTenantContextIfEnabled(): Promise<void> {
  if (!TENANT_ENABLED) {
    console.debug("[Tenant] 多租户功能未启用，跳过初始化");
    return;
  }

  try {
    console.debug("[Tenant] 开始加载租户...");
    const tenantStore = useTenantStoreHook();
    await tenantStore.loadTenant();
    console.debug("[Tenant] 租户加载成功");
  } catch (error) {
    // 优雅降级：后端未启用多租户或接口不存在时，不影响正常流程
    console.debug("[Tenant] 租户上下文初始化失败（可能后端未启用多租户）:", error);
  }
}

export function setupPermission() {
  const whiteList = ["/login"];

  router.beforeEach(async (to, from, next) => {
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

      // 已登录登录页重定向
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

        // 【多租户插件】初始化租户上下文（零侵入设计）
        // - 通过 VITE_APP_TENANT_ENABLED 环境变量控制
        // - 失败不影响主流程，优雅降级
        // - 可通过设置环境变量为 false 完全移除此功能
        await initTenantContextIfEnabled();

        const dynamicRoutes = await permissionStore.generateRoutes();
        dynamicRoutes.forEach((route: RouteRecordRaw) => {
          router.addRoute(route);
        });

        next({ ...to, replace: true });
        return;
      }

      // 路由404检查
      if (to.matched.length === 0) {
        next("/404");
        return;
      }

      // 动态标题设置
      const title = (to.params.title as string) || (to.query.title as string);
      if (title) {
        to.meta.title = title;
      }

      next();
    } catch (error) {
      // 错误处理：重置状态并跳转登录
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
