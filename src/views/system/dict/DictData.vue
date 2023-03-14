<!-- 字典数据 -->
<script lang="ts">
export default {
  name: 'dictData'
};
</script>

<script setup lang="ts">
import {
  getDictPage,
  getDictFormData,
  addDict,
  updateDict,
  deleteDict
} from '@/api/dict';
import { DictPageVO, DictForm, DictQuery } from '@/api/dict/types';

const props = defineProps({
  typeCode: {
    type: String,
    default: () => {
      return '';
    }
  },
  typeName: {
    type: String,
    default: () => {
      return '';
    }
  }
});

watch(
  () => props.typeCode,
  (newVal: string) => {
    queryParams.typeCode = newVal;
    resetQuery();
  }
);

const queryFormRef = ref(ElForm);
const dataFormRef = ref(ElForm);

const loading = ref(false);
const ids = ref<number[]>([]);
const total = ref(0);

const queryParams = reactive<DictQuery>({
  pageNum: 1,
  pageSize: 10,
  typeCode: props.typeCode
});

const dictList = ref<DictPageVO[]>();

const dialog = reactive<DialogOption>({
  visible: false
});

const formData = reactive<DictForm>({
  status: 1,
  typeCode: props.typeCode,
  sort: 1
});

const rules = reactive({
  name: [{ required: true, message: '请输入字典名称', trigger: 'blur' }],
  value: [{ required: true, message: '请输入字典值', trigger: 'blur' }]
});

/**
 * 查询
 */
function handleQuery() {
  if (queryParams.typeCode) {
    loading.value = true;
    getDictPage(queryParams)
      .then(({ data }) => {
        dictList.value = data.list;
        total.value = data.total;
      })
      .finally(() => (loading.value = false));
  }
}

/**
 * 重置查询
 */
function resetQuery() {
  queryFormRef.value.resetFields();
  queryParams.pageNum = 1;
  handleQuery();
}

/**
 * 行checkbox change事件
 *
 * @param selection
 */
function handleSelectionChange(selection: any) {
  ids.value = selection.map((item: any) => item.id);
}

/**
 * 打开字典表单弹窗
 *
 * @param dictId 字典ID
 */
function openDialog(dictId?: number) {
  dialog.visible = true;
  if (dictId) {
    dialog.title = '修改字典';
    getDictFormData(dictId).then(({ data }) => {
      Object.assign(formData, data);
    });
  } else {
    dialog.title = '新增字典';
  }
}

/**
 * 字典表单提交
 */
function handleSubmit() {
  loading.value = false;
  dataFormRef.value.validate((isValid: boolean) => {
    if (isValid) {
      const dictId = formData.id;
      if (dictId) {
        updateDict(dictId, formData)
          .then(() => {
            ElMessage.success('修改成功');
            closeDialog();
            resetQuery();
          })
          .finally(() => (loading.value = false));
      } else {
        addDict(formData)
          .then(() => {
            ElMessage.success('新增成功');
            closeDialog();
            resetQuery();
          })
          .finally(() => (loading.value = false));
      }
    }
  });
}

/**
 * 关闭弹窗
 */
function closeDialog() {
  dialog.visible = false;
  resetForm();
}

/**
 * 重置表单
 */
function resetForm() {
  dataFormRef.value.resetFields();
  dataFormRef.value.clearValidate();

  formData.id = undefined;
  formData.status = 1;
  formData.sort = 1;
  formData.typeCode = props.typeCode;
}

/**
 * 删除字典
 */
function handleDelete(dictId?: number) {
  const dictIds = [dictId || ids.value].join(',');
  if (!dictIds) {
    ElMessage.warning('请勾选删除项');
    return;
  }

  ElMessageBox.confirm('确认删除已选中的数据项?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    deleteDict(dictIds).then(() => {
      ElMessage.success('删除成功');
      resetQuery();
    });
  });
}

onMounted(() => {
  handleQuery();
});
</script>

<template>
  <div class="app-container">
    <div class="search">
      <!-- 搜索表单 -->
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item label="关键字" prop="name">
          <el-input
            v-model="queryParams.name"
            placeholder="字典名称"
            clearable
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery"
            ><i-ep-search />搜索</el-button
          >
          <el-button @click="resetQuery"> <i-ep-refresh />重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <el-card shadow="never">
      <template #header>
        <el-button type="success" @click="openDialog()"
          ><i-ep-plus />新增</el-button
        >
        <el-button
          type="danger"
          :disabled="ids.length === 0"
          @click="handleDelete()"
          ><i-ep-delete />删除</el-button
        >
      </template>

      <!-- 数据表格 -->
      <el-table
        :data="dictList"
        v-loading="loading"
        border
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="50" />
        <el-table-column label="字典名称" prop="name" />
        <el-table-column label="字典值" prop="value" />
        <el-table-column label="状态" align="center">
          <template #default="scope">
            <el-tag v-if="scope.row.status === 1" type="success">启用</el-tag>
            <el-tag v-else type="info">禁用</el-tag>
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" align="center">
          <template #default="scope">
            <el-button type="primary" link @click="openDialog(scope.row.id)"
              ><i-ep-edit />编辑</el-button
            >
            <el-button
              type="primary"
              link
              @click.stop="handleDelete(scope.row.id)"
              ><i-ep-delete />删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>

      <pagination
        v-if="total > 0"
        v-model:total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="handleQuery"
      />
    </el-card>

    <!-- 表单弹窗 -->
    <el-dialog
      :title="dialog.title"
      v-model="dialog.visible"
      width="500px"
      @close="closeDialog"
    >
      <el-form
        ref="dataFormRef"
        :model="formData"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="字典名称">{{ typeName }}</el-form-item>
        <el-form-item label="字典名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入字典名称" />
        </el-form-item>
        <el-form-item label="字典值" prop="value">
          <el-input v-model="formData.value" placeholder="字典值" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number
            v-model="formData.sort"
            controls-position="right"
            :min="0"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio :label="1">正常</el-radio>
            <el-radio :label="0">停用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="formData.remark" type="textarea"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handleSubmit">确 定</el-button>
          <el-button @click="closeDialog">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>
