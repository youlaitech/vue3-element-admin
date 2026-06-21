<template>
  <ErrorPage
    status-code="401"
    label="访问受限"
    title="当前账号暂无访问权限"
    description="如果你确认需要访问该页面，请联系管理员调整权限后再试"
    variant="locked"
  >
    <template #actions>
      <el-button type="primary" :icon="House" @click="goHome">返回首页</el-button>
      <el-button :icon="Back" @click="router.back()">返回上一页</el-button>
    </template>
  </ErrorPage>
</template>

<script setup lang="ts">
import { Back, House } from "@element-plus/icons-vue";
import ErrorPage from "./components/ErrorPage.vue";

defineOptions({ name: "Page401" });

const router = useRouter();

/**
 * 回到首页，避免继续停留在无权限路由
 */
function goHome() {
  router.push("/");
}
</script>
