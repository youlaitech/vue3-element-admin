<!-- 接口文档 -->
<template>
  <div class="app-container">
    <iframe
      id="apidoc-iframe"
      src="https://www.apifox.cn/apidoc/shared-195e783f-4d85-4235-a038-eec696de4ea5"
      width="100%"
      frameborder="0"
    ></iframe>
  </div>
</template>

<style lang="scss" scoped>
#apidoc-iframe {
  height: calc(100vh - 100px);
}

.hasTagsView {
  #apidoc-iframe {
    height: calc(100vh - 140px);
  }
}
</style>
