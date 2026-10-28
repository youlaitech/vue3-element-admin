<!-- 图片上传组件 -->
<template>
  <el-upload
    v-model:file-list="fileList"
    list-type="picture-card"
    :before-upload="handleBeforeUpload"
    :http-request="handleUpload"
    :on-success="handleSuccess"
    :on-error="handleError"
    :on-exceed="handleExceed"
    :accept="props.accept"
    :limit="props.limit"
    multiple
  >
    <el-icon><Plus /></el-icon>
    <template #file="{ file }">
      <div style="width: 100%">
        <img
          class="el-upload-list__item-thumbnail"
          :src="file.url"
          :alt="file.name || '上传图片'"
        />
        <span class="el-upload-list__item-actions">
          <!-- 预览 -->
          <button
            type="button"
            class="image-action"
            aria-label="预览图片"
            :disabled="file.status !== 'success'"
            @click="handlePreviewImage(file.url!)"
          >
            <el-icon aria-hidden="true"><ZoomIn /></el-icon>
          </button>
          <!-- 删除 -->
          <button
            type="button"
            class="image-action"
            aria-label="删除图片"
            @click="handleRemove(file)"
          >
            <el-icon aria-hidden="true"><Delete /></el-icon>
          </button>
        </span>
      </div>
    </template>
  </el-upload>

  <el-image-viewer
    v-if="previewVisible"
    :zoom-rate="1.2"
    :initial-index="previewImageIndex"
    :url-list="modelValue"
    @close="handlePreviewClose"
  />
</template>
<script setup lang="ts">
import type { UploadRawFile, UploadRequestOptions, UploadUserFile } from "element-plus";
import FileAPI from "@/api/file";
import type { FileInfo } from "@/api/file";
import { useUploadQueue } from "./useUploadQueue";

/**
 * 多图上传：图片卡片列表与预览
 */
const props = defineProps({
  /** 请求携带的额外参数 */
  data: {
    type: Object,
    default: () => {
      return {};
    },
  },
  /** 上传文件的参数名 */
  name: {
    type: String,
    default: "file",
  },
  /** 文件上传数量限制 */
  limit: {
    type: Number,
    default: 10,
  },
  /** 单个文件的最大允许大小 */
  maxFileSize: {
    type: Number,
    default: 10,
  },
  /** 上传文件类型 */
  accept: {
    type: String,
    default: "image/*", // 默认支持所有图片格式，如果需要指定格式，格式如下：.png,.jpg,.jpeg,.gif,.bmp
  },
});

const previewVisible = ref(false); // 是否显示预览
const previewImageIndex = ref(0); // 预览图片的索引

const modelValue = defineModel<string[]>({ default: () => [] });
const queue = useUploadQueue(modelValue, {
  toFile: (url) => ({ name: url.substring(url.lastIndexOf("/") + 1), url }),
  toValue: (file) => file.url,
});
const { fileList } = queue;

/**
 * 删除图片：模型与展示队列按各自条件删除，两个数组的下标不保证一致
 */
async function handleRemove(file: UploadUserFile): Promise<void> {
  if (file.status !== "success") {
    queue.cancel(file);
    return;
  }
  if (!file.url) return;
  await FileAPI.delete(file.url);
  queue.remove(file.url);
}

/**
 * 上传前校验
 */
function handleBeforeUpload(file: UploadRawFile) {
  // accept 支持 image/*、.png、image/png 三种写法，浏览器只按它过滤，还需按同样规则复核实际文件
  const acceptTypes = props.accept.split(",").map((type) => type.trim());

  const isValidType = acceptTypes.some((type) => {
    if (type === "image/*") {
      return file.type.startsWith("image/");
    } else if (type.startsWith(".")) {
      return file.name.toLowerCase().endsWith(type);
    } else {
      return file.type === type;
    }
  });

  if (!isValidType) {
    ElMessage.warning("上传文件的格式不正确，仅支持 " + props.accept);
    return false;
  }

  // 限制文件大小
  if (file.size > props.maxFileSize * 1024 * 1024) {
    ElMessage.warning("上传图片不能大于" + props.maxFileSize + "M");
    return false;
  }
  return true;
}

/**
 * 上传文件
 */
function handleUpload(options: UploadRequestOptions): Promise<FileInfo> {
  return queue.upload(options, props);
}

/**
 * 上传文件超出限制
 */
function handleExceed() {
  ElMessage.warning("最多只能上传 " + props.limit + " 张图片");
}

/**
 * 上传成功回调：按 uid 定位任务更新结果，再显式提交新模型数组
 */
const handleSuccess = (fileInfo: FileInfo, uploadFile: UploadUserFile) => {
  if (queue.complete(fileInfo, uploadFile)) ElMessage.success("上传成功");
};

/**
 * 上传失败回调
 */
const handleError = (_error: unknown, uploadFile: UploadUserFile) => {
  if (queue.fail(uploadFile)) ElMessage.error("上传失败");
};

/**
 * 预览图片
 */
const handlePreviewImage = (imageUrl: string) => {
  previewImageIndex.value = modelValue.value.findIndex((url) => url === imageUrl);
  previewVisible.value = true;
};

/**
 * 关闭预览
 */
const handlePreviewClose = () => {
  previewVisible.value = false;
};
</script>

<style scoped lang="scss">
.image-action {
  padding: 0;
  margin: 0 8px;
  font: inherit;
  color: inherit;
  cursor: pointer;
  background: transparent;
  border: 0;

  &:focus-visible {
    outline: 2px solid var(--el-color-primary);
    outline-offset: 3px;
  }
}
</style>
