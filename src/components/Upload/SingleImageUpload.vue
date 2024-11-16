<!-- 单图上传组件 -->
<template>
  <el-upload
    v-model="imgUrl"
    class="img-upload"
    :show-file-list="false"
    list-type="picture-card"
    :before-upload="handleBeforeUpload"
    :http-request="uploadFile"
    :style="{ width: props.size, height: props.size }"
    :accept="props.accept"
  >
    <template #default>
      <el-image v-if="imgUrl" :src="imgUrl" />

      <div v-if="imgUrl" class="img-upload__overlay">
        <el-icon class="img-upload__preview-icon" @click.stop="handlePreview">
          <ZoomIn />
        </el-icon>

        <el-icon class="img-upload__delete-icon" @click.stop="handleDelete">
          <Delete />
        </el-icon>
      </div>
      <el-icon v-else class="img-upload__add-icon">
        <Plus />
      </el-icon>
    </template>
  </el-upload>
</template>

<script setup lang="ts">
import { ElImageViewer, UploadRawFile, UploadRequestOptions } from "element-plus";
import FileAPI from "@/api/file";

const props = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
  maxSize: {
    type: Number,
    default: 10, // 默认限制为 10MB
  },
  accept: {
    type: String,
    default: "",
  },
  size: {
    type: String,
    default: "150px",
  },
});

const emit = defineEmits(["update:modelValue"]);
const imgUrl = defineModel("modelValue", {
  type: String,
  required: true,
  default: "",
});

/**
 * 自定义图片上传
 *
 * @param options
 */
async function uploadFile(options: UploadRequestOptions): Promise<any> {
  const data = await FileAPI.upload(options.file);
  imgUrl.value = data.url;
}

/**
 * 限制用户上传文件的格式和大小
 */
function handleBeforeUpload(file: UploadRawFile) {
  if (file.size > props.maxSize * 1024 * 1024) {
    ElMessage.warning(`上传图片不能大于${props.maxSize}MB`);
    return false;
  }

  return true;
}

/**
 * 预览图片
 */
function handlePreview() {
  if (imgUrl.value) {
    const imageViewerApp = createApp({
      setup() {
        return () =>
          h(ElImageViewer, {
            urlList: [imgUrl.value],
            initialIndex: 0,
            onClose: () => {
              imageViewerApp.unmount();
              document.body.removeChild(container);
            },
          });
      },
    });
    const container = document.createElement("div");
    document.body.appendChild(container);
    imageViewerApp.mount(container);
  }
}

/**
 * 删除图片
 */
function handleDelete() {
  imgUrl.value = "";
}
</script>

<style scoped lang="scss">
:deep(.el-upload--picture-card) {
  /*  width: var(--el-upload-picture-card-size);
  height: var(--el-upload-picture-card-size); */
  width: 100%;
  height: 100%;
}

.img-upload {
  position: relative;
  overflow: hidden;
  cursor: pointer;
  border: 1px var(--el-border-color) solid;
  border-radius: 5px;

  &:hover {
    border-color: var(--el-color-primary);
  }

  &__delete-icon {
    margin-left: 5px;
  }

  &__overlay {
    position: absolute;
    top: 0;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    color: #fff;
    background-color: var(--el-overlay-color-lighter);
    border-radius: 6px;
    opacity: 0;
    transition: opacity var(--el-transition-duration);

    &:hover {
      opacity: 1;
    }
  }
}
</style>
