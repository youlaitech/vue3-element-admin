<!-- 图片上传组件 -->
<template>
  <div>
    <el-upload
      v-model:file-list="fileList"
      list-type="picture-card"
      :before-upload="handleBeforeUpload"
      :http-request="handleUpload"
      :data="props.additionalParams"
      :name="props.fileParamName"
      :on-success="handleSuccess"
      :on-error="handleError"
      :on-exceed="handleExceed"
      :accept="props.accept"
      :limit="props.limit"
    >
      <el-icon><Plus /></el-icon>
      <template #file="{ file }">
        <div style="width: 100%">
          <image class="el-upload-list__item-thumbnail" :src="file.url" />
          <span class="el-upload-list__item-actions">
            <!-- 预览 -->
            <span class="el-upload-list__item-preview" @click="handlePreviewImage(file.url!)">
              <el-icon><zoom-in /></el-icon>
            </span>
            <!-- 删除 -->
            <span class="el-upload-list__item-delete" @click="handleRemove(file.url!)">
              <el-icon><Delete /></el-icon>
            </span>
          </span>
        </div>
      </template>
    </el-upload>

    <el-image-viewer
      v-if="previewVisible"
      :zoom-rate="1.2"
      :previewImageIndex="previewImageIndex"
      :url-list="modelValue"
      @close="handlePreviewClose"
    />
  </div>
</template>
<script setup lang="ts">
import { UploadRawFile, UploadRequestOptions, UploadUserFile } from "element-plus";
import FileAPI, { FileInfo } from "@/api/file";

const emit = defineEmits(["update:modelValue"]);

const props = defineProps({
  /**
   * 请求携带的额外参数
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
    default: 10,
  },
  /**
   *
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
    default: "image/*", //  默认支持所有图片格式 ，如果需要指定格式，格式如下：'.png,.jpg,.jpeg,.gif,.bmp'
  },
});

const previewVisible = ref(false); // 是否显示预览
const previewImageIndex = ref(0); // 预览图片的索引

const modelValue = defineModel("modelValue", {
  type: [Array] as PropType<string[]>,
  required: true,
  default: () => [],
});

const fileList = ref<UploadUserFile[]>([]);

// modelValue 监听转换所需的 fileList
watch(
  modelValue,
  (value) => {
    console.log("modelValue 发生变化:", value);
    fileList.value = value.map((url) => {
      return {
        url,
      } as UploadUserFile;
    });
  },
  {
    immediate: true,
  }
);

/**
 * 删除图片
 */
function handleRemove(imageUrl: string) {
  FileAPI.delete(imageUrl).then(() => {
    modelValue.value = modelValue.value.filter((url) => url !== imageUrl);
  });
}

/**
 * 上传文件超出限制
 */
function handleExceed(files: File[], uploadFiles: UploadUserFile[]) {
  ElMessage.warning("最多只能上传" + props.limit + "张图片");
}

/**
 * 限制用户上传文件的格式和大小
 */
function handleBeforeUpload(file: UploadRawFile) {
  // 校验文件类型：虽然 accept 属性限制了用户在文件选择器中可选的文件类型，但仍需在上传时再次校验文件实际类型，确保符合 accept 的规则
  const acceptTypes = props.accept.split(",").map((type) => type.trim());

  // 检查文件格式是否符合 accept
  const isValidType = acceptTypes.some((type) => {
    if (type === "image/*") {
      // 如果是 image/*，检查 MIME 类型是否以 "image/" 开头
      return file.type.startsWith("image/");
    } else if (type.startsWith(".")) {
      // 如果是扩展名 (.png, .jpg)，检查文件名是否以指定扩展名结尾
      return file.name.toLowerCase().endsWith(type);
    } else {
      // 如果是具体的 MIME 类型 (image/png, image/jpeg)，检查是否完全匹配
      return file.type === type;
    }
  });

  if (!isValidType) {
    ElMessage.warning(`上传文件的格式不正确，仅支持：${props.accept}`);
    return false;
  }

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
    const file = options.file;

    const formData = new FormData();
    formData.append(props.fileParamName, file);

    // 处理附加参数
    Object.keys(props.additionalParams).forEach((key) => {
      formData.append(key, props.additionalParams[key]);
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
 * 上传成功回调
 *
 * @param fileInfo 上传成功后的文件信息
 */
const handleSuccess = (fileInfo: FileInfo) => {
  ElMessage.success("上传成功");
  modelValue.value = [...modelValue.value, fileInfo.url];
};

/**
 * 上传失败回调
 */
const handleError = (error: any) => {
  console.log("handleError");
  ElMessage.error("上传失败: " + error.message);
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
