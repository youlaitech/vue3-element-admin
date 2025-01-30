<!-- 图片上传组件 -->
<template>
  <!-- 实际的上传组件（隐藏） -->
  <div style="display: none">
    <el-upload
      ref="uploadRef"
      :file-list="fileList"
      :http-request="handleUpload"
      :before-upload="handleBeforeUpload"
      :on-success="handleSuccess"
      :on-error="handleError"
      :data="props.additionalParams"
      :name="props.fileParamName"
      :accept="props.accept"
      :limit="props.limit"
    />
  </div>

  <!-- 自定义的显示区域 -->
  <div class="custom-upload-list">
    <!-- 已上传的图片列表 -->
    <div v-for="(path, index) in uploadedImageUrls" :key="index" class="custom-upload-item">
      <img class="upload-thumbnail" :src="path" alt="" />
      <div class="upload-actions">
        <span class="action-item preview" @click="previewImg(path)">
          <el-icon><zoom-in /></el-icon>
        </span>
        <span v-if="props.showDelBtn" class="action-item delete" @click="handleRemove(path)">
          <el-icon><Delete /></el-icon>
        </span>
      </div>
    </div>

    <!-- 上传按钮 -->
    <div
      v-if="uploadedImageUrls.length < props.limit && props.showUploadBtn"
      class="custom-upload-trigger"
      @click="triggerUpload"
    >
      <el-icon><Plus /></el-icon>
    </div>
  </div>

  <!-- 图片预览组件 -->
  <el-image-viewer
    v-if="previewVisible"
    :zoom-rate="1.2"
    :initialIndex="previewImageIndex"
    :url-list="uploadedImageUrls"
    @close="closePreview"
  />
</template>
<script setup lang="ts">
import { UploadRawFile, UploadUserFile, UploadRequestOptions } from "element-plus";
import FileAPI, { FileInfo } from "@/api/file";

const emit = defineEmits(["update:modelValue"]);

const props = defineProps({
  /**
   * 附加的参数
   */
  additionalParams: {
    type: Object,
    default: () => {
      return {};
    },
  },
  /**
   * 上传文件的参数名
   */
  fileParamName: {
    type: String,
    default: "file",
  },
  /**
   * 文件上传数量限制
   */
  limit: {
    type: Number,
    default: 1,
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
   * 单张图片最大大小,单位MB
   */
  maxSize: {
    type: Number,
    default: 10,
  },
  /**
   * 上传文件类型
   */
  accept: {
    type: String,
    default: "image/*",
  },

  /**
   * 自定义样式
   */
  style: {
    type: Object,
    default: () => {
      return {
        width: "130px",
        height: "130px",
      };
    },
  },
  /**
   * 是否多图上传
   */
  multiple: {
    type: Boolean,
    default: false,
  },
});

// 定义v-model
const modelValue = defineModel("modelValue", {
  type: [String, Array] as PropType<string | string[]>,
  required: true,
  default: () => "",
});

const previewVisible = ref(false); // 是否显示预览
const previewImageIndex = ref(0); // 预览的图片索引

const fileList = ref<UploadUserFile[]>([]); // 默认上传文件
const uploadedImageUrls = ref<string[]>([]); // 已上传的图片

// 添加一个ref来引用el-upload组件
const uploadRef = ref();

watch(
  () => modelValue.value,
  (newValue) => {
    if (Array.isArray(newValue)) {
      fileList.value = newValue.map((filePath) => {
        return { url: filePath } as UploadUserFile;
      });
    } else {
      fileList.value = [];
      uploadedImageUrls.value = [];
    }
  },
  { immediate: true }
);

/**
 * 删除图片
 */
function handleRemove(path: string) {
  if (path) {
    FileAPI.deleteByPath(path).then(() => {
      if (Array.isArray(modelValue.value)) {
        modelValue.value = modelValue.value.filter((x) => x !== path);
      } else {
        modelValue.value = "";
      }
    });
  }
}

/**
 * 限制用户上传文件的格式和大小
 */
function handleBeforeUpload(file: UploadRawFile) {
  // 限制文件大小
  if (file.size > props.maxSize * 1024 * 1024) {
    ElMessage.warning("上传图片不能大于" + props.maxSize + "M");
    return false;
  }
  return true;
}

/*
 * 上传文件
 */
function handleUpload(options: UploadRequestOptions) {
  return new Promise((resolve, reject) => {
    const { file, onSuccess, onError } = options;

    const formData = new FormData();
    formData.append(props.fileParamName, file);

    // 处理附加参数
    Object.keys(props.additionalParams).forEach((key) => {
      formData.append(key, props.additionalParams[key]);
    });

    FileAPI.upload(formData)
      .then((data) => {
        onSuccess(data);
        resolve(data);
      })
      .catch((error) => {
        onError(error);
        reject(error);
      });
  });
}

/**
 * 上传成功回调
 *
 * @param fileInfo 上传成功后的文件信息
 */
const handleSuccess = (fileInfo: FileInfo) => {
  ElMessage.success("上传成功");
  const { url } = fileInfo;
  uploadedImageUrls.value.push(url);
  if (props.multiple && Array.isArray(modelValue.value)) {
    modelValue.value.push(url);
  } else {
    modelValue.value = url;
  }
  return;
};

/**
 * 上传失败回调
 *
 * @param error 上传失败的错误信息
 */
const handleError = (error: any) => {
  ElMessage.error("上传失败");
};

/**
 * 预览图片
 */
const previewImg = (path: string) => {
  previewImageUrls.value = fileList.value.map((file) => file.url!);
  initialIndex.value = fileList.value.findIndex((file) => file.url === path);
  previewVisible.value = true;
};

/**
 * 关闭预览
 */
const closePreview = () => {
  previewVisible.value = false;
};

// 修改triggerUpload方法
const triggerUpload = () => {
  // 通过ref直接访问el-upload组件内的input元素
  const uploadEl = uploadRef.value.$el.querySelector(".el-upload__input");
  if (uploadEl) {
    uploadEl.click();
  }
};
</script>
<style lang="scss" scoped>
.custom-upload-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.custom-upload-item {
  position: relative;
  width: v-bind("props.style.width");
  height: v-bind("props.style.height");
  overflow: hidden;
  border-radius: 6px;

  .upload-thumbnail {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .upload-actions {
    position: absolute;
    top: 0;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    background-color: rgb(0 0 0 / 50%);
    opacity: 0;
    transition: opacity 0.3s;

    &:hover {
      opacity: 1;
    }

    .action-item {
      padding: 8px;
      color: #fff;
      cursor: pointer;

      &:hover {
        color: var(--el-color-primary);
      }
    }
  }
}

.custom-upload-trigger {
  display: flex;
  align-items: center;
  justify-content: center;
  width: v-bind("props.style.width");
  height: v-bind("props.style.height");
  cursor: pointer;
  background-color: rgb(255 254 254 / 50%);
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  transition: var(--el-transition-duration);

  &:hover {
    color: var(--el-color-primary);
    border-color: var(--el-color-primary);
  }

  .el-icon {
    font-size: 20px;
    color: #999;
  }

  &:hover .el-icon {
    color: var(--el-color-primary);
  }
}
</style>
