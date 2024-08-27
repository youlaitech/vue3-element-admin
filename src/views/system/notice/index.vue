<template>
  <div class="app-container">
    <div class="search-container">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item label="通知标题" prop="title">
          <el-input
            v-model="queryParams.title"
            placeholder="通知标题"
            clearable
            @keyup.enter="handleQuery()"
          />
        </el-form-item>
        <el-form-item label="通知内容" prop="content">
          <el-input
            v-model="queryParams.content"
            placeholder="通知内容"
            clearable
            @keyup.enter="handleQuery()"
          />
        </el-form-item>
        <el-form-item label="通知类型" prop="noticeType">
          <el-input
            v-model="queryParams.noticeType"
            placeholder="通知类型"
            clearable
            @keyup.enter="handleQuery()"
          />
        </el-form-item>
        <el-form-item label="发布人" prop="releaseBy">
          <el-input
            v-model="queryParams.releaseBy"
            placeholder="发布人"
            clearable
            @keyup.enter="handleQuery()"
          />
        </el-form-item>
        <el-form-item label="优先级(0-低 1-中 2-高)" prop="priority">
          <el-input
            v-model="queryParams.priority"
            placeholder="优先级(0-低 1-中 2-高)"
            clearable
            @keyup.enter="handleQuery()"
          />
        </el-form-item>
        <el-form-item label="目标类型(0-全体 1-指定)" prop="tarType">
          <el-input
            v-model="queryParams.tarType"
            placeholder="目标类型(0-全体 1-指定)"
            clearable
            @keyup.enter="handleQuery()"
          />
        </el-form-item>
        <el-form-item
          label="发布状态(0-未发布 1已发布 2已撤回)"
          prop="sendStatus"
        >
          <el-input
            v-model="queryParams.sendStatus"
            placeholder="发布状态(0-未发布 1已发布 2已撤回)"
            clearable
            @keyup.enter="handleQuery()"
          />
        </el-form-item>
        <el-form-item label="发布时间" prop="sendTime">
          <el-date-picker
            v-model="queryParams.sendTime"
            type="daterange"
            range-separator="~"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>
        <el-form-item label="撤回时间" prop="recallTime">
          <el-date-picker
            v-model="queryParams.recallTime"
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
          v-hasPerm="['system:notice:add']"
          type="success"
          @click="handleOpenDialog()"
        >
          <i-ep-plus />
          新增
        </el-button>
        <el-button
          v-hasPerm="['system:notice:delete']"
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
          key="title"
          label="通知标题"
          prop="title"
          min-width="100"
        />
        <el-table-column
          key="content"
          label="通知内容"
          prop="content"
          min-width="100"
        />
        <el-table-column
          key="noticeType"
          label="通知类型"
          prop="noticeType"
          min-width="100"
        />
        <el-table-column
          key="releaseBy"
          label="发布人"
          prop="releaseBy"
          min-width="100"
        />
        <el-table-column
          key="priority"
          label="优先级(0-低 1-中 2-高)"
          prop="priority"
          min-width="100"
        />
        <el-table-column
          key="tarType"
          label="目标类型(0-全体 1-指定)"
          prop="tarType"
          min-width="100"
        />
        <el-table-column
          key="sendStatus"
          label="发布状态(0-未发布 1已发布 2已撤回)"
          prop="sendStatus"
          min-width="100"
        />
        <el-table-column
          key="sendTime"
          label="发布时间"
          prop="sendTime"
          min-width="100"
        />
        <el-table-column
          key="recallTime"
          label="撤回时间"
          prop="recallTime"
          min-width="100"
        />
        <el-table-column
          key="createTime"
          label="创建时间"
          prop="createTime"
          min-width="100"
        />
        <el-table-column
          key="updateTime"
          label="更新时间"
          prop="updateTime"
          min-width="100"
        />
        <el-table-column fixed="right" label="操作" width="220">
          <template #default="scope">
            <el-button
              v-hasPerm="['system:notice:edit']"
              type="primary"
              size="small"
              link
              @click="handleOpenDialog(scope.row.id)"
            >
              <i-ep-edit />
              编辑
            </el-button>
            <el-button
              v-hasPerm="['system:notice:delete']"
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

    <!-- 通知公告表单弹窗 -->
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
      >
        <!--        <el-input v-model="queryParams.id" hidden />-->
        <el-form-item label="通知标题" prop="title">
          <el-input
            v-model="formData.title"
            placeholder="通知标题"
            clearable
            @keyup.enter="handleQuery()"
          />
        </el-form-item>
        <el-form-item label="通知内容" prop="content">
          <el-input
            v-model="formData.content"
            placeholder="通知内容"
            clearable
            @keyup.enter="handleQuery()"
          />
        </el-form-item>
        <el-form-item label="通知类型" prop="noticeType">
          <el-input
            v-model="formData.noticeType"
            placeholder="通知类型"
            clearable
            @keyup.enter="handleQuery()"
          />
        </el-form-item>
        <el-form-item label="发布人" prop="releaseBy">
          <el-input
            v-model="formData.releaseBy"
            placeholder="发布人"
            clearable
            @keyup.enter="handleQuery()"
          />
        </el-form-item>
        <el-form-item label="优先级(0-低 1-中 2-高)" prop="priority">
          <el-input
            v-model="formData.priority"
            placeholder="优先级(0-低 1-中 2-高)"
            clearable
            @keyup.enter="handleQuery()"
          />
        </el-form-item>
        <el-form-item label="目标类型(0-全体 1-指定)" prop="tarType">
          <el-input
            v-model="formData.tarType"
            placeholder="目标类型(0-全体 1-指定)"
            clearable
            @keyup.enter="handleQuery()"
          />
        </el-form-item>
        <el-form-item
          label="发布状态(0-未发布 1已发布 2已撤回)"
          prop="sendStatus"
        >
          <el-input
            v-model="formData.sendStatus"
            placeholder="发布状态(0-未发布 1已发布 2已撤回)"
            clearable
            @keyup.enter="handleQuery()"
          />
        </el-form-item>
        <el-form-item label="发布时间" prop="sendTime">
          <el-date-picker
            v-model="formData.sendTime"
            type="datetime"
            placeholder="发布时间"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>
        <el-form-item label="撤回时间" prop="recallTime">
          <el-date-picker
            v-model="formData.recallTime"
            type="datetime"
            placeholder="撤回时间"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>
      </el-form>
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
  name: "Notice",
  inheritAttrs: false,
});

