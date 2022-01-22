<template>
  <div>
    <el-upload
        ref="uploadRef"
        action=""
        class="avatar-uploader"
        list-type="picture-card"
        :show-file-list="false"
        :before-upload="handleBeforeUpload"
        :on-exceed="handleExceed"
        :limit="1"
        :http-request="uploadImage"
    >
      <img v-if="imgUrl" :src="imgUrl" class="avatar"/>

      <el-icon v-else class="avatar-uploader-icon">
        <Plus/>
      </el-icon>

      <el-icon
          v-if="imgUrl"
          class="remove-icon"
          @click.stop="handleRemove(imgUrl)"
      >
        <Close/>
      </el-icon>

    </el-upload>
  </div>
</template>

<script setup lang="ts">
import {computed, ref} from "vue";
import {Plus, Close} from '@element-plus/icons-vue'
import {ElMessage, ElUpload} from "element-plus"
import {uploadFile, deleteFile} from "@/api/system/file";
import {UploadFile} from "element-plus/es/components/upload/src/upload.type";

const uploadRef = ref(ElUpload)
const emit = defineEmits(['update:modelValue']);

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
})

const imgUrl = computed<string | null>({
  get() {
    return props.modelValue
  },
  set(val) {
    // imgUrl改变时触发修改父组件绑定的v-model的值
    emit('update:modelValue', val)
  }
})


/**
 * 自定义图片上传
 *
 * @param params
 */
function uploadImage({file}: any) {
  uploadFile(file).then(response => {
     imgUrl.value = response.data
  })
}

/**
 * 后选择文件覆盖前面的文件
 *
 * Set limit and on-exceed to automatically replace the previous file when select a new file.
 *
 * @param files
 */
function handleExceed(files: UploadFile[]) {
  uploadRef.value.clearFiles()
  uploadRef.value.handleStart(files[0])
  uploadFile(files[0]).then(response => {
    imgUrl.value = response.data
  })
}

function handleRemove(file: string) {
  deleteFile(file)
  imgUrl.value = null
}

function handleBeforeUpload(file: any) {
  const isJPG = file.type === 'image/jpeg'
  const isLt2M = file.size / 1024 / 1024 < 2
  /* if (!isJPG) {
     ElMessage.warning("此文件非图片文件")
     return false
   }*/

  if (!isLt2M) {
    ElMessage.warning("上传图片不能大于2M")
  }
  return true
}
</script>

<style lang="scss">
.avatar-uploader {
  .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;

    &:hover {
      border-color: #409EFF;
    }
  }
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  text-align: center;
}

.avatar {
  width: 148px;
  height: 148px;
  display: block;
}

.remove-icon {
  font-size: 12px;
  color: #ff4d51 !important;
  margin-top: 0px !important;
  position: absolute;
  right: 0;
  top: 0;
  color: #409eff;
}
</style>
