<!-- 字典 -->
<template>
  <div class="app-container">
    <div class="search-bar">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item label="关键字" prop="keywords">
          <el-input
            v-model="queryParams.keywords"
            placeholder="字典名称/编码"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="search" @click="handleQuery()">搜索</el-button>
          <el-button icon="refresh" @click="handleResetQuery()">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-card shadow="never">
      <div class="mb-[10px]">
        <el-button type="success" icon="plus" @click="handleAddClick()">新增</el-button>
        <el-button type="danger" :disabled="ids.length === 0" icon="delete" @click="handleDelete()">
          删除
        </el-button>
      </div>

      <el-table
        v-loading="loading"
        highlight-current-row
        :data="tableData"
        border
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="字典名称" prop="name" />
        <el-table-column label="字典编码" prop="dictCode" />
        <el-table-column label="状态" prop="status">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'info'">
              {{ scope.row.status === 1 ? "启用" : "禁用" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" align="center" width="220">
          <template #default="scope">
            <el-button type="primary" link size="small" @click.stop="handleOpenDictData(scope.row)">
              <template #icon>
                <Collection />
              </template>
              字典数据
            </el-button>

            <el-button
              type="primary"
              link
              size="small"
              icon="edit"
              @click.stop="handleEditClick(scope.row.id, scope.row.name)"
            >
              编辑
            </el-button>
            <el-button
              type="danger"
              link
              size="small"
              icon="delete"
              @click.stop="handleDelete(scope.row.id)"
            >
              删除
            </el-button>
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

    <!--字典弹窗-->
    <el-dialog
      v-model="dialog.visible"
      :title="dialog.title"
      width="500px"
      @close="handleCloseDialog"
    >
      <el-form ref="dataFormRef" :model="formData" :rules="computedRules" label-width="100px">
        <el-card shadow="never">
          <el-form-item label="字典名称" prop="name">
            <el-input v-model="formData.name" placeholder="请输入字典名称" />
          </el-form-item>

          <el-form-item label="字典编码" prop="dictCode">
            <el-input v-model="formData.dictCode" placeholder="请输入字典编码" />
          </el-form-item>

          <el-form-item label="状态">
            <el-radio-group v-model="formData.status">
              <el-radio :value="1">启用</el-radio>
              <el-radio :value="0">禁用</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="备注">
            <el-input v-model="formData.remark" type="textarea" placeholder="请输入备注" />
          </el-form-item>
        </el-card>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handleSubmitClick">确 定</el-button>
          <el-button @click="handleCloseDialog">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: "Dict",
  inherititems: false,
});

import DictAPI, { DictPageQuery, DictPageVO, DictForm } from "@/api/system/dict";

import router from "@/router";

const queryFormRef = ref(ElForm);
const dataFormRef = ref(ElForm);

const loading = ref(false);
const ids = ref<number[]>([]);
const total = ref(0);

const queryParams = reactive<DictPageQuery>({
  pageNum: 1,
  pageSize: 10,
});

const tableData = ref<DictPageVO[]>();

const dialog = reactive({
  title: "",
  visible: false,
});

const formData = reactive<DictForm>({});

const computedRules = computed(() => {
  const rules: Partial<Record<string, any>> = {
    name: [{ required: true, message: "请输入字典名称", trigger: "blur" }],
    dictCode: [{ required: true, message: "请输入字典编码", trigger: "blur" }],
  };
  return rules;
});

// 查询
function handleQuery() {
  loading.value = true;
  DictAPI.getPage(queryParams)
    .then((data) => {
      tableData.value = data.list;
      total.value = data.total;
    })
    .finally(() => {
      loading.value = false;
    });
}

// 重置查询
function handleResetQuery() {
  queryFormRef.value.resetFields();
  queryParams.pageNum = 1;
  handleQuery();
}

// 行选择
function handleSelectionChange(selection: any) {
  ids.value = selection.map((item: any) => item.id);
}

// 新增字典
function handleAddClick() {
  dialog.visible = true;
  dialog.title = "新增字典";
}

/**
 * 编辑字典
 *
 * @param id 字典ID
 */
function handleEditClick(id: number, name: string) {
  dialog.visible = true;
  dialog.title = "修改字典";
  DictAPI.getFormData(id).then((data) => {
    Object.assign(formData, data);
  });
}

// 提交字典表单
function handleSubmitClick() {
  dataFormRef.value.validate((isValid: boolean) => {
    if (isValid) {
      loading.value = true;
      const id = formData.id;
      if (id) {
        DictAPI.update(id, formData)
          .then(() => {
            ElMessage.success("修改成功");
            handleCloseDialog();
            handleQuery();
          })
          .finally(() => (loading.value = false));
      } else {
        DictAPI.add(formData)
          .then(() => {
            ElMessage.success("新增成功");
            handleCloseDialog();
            handleQuery();
          })
          .finally(() => (loading.value = false));
      }
    }
  });
}

// 关闭字典弹窗
function handleCloseDialog() {
  dialog.visible = false;

  dataFormRef.value.resetFields();
  dataFormRef.value.clearValidate();

  formData.id = undefined;
}
/**
 * 删除字典
 *
 * @param id 字典ID
 */
function handleDelete(id?: number) {
  const attrGroupIds = [id || ids.value].join(",");
  if (!attrGroupIds) {
    ElMessage.warning("请勾选删除项");
    return;
  }
  ElMessageBox.confirm("确认删除已选中的数据项?", "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(
    () => {
      DictAPI.deleteByIds(attrGroupIds).then(() => {
        ElMessage.success("删除成功");
        handleResetQuery();
      });
    },
    () => {
      ElMessage.info("已取消删除");
    }
  );
}

// 打开字典数据
function handleOpenDictData(row: DictPageVO) {
  router.push({
    path: "/system/dict-data",
    query: { dictCode: row.dictCode, title: "【" + row.name + "】字典数据" },
  });

  /*  router.push({
    name: "DictData",
    params: { dictCode: row.dictCode, title: "【" + row.name + "】字典数据" },
  }); */
}

onMounted(() => {
  handleQuery();
});
</script>
