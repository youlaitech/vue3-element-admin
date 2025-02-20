<!-- 文件上传组件 -->
<template>
  <div>
    <el-upload
      v-model:file-list="fileList"
      :class="props.showUploadBtn ? 'show-upload-btn' : 'hide-upload-btn'"
      :style="props.style"
      multiple
      :headers="props.headers"
      :data="props.data"
      :name="props.name"
      :before-upload="handleBeforeUpload"
      :on-remove="handleRemove"
      :on-progress="handleProgress"
      :on-success="handleSuccessFile"
      :on-error="handleError"
      :action="props.action"
      :accept="props.accept"
      :limit="props.limit"
    >
      <el-button
        v-if="props.showUploadBtn"
        type="primary"
        :disabled="fileList.length >= props.limit"
      >
        {{ props.uploadBtnText }}
      </el-button>
      <template v-if="props.showTip" #tip>
        <div class="el-upload__tip">
          {{ props.tip }}
        </div>
      </template>
      <template #file="{ file }">
        <div class="el-upload-list__item-info">
          <a class="el-upload-list__item-name" @click="downloadFile(file)">
            <el-icon><Document /></el-icon>
            <span class="el-upload-list__item-file-name">{{ file.name }}</span>
            <span v-if="props.showDelBtn" class="el-icon--close" @click.stop="handleRemove(file)">
              <el-icon><Close /></el-icon>
            </span>
          </a>
        </div>
      </template>
    </el-upload>
    <el-progress
      v-if="showUploadPercent"
      :style="{
        display: showUploadPercent ? 'inline-flex' : 'none',
        width: '100%',
      }"
      :percentage="uploadPercent"
      :color="customColorMethod"
    />
  </div>
</template>
<script lang="ts" setup>
import {
  UploadRawFile,
  UploadUserFile,
  UploadFile,
  UploadProgressEvent,
  UploadFiles,
} from "element-plus";

import FileAPI from "@/api/file";
import { getToken } from "@/utils/auth";
import { ResultEnum } from "@/enums/ResultEnum";

const emit = defineEmits(["update:modelValue"]);
const props = defineProps({
  /**
   * 文件集合
   */
  modelValue: {
    type: Array<UploadUserFile>,
    default: () => [],
  },
  /**
   * 上传地址
   */
  action: {
    type: String,
    default: FileAPI.uploadUrl,
  },
  /**
   * 文件上传数量限制
   */
  limit: {
    type: Number,
    default: 10,
  },
  /**
   * 是否显示删除按钮
   */
  showDelBtn: {
    type: Boolean,
    default: true,
  },
  /**
   * 是否显示上传按钮
   */
  showUploadBtn: {
    type: Boolean,
    default: true,
  },
  /**
   * 单个文件上传大小限制(单位MB)
   */
  maxSize: {
    type: Number,
    default: 2 * 1024 * 1024,
  },
  /**
   * 上传文件类型
   */
  accept: {
    type: String,
    default: "*",
  },
  /**
   * 上传按钮文本
   */
  uploadBtnText: {
    type: String,
    default: "上传文件",
  },
  /**
   * 是否展示提示信息
   */
  showTip: {
    type: Boolean,
    default: false,
  },
  /**
   * 提示信息内容
   */
  tip: {
    type: String,
    default: "",
  },
  /**
   * 请求头
   */
  headers: {
    type: Object,
    default: () => {
      return {
        Authorization: getToken(),
      };
    },
  },
  /**
   * 请求携带的额外参数
   */
  data: {
    type: Object,
    default: () => {
      return {};
    },
  },
  /**
   * 上传文件的参数名
   */
  name: {
    type: String,
    default: "file",
  },
  /**
   * 样式
   */
  style: {
    type: Object,
    default: () => {
      return {
        width: "300px",
      };
    },
  },
});

const fileList = ref([] as UploadUserFile[]);
const valFileList = ref([] as UploadUserFile[]);
const showUploadPercent = ref(false);
const uploadPercent = ref(0);

watch(
  () => props.modelValue,
  (newVal: UploadUserFile[]) => {
    const filePaths = fileList.value.map((file) => file.url);
    const fileNames = fileList.value.map((file) => file.name);
    // 监听modelValue文件集合值未变化时，跳过赋值
    if (
      filePaths.length > 0 &&
      filePaths.length === newVal.length &&
      filePaths.every((x) => newVal.some((y) => y.url === x)) &&
      newVal.every((y) => filePaths.some((x) => x === y.url)) &&
      fileNames.every((x) => newVal.some((y) => y.name === x)) &&
      newVal.every((y) => fileNames.some((x) => x === y.name))
    ) {
      return;
    }

    if (newVal.length <= 0) {
      fileList.value = [];
      valFileList.value = [];
      return;
    }

    fileList.value = newVal.map((file) => {
      return { name: file.name, url: file.url } as UploadFile;
    });

    valFileList.value = newVal.map((file) => {
      return { name: file.name, url: file.url } as UploadFile;
    });
  },
  { immediate: true }
);

/**
 * 限制用户上传文件的大小
 */
function handleBeforeUpload(file: UploadRawFile) {
  if (file.size > props.maxSize) {
    ElMessage.warning("上传文件不能大于" + props.maxSize + "M");
    return false;
  }
  uploadPercent.value = 0;
  showUploadPercent.value = true;
  return true;
}

const handleSuccessFile = (response: any, file: UploadFile) => {
  showUploadPercent.value = false;
  uploadPercent.value = 0;
  if (response.code === ResultEnum.SUCCESS) {
    ElMessage.success("上传成功");
    valFileList.value.push({
      name: file.name,
      url: response.data.url,
    });
    emit("update:modelValue", valFileList.value);
    return;
  } else {
    ElMessage.error(response.msg || "上传失败");
  }
};

const handleError = (error: any) => {
  showUploadPercent.value = false;
  uploadPercent.value = 0;
  ElMessage.error("上传失败");
};

const customColorMethod = (percentage: number) => {
  if (percentage < 30) {
    return "#909399";
  }
  if (percentage < 70) {
    return "#375ee8";
  }
  return "#67c23a";
};

const handleProgress = (event: UploadProgressEvent) => {
  uploadPercent.value = event.percent;
};

/**
 * 删除文件
 */
function handleRemove(removeFile: UploadUserFile) {
  const filePath = removeFile.url;
  if (filePath) {
    FileAPI.deleteByPath(filePath).then(() => {
      // 删除成功回调
      valFileList.value = valFileList.value.filter((file) => file.url !== filePath);
      emit("update:modelValue", valFileList.value);
    });
  }
}

/**
 * 下载文件
 */
function downloadFile(file: UploadUserFile) {
  const filePath = file.url;
  if (filePath) {
    FileAPI.downloadFile(filePath, file.name);
  }
}
</script>
<style lang="scss" scoped>
.el-upload-list__item .el-icon--close {
  position: absolute;
  top: 50%;
  right: 5px;
  color: var(--el-text-color-regular);
  cursor: pointer;
  opacity: 0.75;
  transition: opacity var(--el-transition-duration);
  transform: translateY(-50%);
}

:deep(.el-upload-list) {
  margin: 0;
}

:deep(.el-upload-list__item) {
  margin: 0;
}

.show-upload-btn {
  :deep(.el-upload) {
    display: inline-flex;
  }
}

.hide-upload-btn {
  :deep(.el-upload) {
    display: none;
  }
}
</style>
