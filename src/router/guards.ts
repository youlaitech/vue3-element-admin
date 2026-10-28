import type { RouteRecordRaw } from "vue-router";
import NProgress from "@/plugins/nprogress";
import router from "@/router";
import { usePermissionStore, useUserStore } from "@/stores";
import { useTenantStoreHook } from "@/stores/tenant";
import { isTenantEnabled } from "@/utils/tenant";

/**
 * 路由守卫
 *
 * 处理登录验证、动态路由生成、404 检测、页面标题与进度条
 */
export function setupPermissionGuard() {
  // 白名单支持前缀匹配：/f 命中所有公开表单分享页 /f/:formKey
  // /data-screen 是不调用接口的演示大屏，新页签与直连地址都不依赖登录态
  const whiteList = ["/login", "/f", "/oidc/callback", "/data-screen"];

  router.beforeEach(async (to, _from) => {
    NProgress.start();

    try {
      const isLoggedIn = useUserStore().isLoggedIn();

      // 未登录处理
      if (!isLoggedIn) {
        const isWhiteListed = whiteList.some(
          (path) => to.path === path || to.path.startsWith(`${path}/`)
        );
        if (isWhiteListed) {
          return;
        }
        NProgress.done();
        return `/login?redirect=${encodeURIComponent(to.fullPath)}`;
      }

      // 已登录访问登录页，重定向到首页
      if (to.path === "/login") {
        return { path: "/" };
      }

      const permissionStore = usePermissionStore();
      const userStore = useUserStore();

      // 动态路由生成
      if (!permissionStore.isRouteGenerated) {
        if (!userStore.userInfo?.roles?.length) {
          await userStore.fetchUserInfo();
        }

        // 加载用户租户列表（VITE_TENANT_ENABLED=true 时生效）
        await initTenantContext();

        const dynamicRoutes = await permissionStore.generateRoutes();
        dynamicRoutes.forEach((route: RouteRecordRaw) => {
          router.addRoute(route);
        });

        return { ...to, replace: true };
      }

      // 路由 404 检查
      if (to.matched.length === 0) {
        // 从登录页跳转且目标路径无效，回退首页（避免不同用户权限不同导致的 404）
        if (_from.path === "/login") {
          return { path: "/", replace: true };
        }
        return "/404";
      }

      // 动态标题
      const title = (to.params.title as string) || (to.query.title as string);
      if (title) {
        to.meta.title = title;
      }
    } catch (error) {
      console.error("Route guard error:", error);

      const userStore = useUserStore();
      // 会话失效已由请求拦截器统一清状态并跳登录页，这里不再重复导航
      if (userStore.isSessionExpired()) {
        NProgress.done();
        return false;
      }

      await userStore.resetAllState();
      NProgress.done();
      return "/login";
    }
  });

  router.afterEach(() => {
    NProgress.done();
  });
}

/**
 * 初始化多租户上下文，未启用或失败时静默跳过
 */
async function initTenantContext(): Promise<void> {
  if (!isTenantEnabled()) return;

  try {
    await useTenantStoreHook().loadTenant();
  } catch {
    // 静默失败，不影响主流程
  }
}
