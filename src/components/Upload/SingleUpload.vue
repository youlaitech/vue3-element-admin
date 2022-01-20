<template>
  <div >
    <el-upload
        action=""
        class="avatar-uploader"
        list-type="picture-card"
        :show-file-list="false"
        :before-upload="handleBeforeUpload"
        :on-exceed="handleExceed"
        :on-remove="handleRemove"
        :limit="1"
        :http-request="uploadImage"
    >
      <img v-if="imgURL" :src="imgURL" class="avatar"/>

      <el-icon v-else class="avatar-uploader-icon">
        <Plus/>
      </el-icon>

      <el-icon
          v-if="imgURL"
          class="remove-icon"
          @click.stop="handleRemove(imgURL)"
      >
        <Close/>
      </el-icon>

    </el-upload>
  </div>
</template>

<script setup lang="ts">
import {computed, reactive} from "vue";
import {Plus, Close} from '@element-plus/icons-vue'
import {ElMessage} from "element-plus"
import {uploadFile, deleteFile} from "@/api/system/file";

const emit = defineEmits(['update:modelValue']);

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  maxCount: {
    type: Number,
    default: 1
  }
})

const state = reactive({
  previewImgUrl: '',
  previewDialogVisible: false,
})

const imgURL = computed<string>({
  get() {
    return props.modelValue
  },
  set(val) {
    emit('update:modelValue', val)
  }
})

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

/**
 * 自定义图片上传
 *
 * @param params
 */
function uploadImage(params: any) {
  const file = params.file
  uploadFile(file).then(response => {
    const imgURL = response.data
    emit('update:modelValue', imgURL)
  })
}

function handleExceed(file: any) {
  ElMessage.warning('最多只能上传' + props.maxCount)
}

function handleRemove(imgURL: string) {
  deleteFile(imgURL)
  emit('update:modelValue', '')
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
