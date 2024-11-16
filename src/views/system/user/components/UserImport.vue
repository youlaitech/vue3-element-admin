<template>
  <el-dialog
    v-model="visible"
    :align-center="true"
    title="导入数据"
    width="600px"
    @close="handleClose"
  >
    <el-scrollbar max-height="60vh">
      <el-form
        ref="importFormRef"
        label-width="auto"
        style="padding-right: var(--el-dialog-padding-primary)"
        :model="importFormData"
        :rules="importFormRules"
      >
        <el-form-item label="文件名" prop="files">
          <el-upload
            ref="uploadRef"
            v-model:file-list="importFormData.files"
            class="w-full"
            accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
            :drag="true"
            :limit="1"
            :auto-upload="false"
            :on-exceed="handleFileExceed"
          >
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">
              将文件拖到此处，或
              <em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                格式为*.xlsx / *.xls，文件不超过一个
                <el-link
                  type="primary"
                  icon="download"
                  :underline="false"
                  @click="handleDownloadTemplate"
                >
                  下载模板
                </el-link>
              </div>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>
    </el-scrollbar>
    <template #footer>
      <div style="padding-right: var(--el-dialog-padding-primary)">
        <el-button
          type="primary"
          :disabled="importFormData.files.length === 0"
          @click="handleUpload"
        >
          确 定
        </el-button>
        <el-button @click="handleClose">取 消</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ElMessage, type UploadUserFile } from "element-plus";
import UserAPI from "@/api/system/user";

const emit = defineEmits(["import-success"]);
const visible = defineModel("modelValue", {
  type: Boolean,
  required: true,
  default: false,
});

const importFormRef = ref(null);
const uploadRef = ref(null);

const importFormData = reactive<{
  files: UploadUserFile[];
}>({
  files: [],
});

const importFormRules = {
  files: [{ required: true, message: "文件不能为空", trigger: "blur" }],
};

// 文件超出个数限制
const handleFileExceed = () => {
  ElMessage.warning("只能上传一个文件");
};

// 下载导入模板
const handleDownloadTemplate = () => {
  UserAPI.downloadTemplate().then((response: any) => {
    const fileData = response.data;
    const fileName = decodeURI(response.headers["content-disposition"].split(";")[1].split("=")[1]);
    const fileType =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8";

    const blob = new Blob([fileData], { type: fileType });
    const downloadUrl = window.URL.createObjectURL(blob);

    const downloadLink = document.createElement("a");
    downloadLink.href = downloadUrl;
    downloadLink.download = fileName;

    document.body.appendChild(downloadLink);
    downloadLink.click();

    document.body.removeChild(downloadLink);
    window.URL.revokeObjectURL(downloadUrl);
  });
};

// 上传文件
const handleUpload = async () => {
  if (!importFormData.files.length) {
    ElMessage.warning("请选择文件");
    return;
  }

  try {
    await UserAPI.import(1, importFormData.files[0].raw as File);
    ElMessage.success("上传成功");
    emit("import-success");
    handleClose();
  } catch (error) {
    ElMessage.error("上传失败");
  }
};

// 关闭弹窗
const handleClose = () => {
  importFormData.files.length = 0;
  visible.value = false;
};
</script>
