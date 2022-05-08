<template>
  <div>
    <!-- 上传组件 -->
    <el-upload
      ref="singleUploadRef"
      action=""
      class="single-uploader"
      :show-file-list="false"
      :before-upload="handleBeforeUpload"
      :http-request="uploadImage"
    >
      <img v-if="imgUrl" :src="imgUrl" class="single-uploader__image" />

      <el-icon v-else class="single-uploader__plus">
        <Plus />
      </el-icon>

      <!-- 删除图标 -->
      <el-icon
        v-if="props.showClose && imgUrl"
        class="single-uploader__remove"
        @click.stop="handleRemove(imgUrl)"
      >
        <Close />
      </el-icon>
    </el-upload>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Plus, Close } from '@element-plus/icons-vue';
import {
  ElMessage,
  ElUpload,
  UploadRawFile,
  UploadRequestOptions
} from 'element-plus';
import { uploadFile, deleteFile } from '@/api/system/file';

const emit = defineEmits(['update:modelValue']);

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  /**
   * 是否显示右上角的删除图片按钮
   */
  showClose: {
    type: Boolean,
    default: false
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
 * @param params
 */
async function uploadImage(options: UploadRequestOptions): Promise<any> {
  const response = await uploadFile(options.file);
  imgUrl.value = response.data;
}

/**
 * 删除图片
 *
 * @param fileUrl
 */
function handleRemove(fileUrl?: string) {
  if (fileUrl) {
    deleteFile(fileUrl);
    imgUrl.value = undefined; // 这里会触发imgUrl的computed的set方法
  }
}
/**
 * 在 before-upload 钩子中限制用户上传文件的格式和大小
 */
function handleBeforeUpload(file: UploadRawFile) {
  // const isJPG = file.type === "image/jpeg";
  const isLt2M = file.size / 1024 / 1024 < 2;

  if (!isLt2M) {
    ElMessage.warning('上传图片不能大于2M');
  }
  return true;
}
</script>

<style lang="scss" scoped>
.single-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
  text-align: center;
  &:hover {
    border-color: var(--el-color-primary);
  }

  &__image {
    width: 146px;
    height: 146px;
    display: block;
  }

  &__plus {
    width: 146px;
    height: 157px;
    font-size: 28px;
    color: #8c939d;
    text-align: center;
  }

  &__remove {
    font-size: 12px;
    color: #ff4d51 !important;
    margin-top: 0px !important;
    position: absolute;
    right: 0;
    top: 0;
    color: #409eff;
  }
}
</style>
