<!-- 单图上传组件 -->
<template>
  <el-upload
    class="single-upload"
    list-type="picture-card"
    :show-file-list="false"
    :accept="props.accept"
    :before-upload="handleBeforeUpload"
    :http-request="handleUpload"
    :on-success="onSuccess"
    :on-error="onError"
  >
    <template #default>
      <template v-if="modelValue">
        <el-image
          class="single-upload__image"
          :src="modelValue"
          :preview-src-list="[modelValue]"
          @click.stop
        />
        <el-icon class="single-upload__delete-btn" @click.stop="handleDelete">
          <CircleCloseFilled />
        </el-icon>
      </template>
      <template v-else>
        <el-icon>
          <Plus />
        </el-icon>
      </template>
    </template>
  </el-upload>
</template>

<script setup lang="ts">
import { UploadRawFile, UploadRequestOptions } from "element-plus";
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
  /** 最大文件大小（单位：MB） */
  maxFileSize: {
    type: Number,
    default: 10,
  },

  /** 上传图片格式，默认支持所有图片 (image/*)，指定格式示例：'.png,.jpg,.jpeg,.gif,.bmp' */
  accept: {
    type: String,
    default: "image/*",
  },

  /** 自定义样式，用于设置组件的宽度和高度等其他样式 */
  style: {
    type: Object,
    default: () => {
      return {
        width: "150px",
        height: "150px",
      };
    },
  },
});

const modelValue = defineModel<string>({ default: "" });

/**
 * 限制用户上传文件的格式和大小
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
 * 上传图片
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
 * 删除图片
 */
function handleDelete() {
  modelValue.value = "";
}

/**
 * 上传成功回调
 *
 * @param fileInfo 上传成功后的文件信息
 */
const onSuccess = (fileInfo: FileInfo) => {
  ElMessage.success("上传成功");
  modelValue.value = fileInfo.url;
};

/**
 * 上传失败回调
 */
const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

/**
 * 上传失败时提示错误
 */
const onError = (error: unknown) => {
  ElMessage.error("上传失败: " + getErrorMessage(error));
};
</script>

<style scoped lang="scss">
:deep(.el-upload--picture-card) {
  position: relative;
  width: v-bind("props.style.width ?? '150px'");
  height: v-bind("props.style.height ?? '150px'");
}

.single-upload {
  &__image {
    border-radius: 6px;
  }

  &__delete-btn {
    position: absolute;
    top: 1px;
    right: 1px;
    font-size: 16px;
    color: #ff7901;
    cursor: pointer;
    background: var(--el-bg-color);
    border-radius: 100%;

    :hover {
      color: #ff4500;
    }
  }
}
</style>
