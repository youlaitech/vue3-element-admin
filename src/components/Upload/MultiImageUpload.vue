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
   * 单个文件的最大允许大小
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
  default: () => [],
});

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
 * 上传文件超出限制
 */
function handleExceed() {
  ElMessage.warning("最多只能上传" + props.limit + "张图片");
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

onMounted(() => {
  fileList.value = modelValue.value.map((url) => ({ url }) as UploadUserFile);
});
</script>
<style lang="scss" scoped></style>
