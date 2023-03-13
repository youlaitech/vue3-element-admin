<!--字典类型-->
<script lang="ts">
export default {
  name: 'dictType'
};
</script>

<script setup lang="ts">
import {
  getDictTypePage,
  getDictTypeForm,
  addDictType,
  updateDictType,
  deleteDictTypes
} from '@/api/dict';

import DictData from '@/views/system/dict/DictData.vue';

import { DictTypePageVO, DictTypeQuery, DictTypeForm } from '@/api/dict/types';

const queryFormRef = ref(ElForm);
const dataFormRef = ref(ElForm);

const loading = ref(false);
const ids = ref<number[]>([]);
const total = ref(0);

const queryParams = reactive<DictTypeQuery>({
  pageNum: 1,
  pageSize: 10
});

const dictTypeList = ref<DictTypePageVO[]>();

const dialog = reactive<DialogOption>({
  visible: false
});

const formData = reactive<DictTypeForm>({
  status: 1
});

const rules = reactive({
  name: [{ required: true, message: '请输入字典类型名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入字典类型编码', trigger: 'blur' }]
});

/**
 * 查询
 */
function handleQuery() {
  loading.value = true;
  getDictTypePage(queryParams)
    .then(({ data }) => {
      dictTypeList.value = data.list;
      total.value = data.total;
    })
    .finally(() => {
      loading.value = false;
    });
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
 */
function handleSelectionChange(selection: any) {
  ids.value = selection.map((item: any) => item.id);
}

/**
 * 打开字典类型表单弹窗
 *
 * @param dicTypeId 字典类型ID
 */
function openDialog(dicTypeId?: number) {
  dialog.visible = true;
  if (dicTypeId) {
    dialog.title = '修改字典类型';
    getDictTypeForm(dicTypeId).then(({ data }) => {
      Object.assign(formData, data);
    });
  } else {
    dialog.title = '新增字典类型';
  }
}

/**
 * 字典类型表单提交
 */
function handleSubmit() {
  loading.value = false;
  dataFormRef.value.validate((isValid: boolean) => {
    if (isValid) {
      const dictTypeId = formData.id;
      if (dictTypeId) {
        updateDictType(dictTypeId, formData)
          .then(() => {
            ElMessage.success('修改成功');
            closeDialog();
            handleQuery();
          })
          .finally(() => (loading.value = false));
      } else {
        addDictType(formData)
          .then(() => {
            ElMessage.success('新增成功');
            closeDialog();
            handleQuery();
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
}

/**
 * 删除字典类型
 */
function handleDelete(dictTypeId?: number) {
  const dictTypeIds = [dictTypeId || ids.value].join(',');
  if (!dictTypeIds) {
    ElMessage.warning('请勾选删除项');
    return;
  }

  ElMessageBox.confirm('确认删除已选中的数据项?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    deleteDictTypes(dictTypeIds).then(() => {
      ElMessage.success('删除成功');
      resetQuery();
    });
  });
}

const dictDataDialog = reactive<DialogOption>({
  visible: false
});

// 当前选中的字典类型
const selectedDictType = reactive({ typeCode: '', typeName: '' });

/**
 * 打开字典弹窗
 */
function openDictDialog(row: DictTypePageVO) {
  dictDataDialog.visible = true;
  dictDataDialog.title = '【' + row.name + '】字典数据';

  selectedDictType.typeCode = row.code;
  selectedDictType.typeName = row.name;
}

/**
 * 关闭字典弹窗
 */
function closeDictDialog() {
  dictDataDialog.visible = false;
}

onMounted(() => {
  handleQuery();
});
</script>

<template>
  <div class="app-container">
    <div class="search">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item label="关键字" prop="name">
          <el-input
            v-model="queryParams.name"
            placeholder="字典类型名称/编码"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery()"
            ><i-ep-search />搜索</el-button
          >
          <el-button @click="resetQuery()"><i-ep-refresh />重置</el-button>
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
      <el-table
        highlight-current-row
        :data="dictTypeList"
        v-loading="loading"
        @selection-change="handleSelectionChange"
        border
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="字典类型名称" prop="name" width="200" />
        <el-table-column label="字典类型编码" prop="code" width="200" />
        <el-table-column label="状态" align="center" width="100">
          <template #default="scope">
            <el-tag v-if="scope.row.status === 1" type="success">启用</el-tag>
            <el-tag v-else type="info">禁用</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="备注" prop="remark" align="center" />
        <el-table-column fixed="right" label="操作" align="center" width="220">
          <template #default="scope">
            <el-button
              type="primary"
              link
              size="small"
              @click.stop="openDictDialog(scope.row)"
              ><i-ep-Collection />字典数据</el-button
            >
            <el-button
              type="primary"
              link
              size="small"
              @click.stop="openDialog(scope.row.id)"
              ><i-ep-edit />编辑</el-button
            >
            <el-button
              type="primary"
              link
              size="small"
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
        label-width="80px"
      >
        <el-form-item label="字典名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入字典名称" />
        </el-form-item>
        <el-form-item label="字典编码" prop="code">
          <el-input v-model="formData.code" placeholder="请输入字典编码" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio :label="1">正常</el-radio>
            <el-radio :label="0">停用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="formData.remark"
            type="textarea"
            placeholder="字典类型备注"
            :autosize="{ minRows: 2, maxRows: 4 }"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handleSubmit">确 定</el-button>
          <el-button @click="closeDialog">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!--字典数据弹窗-->
    <el-dialog
      :title="dictDataDialog.title"
      v-model="dictDataDialog.visible"
      width="1000px"
      @close="closeDictDialog"
    >
      <dict-data
        v-model:typeCode="selectedDictType.typeCode"
        v-model:typeName="selectedDictType.typeName"
      />
    </el-dialog>
  </div>
</template>
