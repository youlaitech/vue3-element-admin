<!-- 文件上传组件(单图+多图)示例 -->
<script setup lang="ts">
import SingleUpload from "@/components/Upload/SingleUpload.vue";
import MultiUpload from "@/components/Upload/MultiUpload.vue";

const singlePicUrl = ref(
  "https://oss.youlai.tech/youlai-boot/2023/05/20/2b6d8b49fa1047348a0a41cef5aaf69e.gif"
);
// 这里放外链图片，防止被删
const multiPicUrls = ref([
  "https://s2.loli.net/2023/05/24/yNsxFC8rLHMZQcK.jpg",
  "https://s2.loli.net/2023/05/24/RuHFMwW4rG5lIqs.jpg",
  "https://s2.loli.net/2023/05/24/ZPiGbcpR91WqInB.jpg",
  "https://s2.loli.net/2023/05/24/e1bcnEq3MFdmlNL.jpg",
  "https://s2.loli.net/2023/05/24/wZTSPj1yDQNcuhU.jpg",
]);
</script>
<template>
  <div class="app-container">
    <el-link
      href="https://gitee.com/youlaiorg/vue3-element-admin/blob/master/src/views/demo/upload.vue"
      type="primary"
      target="_blank"
      class="mb-10"
      >示例源码 请点击>>>></el-link
    >

    <el-form>
      <el-form-item label="单图上传">
        <single-upload v-model="singlePicUrl" />
      </el-form-item>
      <el-form-item label="多图上传">
        <multi-upload v-model="multiPicUrls" />
      </el-form-item>
    </el-form>
  </div>
</template>
