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
        <img class="el-upload-list__item-thumbnail" :src="file.url" />
        <span class="el-upload-list__item-actions">
          <!-- 预览 -->
          <span @click="handlePreviewImage(file.url!)">
            <el-icon><zoom-in /></el-icon>
          </span>
          <!-- 删除 -->
          <span @click="handleRemove(file.url!)">
            <el-icon><Delete /></el-icon>
          </span>
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
import { UploadRawFile, UploadRequestOptions, UploadUserFile } from "element-plus";
import FileAPI from "@/api/file";
import type { FileInfo } from "@/api/file";

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

const fileList = ref<UploadUserFile[]>([]);

/**
 * 删除图片
 */
function handleRemove(imageUrl: string) {
  FileAPI.delete(imageUrl).then(() => {
    const index = modelValue.value.indexOf(imageUrl);
    if (index !== -1) {
      // 直接修改数组避免触发整体更新
      modelValue.value.splice(index, 1);
      fileList.value.splice(index, 1); // 同步更新 fileList
    }
  });
}

/**
 * 上传前校验
 */
function handleBeforeUpload(file: UploadRawFile) {
  /**
   * accept 支持 image/*、.png、image/png 三种写法，浏览器只按它过滤，还需按同样规则复核实际文件
   */
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

    FileAPI.upload(formData).then(
      (data) => {
        resolve(data);
      },
      (error) => {
        reject(error);
      }
    );
  });
}

/**
 * 上传文件超出限制
 */
function handleExceed() {
  ElMessage.warning("最多只能上传 " + props.limit + " 张图片");
}

/**
 * 上传成功回调
 */
const handleSuccess = (fileInfo: FileInfo, uploadFile: UploadUserFile) => {
  ElMessage.success("上传成功");
  const index = fileList.value.findIndex((file) => file.uid === uploadFile.uid);
  if (index !== -1) {
    fileList.value[index].url = fileInfo.url;
    fileList.value[index].status = "success";
    modelValue.value[index] = fileInfo.url;
  }
};

/**
 * 上传失败回调
 */
const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

/**
 * 上传失败时提示错误
 */
const handleError = (error: unknown) => {
  ElMessage.error("上传失败: " + getErrorMessage(error));
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

onMounted(() => {
  fileList.value = modelValue.value.map((url) => ({ url }) as UploadUserFile);
});

watch(
  () => modelValue.value,
  (newVal) => {
    fileList.value = newVal.map((url) => ({ url }) as UploadUserFile);
  }
);
</script>