import NoticeAPI, {
  NoticePageVO,
  NoticeForm,
  NoticePageQuery,
} from "@/api/notice";

const queryFormRef = ref(ElForm);
const dataFormRef = ref(ElForm);

const loading = ref(false);
const ids = ref<number[]>([]);
const total = ref(0);

const queryParams = reactive<NoticePageQuery>({
  pageNum: 1,
  pageSize: 10,
});

// 通知公告表格数据
const pageData = ref<NoticePageVO[]>([]);

// 弹窗
const dialog = reactive({
  title: "",
  visible: false,
});

// 通知公告表单数据
const formData = reactive<NoticeForm>({});

// 通知公告表单校验规则
const rules = reactive({
  title: [{ required: true, message: "请输入通知标题", trigger: "blur" }],
  content: [{ required: true, message: "请输入通知内容", trigger: "blur" }],
  releaseBy: [{ required: true, message: "请输入发布人", trigger: "blur" }],
  sendTime: [{ required: true, message: "请输入发布时间", trigger: "blur" }],
  recallTime: [{ required: true, message: "请输入撤回时间", trigger: "blur" }],
});

/** 查询通知公告 */
function handleQuery() {
  loading.value = true;
  NoticeAPI.getPage(queryParams)
    .then((data) => {
      pageData.value = data.list;
      total.value = data.total;
    })
    .finally(() => {
      loading.value = false;
    });
}

/** 重置通知公告查询 */
function handleResetQuery() {
  queryFormRef.value!.resetFields();
  queryParams.pageNum = 1;
  handleQuery();
}

/** 行复选框选中记录选中ID集合 */
function handleSelectionChange(selection: any) {
  ids.value = selection.map((item: any) => item.id);
}

/** 打开通知公告弹窗 */
function handleOpenDialog(id?: number) {
  dialog.visible = true;
  if (id) {
    dialog.title = "修改通知公告";
    NoticeAPI.getFormData(id).then((data) => {
      Object.assign(formData, data);
    });
  } else {
    dialog.title = "新增通知公告";
  }
}

/** 提交通知公告表单 */
function handleSubmit() {
  dataFormRef.value.validate((valid: any) => {
    if (valid) {
      loading.value = true;
      const id = formData.id;
      if (id) {
        NoticeAPI.update(id, formData)
          .then(() => {
            ElMessage.success("修改成功");
            handleCloseDialog();
            handleResetQuery();
          })
          .finally(() => (loading.value = false));
      } else {
        NoticeAPI.add(formData)
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

/** 关闭通知公告弹窗 */
function handleCloseDialog() {
  dialog.visible = false;
  dataFormRef.value.resetFields();
  dataFormRef.value.clearValidate();
  formData.id = undefined;
}

/** 删除通知公告 */
function handleDelete(id?: number) {
  const deleteIds = [id || ids.value].join(",");
  if (!deleteIds) {
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
      NoticeAPI.deleteByIds(deleteIds)
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
