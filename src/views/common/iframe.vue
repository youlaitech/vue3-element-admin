<template>
  <div class="iframe-page">
    <iframe v-if="iframeUrl" :src="iframeUrl" :title="iframeTitle" />
    <el-empty v-else description="未配置内嵌页面地址" />
  </div>
</template>

<script setup lang="ts">
const route = useRoute();

const iframeUrl = computed(() => {
  const url = route.meta.externalUrl;
  return typeof url === "string" ? url : "";
});

const iframeTitle = computed(() => {
  const title = route.meta.title;
  return typeof title === "string" ? title : "iframe";
});
</script>

<style lang="scss" scoped>
.iframe-page {
  width: 100%;
  height: 100%;
  background: var(--el-bg-color);

  iframe {
    display: block;
    width: 100%;
    height: 100%;
    border: 0;
  }
}
</style>
