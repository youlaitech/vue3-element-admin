<!-- 文件上传组件 -->
<template>
  <div>
    <el-upload
      v-model:file-list="fileList"
      :style="props.style"
      :before-upload="handleBeforeUpload"
      :http-request="handleUpload"
      :on-progress="handleProgress"
      :on-success="handleSuccess"
      :on-error="handleError"
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
        <div class="el-upload-list__item-info">
          <a class="el-upload-list__item-name" @click="handleDownload(file)">
            <el-icon><Document /></el-icon>
            <span class="el-upload-list__item-file-name">{{ file.name }}</span>
            <span class="el-icon--close" @click.stop="handleRemove(file.url!)">
              <el-icon><Close /></el-icon>
            </span>
          </a>
        </div>
      </template>
    </el-upload>

    <el-progress
      :style="{
        display: showProgress ? 'inline-flex' : 'none',
        width: '100%',
      }"
      :percentage="progressPercent"
    />
  </div>
</template>
<script lang="ts" setup>
import {
  UploadRawFile,
  UploadUserFile,
  UploadFile,
  UploadFiles,
  UploadProgressEvent,
  UploadRequestOptions,
} from "element-plus";

import FileAPI, { FileInfo } from "@/api/file.api";

const props = defineProps({
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
   * 文件上传数量限制
   */
  limit: {
    type: Number,
    default: 10,
  },
  /**
   * 单个文件上传大小限制(单位MB)
   */
  maxFileSize: {
    type: Number,
    default: 10,
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

const modelValue = defineModel("modelValue", {
  type: [Array] as PropType<FileInfo[]>,
  required: true,
  default: () => [],
});

const fileList = ref([] as UploadFile[]);

const showProgress = ref(false);
const progressPercent = ref(0);

// 监听 modelValue 转换用于显示的 fileList
watch(
  modelValue,
  (value) => {
    fileList.value = value.map((item) => {
      const name = item.name ? item.name : item.url?.substring(item.url.lastIndexOf("/") + 1);
      return {
        name: name,
        url: item.url,
        status: "success",
        uid: getUid(),
      } as UploadFile;
    });
  },
  {
    immediate: true,
  }
);

/**
 * 上传前校验
 */
function handleBeforeUpload(file: UploadRawFile) {
  // 限制文件大小
  if (file.size > props.maxFileSize * 1024 * 1024) {
    ElMessage.warning("上传文件不能大于" + props.maxFileSize + "M");
    return false;
  }
  return true;
}

/*
 * 上传文件
 */
function handleUpload(options: UploadRequestOptions) {
  return new Promise((resolve, reject) => {
    const file = options.file;

    const formData = new FormData();
    formData.append(props.name, file);

    // 处理附加参数
    Object.keys(props.data).forEach((key) => {
      formData.append(key, props.data[key]);
    });

    FileAPI.upload(formData)
      .then((data) => {
        resolve(data);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

/**
 * 上传进度
 *
 * @param event
 */
const handleProgress = (event: UploadProgressEvent) => {
  progressPercent.value = event.percent;
};

/**
 * 上传成功
 */
const handleSuccess = (response: any, uploadFile: UploadFile, files: UploadFiles) => {
  ElMessage.success("上传成功");
  //只有当状态为success或者fail，代表文件上传全部完成了，失败也算完成
  if (
    files.every((file: UploadFile) => {
      return file.status === "success" || file.status === "fail";
    })
  ) {
    let fileInfos = [] as FileInfo[];
    files.map((file: UploadFile) => {
      if (file.status === "success") {
        //只取携带response的才是刚上传的
        let res = file.response as FileInfo;
        if (res) {
          fileInfos.push({ name: res.name, url: res.url } as FileInfo);
        }
      } else {
        //失败上传 从fileList删掉，不展示
        fileList.value.splice(
          fileList.value.findIndex((e) => e.uid === file.uid),
          1
        );
      }
    });
    if (fileInfos.length > 0) {
      modelValue.value = [...modelValue.value, ...fileInfos];
    }
  }
};

/**
 * 上传失败
 */
const handleError = (_error: any) => {
  console.error(_error);
  ElMessage.error("上传失败");
};

/**
 * 删除文件
 */
function handleRemove(fileUrl: string) {
  FileAPI.delete(fileUrl).then(() => {
    modelValue.value = modelValue.value.filter((file) => file.url !== fileUrl);
  });
}

/**
 * 下载文件
 */
function handleDownload(file: UploadUserFile) {
  const { url, name } = file;
  if (url) {
    FileAPI.download(url, name);
  }
}

/** 获取一个不重复的id */
function getUid(): number {
  // 时间戳左移13位（相当于乘以8192） + 4位随机数
  return (Date.now() << 13) | Math.floor(Math.random() * 8192);
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
