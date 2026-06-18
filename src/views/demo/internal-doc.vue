<template>
  <div class="page-container">
    <iframe src="https://juejin.cn/post/7228990409909108793" frameborder="0" />
  </div>
</template>
<style lang="scss" scoped>
@use "@/styles/variables" as *;

.page-container {
  height: calc(100vh - $navbar-height);
}

.hasTagsView {
  .page-container {
    height: calc(100vh - $navbar-height - $tags-view-height);
  }
}

iframe {
  width: 100%;
  height: 100%;
}
</style>
