<!-- 文件上传组件 -->
<template>
  <div>
    <el-upload
      v-model:file-list="fileList"
      :style="props.style"
      :before-upload="handleBeforeUpload"
      :http-request="handleUpload"
      :on-success="handleSuccess"
      :on-error="handleError"
      :on-exceed="handleExceed"
      :accept="props.accept"
      :limit="props.limit"
      multiple
    >
      <!-- 上传文件按钮 -->
      <el-button type="primary" :disabled="fileList.length >= props.limit">
        {{ props.uploadBtnText }}
      </el-button>

      <!-- 文件列表 -->
      <template #file="{ file }">
        <template v-if="file.status === 'success'">
          <div class="el-upload-list__item-info">
            <button
              type="button"
              class="el-upload-list__item-name file-action"
              @click="handleDownload(file)"
            >
              <el-icon>
                <Document />
              </el-icon>
              <span class="el-upload-list__item-file-name">{{ file.name }}</span>
            </button>
            <button
              type="button"
              class="el-icon--close file-action"
              :aria-label="`删除${file.name}`"
              @click.stop="handleRemove(file.url!)"
            >
              <el-icon aria-hidden="true"><Close /></el-icon>
            </button>
          </div>
        </template>
        <template v-else>
          <div class="el-upload-list__item-info">
            <el-progress style="display: inline-flex" :percentage="file.percentage" />
          </div>
        </template>
      </template>
    </el-upload>
  </div>
</template>
<script lang="ts" setup>
import type { UploadRawFile, UploadUserFile, UploadRequestOptions } from "element-plus";

import FileAPI from "@/api/file";
import type { FileInfo } from "@/api/file";
import { useUploadQueue } from "./useUploadQueue";

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
  /** 单个文件上传大小限制(单位 MB) */
  maxFileSize: {
    type: Number,
    default: 10,
  },
  /** 上传文件类型 */
  accept: {
    type: String,
    default: "*",
  },
  /** 上传按钮文本 */
  uploadBtnText: {
    type: String,
    default: "上传文件",
  },

  /** 样式 */
  style: {
    type: Object,
    default: () => {
      return {
        width: "300px",
      };
    },
  },
});
const modelValue = defineModel<FileInfo[]>({ default: () => [] });
const queue = useUploadQueue(modelValue, {
  toFile: (file) => file,
  toValue: (file) => file,
});
const { fileList } = queue;

/**
 * 检查单个文件的大小限制。
 */
function handleBeforeUpload(file: UploadRawFile): boolean {
  if (file.size > props.maxFileSize * 1024 * 1024) {
    ElMessage.warning("上传文件不能大于" + props.maxFileSize + "M");
    return false;
  }
  return true;
}

/**
 * 通过上传队列提交文件及附加参数。
 */
function handleUpload(options: UploadRequestOptions): Promise<FileInfo> {
  return queue.upload(options, props);
}

/**
 * 提示上传数量已达上限。
 */
function handleExceed(): void {
  ElMessage.warning("最多只能上传 " + props.limit + " 个文件");
}

/**
 * 结算有效上传任务并提示成功。
 */
function handleSuccess(info: FileInfo, file: UploadUserFile): void {
  if (queue.complete(info, file)) ElMessage.success("上传成功");
}

/**
 * 清理有效失败任务并提示错误。
 */
function handleError(_error: unknown, file: UploadUserFile): void {
  if (queue.fail(file)) ElMessage.error("上传失败");
}

/**
 * 删除远端文件后移除表单中的引用。
 */
async function handleRemove(fileUrl: string): Promise<void> {
  await FileAPI.delete(fileUrl);
  queue.remove(fileUrl);
}

/**
 * 下载已有地址的文件。
 */
function handleDownload(file: UploadUserFile) {
  if (file.url) return FileAPI.download(file.url, file.name);
}
</script>
<style lang="scss" scoped>
.file-action {
  padding: 0;
  font: inherit;
  text-align: inherit;
  cursor: pointer;
  background: transparent;
  border: 0;

  &:focus-visible {
    outline: 2px solid var(--el-color-primary);
    outline-offset: 2px;
  }
}

.el-upload-list__item .el-icon--close {
  position: absolute;
  top: 50%;
  right: 5px;
  color: var(--el-text-color-regular);
  cursor: pointer;
  opacity: 0.75;
  transform: translateY(-50%);
  transition: opacity var(--el-transition-duration);
}

:deep(.el-upload-list) {
  margin: 0;
}

:deep(.el-upload-list__item) {
  margin: 0;
}
</style>
