<template>
  <div class="app-container">
    <div class="search-container">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item label="id" prop="id">
          <el-input
            v-model="queryParams.id"
            placeholder="id"
            clearable
            @keyup.enter="handleQuery()"
          />
        </el-form-item>
        <el-form-item label="公共通知id" prop="noticeId">
          <el-input
            v-model="queryParams.noticeId"
            placeholder="公共通知id"
            clearable
            @keyup.enter="handleQuery()"
          />
        </el-form-item>
        <el-form-item label="用户id" prop="userId">
          <el-input
            v-model="queryParams.userId"
            placeholder="用户id"
            clearable
            @keyup.enter="handleQuery()"
          />
        </el-form-item>
        <el-form-item label="读取状态，0未读，1已读取" prop="readStatus">
          <el-input
            v-model="queryParams.readStatus"
            placeholder="读取状态，0未读，1已读取"
            clearable
            @keyup.enter="handleQuery()"
          />
        </el-form-item>
        <el-form-item label="用户阅读时间" prop="readTiem">
          <el-date-picker
            v-model="queryParams.readTiem"
            type="daterange"
            range-separator="~"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery()">
            <i-ep-search />
            搜索
          </el-button>
          <el-button @click="handleResetQuery()">
            <i-ep-refresh />
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-card shadow="never" class="table-container">
      <template #header>
        <el-button
          v-hasPerm="['system:noticeStatus:add']"
          type="success"
          @click="handleOpenDialog()"
        >
          <i-ep-plus />
          新增
        </el-button>
        <el-button
          v-hasPerm="['system:noticeStatus:delete']"
          type="danger"
          :disabled="ids.length === 0"
          @click="handleDelete()"
        >
          <i-ep-delete />
          删除
        </el-button>
      </template>

      <el-table
        ref="dataTableRef"
        v-loading="loading"
        :data="pageData"
        highlight-current-row
        border
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column key="id" label="id" prop="id" min-width="100" />
        <el-table-column
          key="noticeId"
          label="公共通知id"
          prop="noticeId"
          min-width="100"
        />
        <el-table-column
          key="userId"
          label="用户id"
          prop="userId"
          min-width="100"
        />
        <el-table-column
          key="readStatus"
          label="读取状态，0未读，1已读取"
          prop="readStatus"
          min-width="100"
        />
        <el-table-column
          key="readTiem"
          label="用户阅读时间"
          prop="readTiem"
          min-width="100"
        />
        <el-table-column fixed="right" label="操作" width="220">
          <template #default="scope">
            <el-button
              v-hasPerm="['system:noticeStatus:edit']"
              type="primary"
              size="small"
              link
              @click="handleOpenDialog(scope.row.id)"
            >
              <i-ep-edit />
              编辑
            </el-button>
            <el-button
              v-hasPerm="['system:noticeStatus:delete']"
              type="danger"
              size="small"
              link
              @click="handleDelete(scope.row.id)"
            >
              <i-ep-delete />
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
        @pagination="handleQuery()"
      />
    </el-card>

    <!-- 用户公告状态表单弹窗 -->
    <el-dialog
      v-model="dialog.visible"
      :title="dialog.title"
      width="500px"
      @close="handleCloseDialog"
    >
      <el-form
        ref="dataFormRef"
        :model="formData"
        :rules="rules"
        label-width="100px"
      />
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handleSubmit()">确定</el-button>
          <el-button @click="handleCloseDialog()">取消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: "NoticeStatus",
  inheritAttrs: false,
});

import NoticeStatusAPI, {
  NoticeStatusPageVO,
  NoticeStatusForm,
  NoticeStatusPageQuery,
} from "@/api/notice-status";

const queryFormRef = ref(ElForm);
const dataFormRef = ref(ElForm);

const loading = ref(false);
const ids = ref<number[]>([]);
const total = ref(0);

const queryParams = reactive<NoticeStatusPageQuery>({
  pageNum: 1,
  pageSize: 10,
});

// 用户公告状态表格数据
const pageData = ref<NoticeStatusPageVO[]>([]);

// 弹窗
const dialog = reactive({
  title: "",
  visible: false,
});

// 用户公告状态表单数据
const formData = reactive<NoticeStatusForm>({});

// 用户公告状态表单校验规则
const rules = reactive({});

/** 查询用户公告状态 */
function handleQuery() {
  loading.value = true;
  NoticeStatusAPI.getPage(queryParams)
    .then((data) => {
      pageData.value = data.list;
      total.value = data.total;
    })
    .finally(() => {
      loading.value = false;
    });
}

/** 重置用户公告状态查询 */
function handleResetQuery() {
  queryFormRef.value!.resetFields();
  queryParams.pageNum = 1;
  handleQuery();
}

/** 行复选框选中记录选中ID集合 */
function handleSelectionChange(selection: any) {
  ids.value = selection.map((item: any) => item.id);
}

/** 打开用户公告状态弹窗 */
function handleOpenDialog(id?: number) {
  dialog.visible = true;
  if (id) {
    dialog.title = "修改用户公告状态";
    NoticeStatusAPI.getFormData(id).then((data) => {
      Object.assign(formData, data);
    });
  } else {
    dialog.title = "新增用户公告状态";
  }
}

/** 提交用户公告状态表单 */
function handleSubmit() {
  dataFormRef.value.validate((valid: any) => {
    if (valid) {
      loading.value = true;
      const id = formData.id;
      if (id) {
        NoticeStatusAPI.update(id, formData)
          .then(() => {
            ElMessage.success("修改成功");
            handleCloseDialog();
            handleResetQuery();
          })
          .finally(() => (loading.value = false));
      } else {
        NoticeStatusAPI.add(formData)
          .then(() => {
            ElMessage.success("新增成功");
            handleCloseDialog();
            handleResetQuery();
          })
          .finally(() => (loading.value = false));
      }
    }
  });
}

/** 关闭用户公告状态弹窗 */
function handleCloseDialog() {
  dialog.visible = false;
  dataFormRef.value.resetFields();
  dataFormRef.value.clearValidate();
  formData.id = undefined;
}

/** 删除用户公告状态 */
function handleDelete(id?: number) {
  const ids = [id || ids.value].join(",");
  if (!ids) {
    ElMessage.warning("请勾选删除项");
    return;
  }

  ElMessageBox.confirm("确认删除已选中的数据项?", "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(
    () => {
      loading.value = true;
      NoticeStatusAPI.deleteByIds(ids)
        .then(() => {
          ElMessage.success("删除成功");
          handleResetQuery();
        })
        .finally(() => (loading.value = false));
    },
    () => {
      ElMessage.info("已取消删除");
    }
  );
}

onMounted(() => {
  handleQuery();
});
</script>
