<!-- 图片上传组件 -->
<template>
  <!-- 实际的上传组件（隐藏） -->
  <div style="display: none">
    <el-upload
      ref="uploadRef"
      v-model:file-list="fileList"
      :before-upload="handleBeforeUpload"
      :action="props.action"
      :headers="props.headers"
      :data="props.data"
      :name="props.name"
      :on-success="handleSuccessFile"
      :on-error="handleError"
      :accept="props.accept"
      :limit="props.limit"
    />
  </div>

  <!-- 自定义的显示区域 -->
  <div class="custom-upload-list">
    <!-- 已上传的图片列表 -->
    <div v-for="(path, index) in valFileList" :key="index" class="custom-upload-item">
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
      v-if="valFileList.length < props.limit && props.showUploadBtn"
      class="custom-upload-trigger"
      @click="triggerUpload"
    >
      <el-icon><Plus /></el-icon>
    </div>
  </div>

  <!-- 图片预览组件 -->
  <el-image-viewer
    v-if="viewVisible"
    :zoom-rate="1.2"
    :initialIndex="initialIndex"
    :url-list="viewFileList"
    @close="closePreview"
  />
</template>
<script setup lang="ts">
import { UploadRawFile, UploadUserFile, UploadFile } from "element-plus";
import FileAPI from "@/api/file";
import { getToken } from "@/utils/auth";
import { ResultEnum } from "@/enums/ResultEnum";

const emit = defineEmits(["update:modelValue", "change"]);

const props = defineProps({
  /**
   * 文件路径集合
   */
  modelValue: {
    type: [Array, String],
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
   * 支持的文件类型,默认支持所有图片格式
   * eg:['png','jpg','jpeg','gif']
   */
  supportFileType: {
    type: Array<string>,
    default: () => [],
  },

  /**
   * 是否同步删除
   */
  isSyncDelete: {
    type: Boolean,
    default: true,
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
});

const viewVisible = ref(false);
const initialIndex = ref(0);

const fileList = ref([] as UploadUserFile[]);
const valFileList = ref([] as string[]);
const viewFileList = ref([] as string[]);

// 添加一个ref来引用el-upload组件
const uploadRef = ref();

watch(
  () => props.modelValue,
  (newVal) => {
    if (typeof newVal === "string" && !newVal) {
      fileList.value = [];
      viewFileList.value = [];
      valFileList.value = [];
      return;
    }
    const modelValue = typeof newVal === "string" ? [newVal] : (newVal as string[]);
    const filePaths = fileList.value.map((file) => file.url);
    // 监听modelValue文件集合值未变化时，跳过赋值
    if (
      filePaths.length > 0 &&
      filePaths.length === modelValue.length &&
      filePaths.every((x) => modelValue.some((y) => y === x)) &&
      modelValue.every((y) => filePaths.some((x) => x === y))
    ) {
      return;
    }

    if (!modelValue || modelValue.length <= 0) {
      fileList.value = [];
      viewFileList.value = [];
      valFileList.value = [];
      return;
    }

    fileList.value = modelValue.map((filePath) => {
      return { url: filePath } as UploadUserFile;
    });
    valFileList.value = modelValue;
  },
  { immediate: true }
);

/**
 * 上传成功回调
 *
 * @param options
 */
const handleSuccessFile = (response: any, file: UploadFile) => {
  if (response.code === ResultEnum.SUCCESS) {
    ElMessage.success("上传成功");
    valFileList.value.push(response.data.url);
    if (props.limit === 1) {
      emit("update:modelValue", response.data.url);
      emit("change", response.data.url);
    } else {
      emit("update:modelValue", valFileList.value);
      emit("change", valFileList.value);
    }
    return;
  } else {
    ElMessage.error(response.msg || "上传失败");
  }
};

const handleError = (error: any) => {
  ElMessage.error("上传失败");
};

/**
 * 删除图片
 */
function handleRemove(path: string) {
  if (path) {
    if (props.isSyncDelete) {
      FileAPI.deleteByPath(path).then(() => {
        valFileList.value = valFileList.value.filter((x) => x !== path);
        // 删除成功回调
        if (props.limit === 1) {
          emit("update:modelValue", "");
          emit("change", "");
        } else {
          emit("update:modelValue", valFileList.value);
          emit("change", valFileList.value);
        }
      });
    } else {
      valFileList.value = valFileList.value.filter((x) => x !== path);
      // 删除成功回调
      if (props.limit === 1) {
        emit("update:modelValue", "");
        emit("change", "");
      } else {
        emit("update:modelValue", valFileList.value);
        emit("change", valFileList.value);
      }
    }
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
  // 判断文件类型
  // 获取文件后缀名
  const fileExt = file.name.split(".").pop();
  if (!fileExt) {
    ElMessage.warning("上传图片格式错误,支持的文件类型:" + props.supportFileType.join(","));
    return false;
  }
  // 给文件后缀名转换为小写
  const lowerCaseFileExt = fileExt.toLowerCase();
  // 判断文件后缀名是否在支持的文件类型中
  if (props.supportFileType.length > 0) {
    let isSupport = false;
    props.supportFileType.forEach((type) => {
      if (type.toLowerCase() === lowerCaseFileExt) {
        isSupport = true;
      }
    });
    if (!isSupport) {
      ElMessage.warning("上传图片格式错误,支持的文件类型:" + props.supportFileType.join(","));
      return false;
    }
  }
  return true;
}

/**
 * 预览图片
 */
const previewImg = (path: string) => {
  viewFileList.value = fileList.value.map((file) => file.url!);
  initialIndex.value = fileList.value.findIndex((file) => file.url === path);
  viewVisible.value = true;
};

/**
 * 关闭预览
 */
const closePreview = () => {
  viewVisible.value = false;
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
