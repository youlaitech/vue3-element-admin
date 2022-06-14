<script lang="ts">
export default {
  name: 'brand',
};
</script>

<script setup lang="ts">
import { onMounted, reactive, ref, toRefs } from 'vue';
import { ElForm, ElTable, ElMessage, ElMessageBox } from 'element-plus';
import { Search, Plus, Edit, Refresh, Delete } from '@element-plus/icons-vue';
import {
  BrandFormData,
  BrandItem,
  BrandQueryParam,
} from '@/types/api/pms/brand';
import { Dialog } from '@/types/common';
import {
  listBrandPages,
  getBrandFormDetail,
  updateBrand,
  addBrand,
  deleteBrands,
} from '@/api/pms/brand';
import SingleUpload from '@/components/Upload/SingleUpload.vue';

const queryFormRef = ref(ElForm); // 属性名必须和元素的ref属性值一致
const dataFormRef = ref(ElForm); // 属性名必须和元素的ref属性值一致

const state = reactive({
  loading: true,
  // 选中ID数组
  ids: [],
  // 非单个禁用
  single: true,
  // 非多个禁用
  multiple: true,
  queryParams: {
    pageNum: 1,
    pageSize: 10,
  } as BrandQueryParam,
  brandList: [] as BrandItem[],
  total: 0,
  dialog: {} as Dialog,
  formData: { sort: 1 } as BrandFormData,
  rules: {
    name: [
      {
        required: true,
        message: '请输入品牌名称',
        trigger: 'blur',
      },
    ],
  },
});

const {
  loading,
  multiple,
  queryParams,
  brandList,
  total,
  dialog,
  formData,
  rules,
} = toRefs(state);

function handleQuery() {
  state.loading = true;
  listBrandPages(state.queryParams).then(({ data }) => {
    state.brandList = data.list;
    state.total = data.total;
    state.loading = false;
  });
}

function resetQuery() {
  queryFormRef.value.resetFields();
  handleQuery();
}

function handleSelectionChange(selection: any) {
  state.ids = selection.map((item: any) => item.id);
  state.single = selection.length !== 1;
  state.multiple = !selection.length;
}

function handleAdd() {
  state.dialog = {
    title: '添加品牌',
    visible: true,
  };
}

function handleUpdate(row: any) {
  state.dialog = {
    title: '修改品牌',
    visible: true,
  };
  const brandId = row.id || state.ids;
  getBrandFormDetail(brandId).then(({ data }) => {
    state.formData = data;
  });
}

/**
 * 表单提交
 */
function submitForm() {
  dataFormRef.value.validate((isValid: boolean) => {
    if (isValid) {
      if (state.formData.id) {
        updateBrand(state.formData.id, state.formData).then(() => {
          ElMessage.success('修改成功');
          cancel();
          handleQuery();
        });
      } else {
        addBrand(state.formData).then(() => {
          ElMessage.success('新增成功');
          cancel();
          handleQuery();
        });
      }
    }
  });
}

/**
 * 取消
 */
function cancel() {
  state.dialog.visible = false;
  dataFormRef.value.resetFields();
}

/**
 * 删除
 */
function handleDelete(row: any) {
  const ids = [row.id || state.ids].join(',');
  ElMessageBox.confirm('确认删除已选中的数据项?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      deleteBrands(ids).then(() => {
        ElMessage.success('删除成功');
        handleQuery();
      });
    })
    .catch(() => ElMessage.info('已取消删除'));
}

onMounted(() => {
  handleQuery();
});
</script>

<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <el-form ref="queryFormRef" :model="queryParams" :inline="true">
      <el-form-item>
        <el-button type="success" :icon="Plus" @click="handleAdd"
          >新增</el-button
        >
        <el-button
          type="danger"
          :icon="Delete"
          click="handleDelete"
          :disabled="multiple"
          >删除</el-button
        >
      </el-form-item>

      <el-form-item prop="name">
        <el-input v-model="queryParams.name" placeholder="品牌名称" />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" :icon="Search" @click="handleQuery"
          >搜索</el-button
        >
        <el-button :icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 数据表格 -->
    <el-table
      v-loading="loading"
      :data="brandList"
      @selection-change="handleSelectionChange"
      border
    >
      <el-table-column type="selection" min-width="5%" />
      <el-table-column prop="name" label="品牌名称" min-width="10" />
      <el-table-column prop="logoUrl" label="LOGO" min-width="10">
        <template #default="scope">
          <el-popover placement="right" :width="400" trigger="hover">
            <img :src="scope.row.logoUrl" width="400" height="400" />
            <template #reference>
              <img
                :src="scope.row.logoUrl"
                style="max-height: 60px; max-width: 60px"
              />
            </template>
          </el-popover>
        </template>
      </el-table-column>

      <el-table-column prop="sort" label="排序" min-width="10" />

      <el-table-column label="操作" width="150">
        <template #default="scope">
          <el-button
            @click="handleUpdate(scope.row)"
            type="primary"
            :icon="Edit"
            circle
            plain
          />
          <el-button
            type="danger"
            :icon="Delete"
            circle
            plain
            @click="handleDelete(scope.row)"
          />
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页工具条 -->
    <pagination
      v-if="total > 0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="handleQuery"
    />

    <!-- 表单弹窗 -->
    <el-dialog
      :title="dialog.title"
      v-model="dialog.visible"
      top="5vh"
      width="600px"
    >
      <el-form
        ref="dataFormRef"
        :model="formData"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="品牌名称" prop="name">
          <el-input v-model="formData.name" auto-complete="off" />
        </el-form-item>

        <el-form-item label="LOGO" prop="logoUrl">
          <single-upload v-model="formData.logoUrl" />
        </el-form-item>

        <el-form-item label="排序" prop="sort">
          <el-input v-model="formData.sort" />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped></style>
