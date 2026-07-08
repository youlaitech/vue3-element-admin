<template>
  <el-breadcrumb class="flex-y-center">
    <el-breadcrumb-item v-for="(item, index) in breadcrumbs" :key="item.path">
      <!-- 末级或不可跳转的节点显示为纯文本，其余可点击 -->
      <span
        v-if="item.redirect === 'noredirect' || index === breadcrumbs.length - 1"
        class="color-gray-400"
      >
        {{ translateRouteTitle(item.meta.title ?? "") }}
      </span>
      <a v-else @click.prevent="handleLink(item)">
        {{ translateRouteTitle(item.meta.title ?? "") }}
      </a>
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>

<script setup lang="ts">
import type { RouteLocationMatched } from "vue-router";
import { compile } from "path-to-regexp";
import router from "@/router";
import { translateRouteTitle } from "@/lang/utils";

type BreadcrumbRoute = {
  path: string;
  name?: RouteLocationMatched["name"];
  redirect?: string;
  meta: RouteLocationMatched["meta"];
};

const currentRoute = useRoute();

// 面包屑取 matched 链，不拼首页（首页与一级菜单平级，非父级）
const pathCompile = (path: string) => {
  // 补全动态路由参数，如 /user/:id
  const { params } = currentRoute;
  const toPath = compile(path);
  return toPath(params);
};

const breadcrumbs = ref<BreadcrumbRoute[]>([]);

// 生成面包屑：取路由 matched 中有标题的层级，
// 用 meta.breadcrumb = false 可以隐藏某一级
function getBreadcrumb() {
  const matched: BreadcrumbRoute[] = currentRoute.matched
    .filter((item) => item.meta && item.meta.title)
    .map(({ path, name, redirect, meta }) => ({
      path,
      name,
      redirect: typeof redirect === "string" ? redirect : undefined,
      meta,
    }));

  breadcrumbs.value = matched.filter((item) => {
    return item.meta && item.meta.title && item.meta.breadcrumb !== false;
  });
}

// 跳转：有 redirect 走 redirect，否则按路径（含动态参数先 compile）
function handleLink(item: BreadcrumbRoute) {
  const { redirect, path } = item;
  if (redirect) {
    router.push(redirect).catch((err) => {
      console.warn(err);
    });
    return;
  }
  router.push(pathCompile(path)).catch((err) => {
    console.warn(err);
  });
}

// 路由变化就重算面包屑，但 /redirect/ 这类中转路由跳过
watch(
  () => currentRoute.path,
  (path) => {
    if (path.startsWith("/redirect/")) {
      return;
    }
    getBreadcrumb();
  }
);

onBeforeMount(() => {
  getBreadcrumb();
});
</script>

<style lang="scss" scoped>
// 覆盖 element-plus 的样式
.el-breadcrumb__inner,
.el-breadcrumb__inner a {
  font-weight: 400 !important;
}
</style>
