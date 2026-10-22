<template>
  <div />
</template>

<script setup lang="ts">
const route = useRoute();
const router = useRouter();

const routePath = route.params.path;
const targetPath = Array.isArray(routePath) ? routePath.join("/") : routePath;

// 页签刷新先进入中转路由，再替换回目标页面以触发组件重建
router.replace({
  path: `/${targetPath || ""}`,
  query: route.query,
});
</script>
