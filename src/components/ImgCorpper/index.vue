<template>
  <el-upload
    v-model:file-list="fileList"
    list-type="picture-card"
    :auto-upload="true"
    :class="fileList.length >= 1 || !props.showUploadBtn ? 'hide' : 'show'"
    :before-upload="handleBeforeUpload"
    :data="props.data"
    :name="props.name"
    :accept="props.accept"
    :limit="1"
  >
    <i-ep-plus />
    {{ title }}
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
    :url-list="[viewFile]"
    @close="closePreview"
  />

  <CorpperDialog
    :visible="isShowCorpper"
    :image="selectPic"
    :isCompress="true"
    :showReset="true"
    :presetMode="presetMode"
    @close="hideCorpper"
  />
</template>

<script setup lang="ts">
import CorpperDialog from "./corpperDialog.vue";

import { UploadRawFile, UploadUserFile, UploadFile, UploadProps } from "element-plus";
const emit = defineEmits(["update:modelValue"]);

const props = defineProps({
  /**
   * 文件路径
   */
  modelValue: {
    type: String,
    default: "",
  },
  title: {
    type: String,
    default: "上传图片",
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
   * 单张图片最大大小
   */
  uploadMaxSize: {
    type: Number,
    default: 2 * 1024 * 1024,
  },
  /**
   * 上传文件类型
   */
  accept: {
    type: String,
    default: "image/*",
  },

  presetMode: {
    type: Object,
    default: "{ width: 200, height: 200 }",
  },
});

const selectPic = ref("");
const isShowCorpper = ref(false);

const viewVisible = ref(false);
const initialIndex = ref(0);

const fileList = ref([] as UploadUserFile[]);
const viewFile = ref(props.modelValue as string);

watch(
  () => props.modelValue,
  (newVal: string) => {
    if (!newVal) {
      fileList.value = [];
      return;
    }

    fileList.value = [{ url: newVal } as UploadUserFile];

    viewFile.value = newVal;
  },
  { immediate: true }
);
/**
 * 删除图片
 */
function handleRemove(removeFile: UploadFile) {
  const filePath = removeFile.url;
  if (filePath) {
    emit("update:modelValue", "");
  }
}

/**
 * 限制用户上传文件的格式和大小
 */
function handleBeforeUpload(file: UploadRawFile) {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => {
    selectPic.value = String(reader.result);
    isShowCorpper.value = true;
  };

  if (file.size > props.uploadMaxSize) {
    ElMessage.warning("上传图片不能大于 " + Math.trunc(props.uploadMaxSize / 1024 / 1024) + "M");
    return false;
  }
  return true;
}

/**
 * 预览图片
 */
const previewImg: UploadProps["onPreview"] = (uploadFile: UploadFile) => {
  viewFile.value = uploadFile.url!;
  initialIndex.value = 0;
  viewVisible.value = true;
};

/**
 * 关闭预览
 */
const closePreview = () => {
  viewVisible.value = false;
};

function hideCorpper(data: any) {
  isShowCorpper.value = false;
  if (data) {
    const {
      result: { dataURL },
      file,
    } = data;
    emit("update:modelValue", dataURL);
  }
}
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
