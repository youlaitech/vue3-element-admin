<template>
  <div>
    <el-upload
        class="image-uploader"
        :headers="headers"
        :action="uploadAction"
        :show-file-list="false"
        :on-success="handleUploadSuccess"
        :before-upload="handleBeforeUpload"
        :on-exceed="handleExceed"
        :on-remove="handleRemove"
        :limit="props.maxCount"
        :on-preview="handlePreview"
    >
      <img v-if="imgUrl" :src="imgUrl" class="image"/>
      <el-icon v-else class="image-uploader-icon">
        <plus/>
      </el-icon>
    </el-upload>

    <el-dialog v-model="viewDialogVisible">
      <img width="100%" :src="viewImgUrl">
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import {defineEmits, computed, reactive, toRefs, ref, watch} from "vue";
import {Plus} from '@element-plus/icons-vue'
import {ElMessage} from "element-plus"
import {deleteFile} from "@api/system/file";
import {Local} from "@utils/storage";

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
  uploadAction: '/dev-api/youlai-admin/api/v1/files',
  viewImgUrl: '',
  viewDialogVisible: false,
  headers: {authorization: Local.get('token')}
})

const imgUrl = computed({
  get() {
    return props.modelValue
  },
  set(val) {
    emit('update:modelValue', val)
  }
})

const {uploadAction, viewImgUrl, viewDialogVisible, headers} = toRefs(state)

function handleUploadSuccess(response: any) {
  const fileUrl = response.data
  emit('update:modelValue', fileUrl)
}

function handleBeforeUpload(file: any) {
  const isJPG = file.type === 'image/jpeg'
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isJPG) {
  }

  if (!isLt2M) {
  }
  return true
}

function handleExceed(file: any) {
  ElMessage.warning('最多只能上传' + props.maxCount + '')
}

function handlePreview(file: any) {
  state.viewImgUrl = imgUrl.value as string
  state.viewDialogVisible = true
}

function handleRemove(file: any, fileList: Array<any>) {
  deleteFile(file.url)
  emit('update:modelValue', fileList)
}
</script>

<style lang="scss">
.image-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.image-uploader .el-upload:hover {
  border-color: #409EFF;
}

.image-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 148px;
  height: 148px;
  line-height: 146px;
  text-align: center;
}

.image {
  width: 148px;
  height: 148px;
  display: block;
}
</style>
