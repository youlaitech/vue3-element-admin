<!-- 图片上传组件 -->
<template>
  <el-upload
    v-model:file-list="fileList"
    list-type="picture-card"
    :class="fileList.length >= props.limit || !props.showUploadBtn ? 'hide' : 'show'"
    :before-upload="handleBeforeUpload"
    :action="props.action"
    :headers="props.headers"
    :data="props.data"
    :name="props.name"
    :on-success="handleSuccessFile"
    :on-error="handleError"
    :accept="props.accept"
    :limit="props.limit"
  >
    <el-icon><Plus /></el-icon>
    <template #file="{ file }">
      <div style="width: 100%">
        <img class="el-upload-list__item-thumbnail" :src="file.url" alt="" />
        <span class="el-upload-list__item-actions">
          <span class="el-upload-list__item-preview" @click="previewImg(file)">
            <el-icon><zoom-in /></el-icon>
          </span>
          <span
            v-if="props.showDelBtn"
            class="el-upload-list__item-delete"
            @click="handleRemove(file)"
          >
            <el-icon><Delete /></el-icon>
          </span>
        </span>
      </div>
    </template>
  </el-upload>

  <el-image-viewer
    v-if="viewVisible"
    :zoom-rate="1.2"
    :initialIndex="initialIndex"
    :url-list="viewFileList"
    @close="closePreview"
  />
</template>
<script setup lang="ts">
import { UploadRawFile, UploadUserFile, UploadFile, UploadProps } from "element-plus";
import FileAPI from "@/api/file";
import { getToken } from "@/utils/auth";
import { ResultEnum } from "@/enums/ResultEnum";

const emit = defineEmits(["update:modelValue"]);

const props = defineProps({
  /**
   * 文件路径集合
   */
  modelValue: {
    type: Array<string>,
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
   * 单张图片最大大小
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
});

const viewVisible = ref(false);
const initialIndex = ref(0);

const fileList = ref([] as UploadUserFile[]);
const valFileList = ref([] as string[]);
const viewFileList = ref([] as string[]);

watch(
  () => props.modelValue,
  (newVal: string[]) => {
    const filePaths = fileList.value.map((file) => file.url);
    // 监听modelValue文件集合值未变化时，跳过赋值
    if (
      filePaths.length > 0 &&
      filePaths.length === newVal.length &&
      filePaths.every((x) => newVal.some((y) => y === x)) &&
      newVal.every((y) => filePaths.some((x) => x === y))
    ) {
      return;
    }

    if (newVal.length <= 0) {
      fileList.value = [];
      viewFileList.value = [];
      valFileList.value = [];
      return;
    }

    fileList.value = newVal.map((filePath) => {
      return { url: filePath } as UploadUserFile;
    });
    valFileList.value = newVal.map((filePath) => {
      return filePath;
    });
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
    emit("update:modelValue", valFileList.value);
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
function handleRemove(removeFile: UploadFile) {
  const filePath = removeFile.url;
  if (filePath) {
    FileAPI.deleteByPath(filePath).then(() => {
      valFileList.value = valFileList.value.filter((x) => x !== filePath);
      // 删除成功回调
      emit("update:modelValue", valFileList.value);
    });
  }
}

/**
 * 限制用户上传文件的格式和大小
 */
function handleBeforeUpload(file: UploadRawFile) {
  if (file.size > props.maxSize * 1024 * 1024) {
    ElMessage.warning("上传图片不能大于" + props.maxSize + "M");
    return false;
  }
  return true;
}

/**
 * 预览图片
 */
const previewImg: UploadProps["onPreview"] = (uploadFile: UploadFile) => {
  viewFileList.value = fileList.value.map((file) => file.url!);
  initialIndex.value = fileList.value.findIndex((file) => file.url === uploadFile.url);
  viewVisible.value = true;
};

/**
 * 关闭预览
 */
const closePreview = () => {
  viewVisible.value = false;
};
</script>
<style lang="scss" scoped>
.hide {
  :deep(.el-upload--picture-card) {
    display: none;
  }
}

.show {
  :deep(.el-upload--picture-card) {
    display: flex;
  }
}
</style>
