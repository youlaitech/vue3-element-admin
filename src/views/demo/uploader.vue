<!-- 文件上传组件(单图+多图)示例 -->
<script setup lang="ts">
import SingleUpload from '@/components/Upload/SingleUpload.vue';
import MultiUpload from '@/components/Upload/MultiUpload.vue';

const singlePicUrl = ref(
  'https://oss.youlai.tech/default/2022/11/20/18e206dae97b40329661537d1e433639.jpg'
);

const multiPicUrls = ref([
  'https://oss.youlai.tech/default/2022/11/20/8af5567816094545b53e76b38ae9c974.webp',
  'https://oss.youlai.tech/default/2022/11/20/13dbfd7feaf848c2acec2b21675eb9d3.webp'
]);
</script>
<template>
  <div class="app-container">
    <el-form>
      <el-form-item label="单图上传">
        <single-upload v-model="singlePicUrl"></single-upload>
      </el-form-item>
      <el-form-item label="多图上传">
        <multi-upload v-model="multiPicUrls"></multi-upload>
      </el-form-item>
    </el-form>
  </div>
</template>
