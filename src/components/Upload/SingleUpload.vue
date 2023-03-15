<template>
  <!-- 上传组件 -->
  <el-upload
    class="single-uploader"
    v-model="imgUrl"
    :show-file-list="false"
    list-type="picture-card"
    :before-upload="handleBeforeUpload"
    :http-request="uploadFile"
  >
    <img v-if="imgUrl" :src="imgUrl" class="single" />
    <el-icon v-else class="single-uploader-icon"><i-ep-plus /></el-icon>
  </el-upload>
</template>

<script setup lang="ts">
import { UploadRawFile, UploadRequestOptions } from 'element-plus';
import { uploadFileApi } from '@/api/file';

const emit = defineEmits(['update:modelValue']);

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
});

const imgUrl = computed<string | undefined>({
  get() {
    return props.modelValue;
  },
  set(val) {
    // imgUrl改变时触发修改父组件绑定的v-model的值
    emit('update:modelValue', val);
  }
});

/**
 * 自定义图片上传
 *
 * @param options
 */
async function uploadFile(options: UploadRequestOptions): Promise<any> {
  const { data: fileInfo } = await uploadFileApi(options.file);
  imgUrl.value = fileInfo.url;
}

/**
 * 限制用户上传文件的格式和大小
 */
function handleBeforeUpload(file: UploadRawFile) {
  if (file.size > 2 * 1048 * 1048) {
    ElMessage.warning('上传图片不能大于2M');
    return false;
  }
  return true;
}
</script>

<style scoped>
.single-uploader .single {
  width: 178px;
  height: 178px;
  display: block;
}
</style>

<style>
.single-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.single-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.el-icon.single-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
}
</style>
