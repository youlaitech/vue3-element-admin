<template>
  <div>
    <el-upload
        class="avatar-uploader"
        action=""
        list-type="picture-card"
        :show-file-list="false"
        :before-upload="handleBeforeUpload"
        :on-exceed="handleExceed"
        :on-remove="handleRemove"
        :limit="1"
        :http-request="uploadImage"
    >
      <img v-if="imgUrl" :src="imgUrl" class="avatar"/>

      <el-icon v-else class="avatar-uploader-icon">
        <Plus/>
      </el-icon>
    </el-upload>
  </div>
</template>

<script setup lang="ts">
import {computed, reactive, toRefs} from "vue";
import {Plus} from '@element-plus/icons-vue'
import {ElMessage} from "element-plus"
import {deleteFile, uploadFile} from "@/api/system/file";
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

const imgUrl = computed({
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
    const imgUrl = response.data
    emit('update:modelValue', imgUrl)
  })
}

function handleExceed(file: any) {
  ElMessage.warning('最多只能上传' + props.maxCount)
}


function handleRemove(file: any, fileList: Array<any>) {
  deleteFile(file.url)
  emit('update:modelValue', fileList)
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
</style>
