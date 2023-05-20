<!-- 文件上传组件(单图+多图)示例 -->
<script setup lang="ts">
import SingleUpload from "@/components/Upload/SingleUpload.vue";
import MultiUpload from "@/components/Upload/MultiUpload.vue";

const singlePicUrl = ref(
  "https://oss.youlai.tech/youlai-boot/2023/05/20/2b6d8b49fa1047348a0a41cef5aaf69e.gif"
);

const multiPicUrls = ref([
  "https://oss.youlai.tech/youlai-boot/2023/05/20/7cc0e5bc14904bd4a8a5e25a7e47ae75.jpg",
  "https://oss.youlai.tech/youlai-boot/2023/05/20/67ce044e457b4184a1ff5576e6672941.jpg",
  "https://oss.youlai.tech/youlai-boot/2023/05/20/a64d0b4f45904dc7999ed620288d25d2.jpg",
  "https://oss.youlai.tech/youlai-boot/2023/05/20/d94d0827c4974c279c190e9ba2b82070.jpg",
  "https://oss.youlai.tech/youlai-boot/2023/05/20/e75cd4cbcfe54697bc14c42592427bfc.jpg",
]);
</script>
<template>
  <div class="app-container">
    <el-link href="https://element-plus.org" type="primary" target="_blank"
      >示例源码 请点击>>>>>>></el-link
    >

    <el-form class="mt-10">
      <el-form-item label="单图上传">
        <single-upload v-model="singlePicUrl" />
      </el-form-item>
      <el-form-item label="多图上传">
        <multi-upload v-model="multiPicUrls" />
      </el-form-item>
    </el-form>
  </div>
</template>
