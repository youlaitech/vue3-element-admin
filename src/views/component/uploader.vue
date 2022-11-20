<script setup lang="ts">
import SingleUpload from '@/components/Upload/SingleUpload.vue';
import MultiUpload from '@/components/Upload/MultiUpload.vue';
import { ElForm } from 'element-plus';
import { reactive, ref, toRefs } from 'vue';

const dataFormRef = ref(ElForm);

const state = reactive({
  formData: {
    picUrl:
      'https://oss.youlai.tech/default/2022/11/20/18e206dae97b40329661537d1e433639.jpg',
    picUrls: [
      'https://oss.youlai.tech/default/2022/11/20/8af5567816094545b53e76b38ae9c974.webp',
      'https://oss.youlai.tech/default/2022/11/20/13dbfd7feaf848c2acec2b21675eb9d3.webp'
    ]
  }
});

const { formData } = toRefs(state);
</script>
<template>
  <div class="app-container">
    <el-form ref="dataFormRef" :model="formData">
      <el-form-item label="单图上传">
        <single-upload v-model="formData.picUrl"></single-upload>
      </el-form-item>
      <el-form-item label="多图上传">
        <multi-upload v-model="formData.picUrls"></multi-upload>
      </el-form-item>
    </el-form>
  </div>
</template>
