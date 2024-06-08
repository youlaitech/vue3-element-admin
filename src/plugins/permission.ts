import router from "@/router";
import { useUserStore, usePermissionStore } from "@/store";
import NProgress from "@/utils/nprogress";
import { RouteRecordRaw } from "vue-router";
import { TOKEN_KEY } from "@/enums/CacheEnum";

export function setupPermission() {
  // 白名单路由
  const whiteList = ["/login"];

  router.beforeEach(async (to, from, next) => {
    NProgress.start();
    const hasToken = localStorage.getItem(TOKEN_KEY);
    if (hasToken) {
      if (to.path === "/login") {
        // 如果已登录，跳转首页
        next({ path: "/" });
        NProgress.done();
      } else {
        const userStore = useUserStore();
        const hasRoles =
          userStore.user.roles && userStore.user.roles.length > 0;
        if (hasRoles) {
          // 未匹配到任何路由，跳转404
          if (to.matched.length === 0) {
            from.name ? next({ name: from.name }) : next("/404");
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
            const { roles } = await userStore.getUserInfo();
            const accessRoutes = await permissionStore.generateRoutes(roles);
            accessRoutes.forEach((route: RouteRecordRaw) => {
              router.addRoute(route);
            });
            next({ ...to, replace: true });
          } catch (error) {
            // 移除 token 并跳转登录页
            await userStore.resetToken();
            // 重定向到登录页，并携带当前页面路由和参数，作为登录成功后跳转的页面
            const params = new URLSearchParams(
              to.query as Record<string, string>
            );
            const queryString = params.toString();
            const redirect = queryString
              ? `${to.path}?${queryString}`
              : to.path;
            next(`/login?redirect=${encodeURIComponent(redirect)}`);
            NProgress.done();
          }
        }
      }
    } else {
      // 未登录
      if (whiteList.indexOf(to.path) !== -1) {
        // 在白名单，直接进入
        next();
      } else {
        // 不在白名单，重定向到登录页
        const params = new URLSearchParams(to.query as Record<string, string>);
        const queryString = params.toString();
        const redirect = queryString ? `${to.path}?${queryString}` : to.path;
        next(`/login?redirect=${encodeURIComponent(redirect)}`);
        NProgress.done();
      }
    }
  });

  router.afterEach(() => {
    NProgress.done();
  });
}

// 是否有权限
export function hasAuth(
  value: string | string[],
  type: "button" | "role" = "button"
) {
  const { roles, perms } = useUserStore().user;
  //「超级管理员」拥有所有的按钮权限
  if (type === "button" && roles.includes("ROOT")) {
    return true;
  }
  const auths = type === "button" ? perms : roles;
  return typeof value === "string"
    ? auths.includes(value)
    : auths.some((perm) => {
        return value.includes(perm);
      });
}
