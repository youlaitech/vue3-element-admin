<template>
  <div class="app-container">
    <iframe src="https://juejin.cn/post/7228990409909108793" frameborder="0" />
  </div>
</template>
<style lang="scss" scoped>
/** 关闭tag标签  */
.app-container {
  /* 50px = navbar = 50px */
  height: calc(100vh - 50px);
}

/** 开启tag标签  */
.hasTagsView {
  .app-container {
    /* 84px = navbar + tags-view = 50px + 34px */
    height: calc(100vh - 84px);
  }
}

iframe {
  width: 100%;
  height: 100%;
}
</style>
