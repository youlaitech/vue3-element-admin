<template>
  <el-breadcrumb class="flex-y-center">
    <el-breadcrumb-item v-for="(item, index) in breadcrumbs" :key="item.path">
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
// 默认补一个首页面包屑
const dashboardRoute: BreadcrumbRoute = { path: "/dashboard", meta: { title: "dashboard" } };

// 根据当前路由参数生成跳转路径
const pathCompile = (path: string) => {
  const { params } = currentRoute;
  const toPath = compile(path);
  return toPath(params);
};

const breadcrumbs = ref<BreadcrumbRoute[]>([]);

// 生成面包屑列表
function getBreadcrumb() {
  let matched: BreadcrumbRoute[] = currentRoute.matched
    .filter((item) => item.meta && item.meta.title)
    .map(({ path, name, redirect, meta }) => ({
      path,
      name,
      redirect: typeof redirect === "string" ? redirect : undefined,
      meta,
    }));

  const first = matched[0];
  if (!isDashboard(first)) {
    matched = [dashboardRoute].concat(matched);
  }
  breadcrumbs.value = matched.filter((item) => {
    return item.meta && item.meta.title && item.meta.breadcrumb !== false;
  });
}

// 判断是否为首页路由
function isDashboard(route?: BreadcrumbRoute) {
  const name = route?.name;
  if (!name) {
    return false;
  }
  return name.toString().trim().toLocaleLowerCase() === "Dashboard".toLocaleLowerCase();
}

// 处理面包屑跳转
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
