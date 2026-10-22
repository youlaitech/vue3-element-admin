<template>
  <ErrorPage
    status-code="404"
    label="页面未找到"
    title="抱歉，访问的页面不存在"
    description="页面地址可能已变更、被移除，或者当前账号尚未加载对应路由"
    variant="missing"
  >
    <template #actions>
      <el-button type="primary" :icon="House" @click="goHome">返回首页</el-button>
      <el-button :icon="Refresh" @click="reload">重新加载</el-button>
    </template>
  </ErrorPage>
</template>

<script setup lang="ts">
import { House, Refresh } from "@element-plus/icons-vue";
import ErrorPage from "./components/ErrorPage.vue";

defineOptions({ name: "Page404" });

const router = useRouter();

/**
 * 回到首页，重新进入权限路由匹配
 */
function goHome() {
  router.push("/");
}

/**
 * 重新加载页面，处理动态路由未及时注册的场景
 */
function reload() {
  window.location.reload();
}
</script>
