<template>
  <div>
    <el-upload
        class="mini-card-uploader"
        :headers="headers"
        :action="uploadAction"
        :multiple="false"
        :show-file-list="false"
        :file-list="fileList"
        :before-upload="handleBeforeUpload"
        :on-success="handleUploadSuccess"
        :on-preview="handlePreview"
        :auto-upload="true"
    >
      <img v-if="fileList[0].url" :src="fileList[0].url" class="mini-card">
      <i v-else class="el-icon-plus mini-card-uploader-icon"></i>
      <i v-if="fileList[0].url" class="el-icon-close mini-card-remove-icon"
         @click.stop="handleRemove(fileList[0].url)"></i>
    </el-upload>

  </div>
</template>
<script setup lang="ts">
import {Local} from "@/utils/storage";
import {deleteFile} from '@/api/system/file'
import {computed, reactive, toRefs} from "vue";

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
  uploadAction: import.meta.env.VITE_APP_BASE_API + '/youlai-admin/api/v1/files',
  headers: {authorization: Local.get('token')},
  fileList: [{url: ''}]
})

const imgUrl = computed({
  get() {
    return props.modelValue
  },
  set(val) {
    state.fileList = [{url: val as string}]
    emit('update:modelValue', val)
  }
})

const {uploadAction, headers, fileList} = toRefs(state)


function handleBeforeUpload(file: any) {
  const isJPG = file.type === 'image/jpeg'
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isJPG) {
  }

  if (!isLt2M) {
  }
  return true
}

function handleUploadSuccess(response: any) {
  state.fileList.pop();
  const fileUrl = response.data
  state.fileList.push({url: fileUrl})
  emit('update:modelValue', fileUrl)
}

function handleRemove(file: any) {
  deleteFile(file.url)
  emit('update:modelValue', '')
}

</script>
<style>
.mini-card-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.mini-card-uploader .el-upload:hover {
  border-color: #409EFF;
}

.mini-card-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 60px;
  height: 50px;
  line-height: 50px;
  text-align: center;
}

.mini-card {
  width: 60px;
  height: 50px;
  display: block;
}

.mini-card-remove-icon {
  position: absolute;
  right: 0;
  top: 0;
  color: #409eff;
}
</style>


