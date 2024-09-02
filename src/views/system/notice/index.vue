<template>
  <div class="app-container">
    <div class="search-container">
      <el-form
        ref="queryFormRef"
        :model="queryParams"
        :inline="true"
        label-suffix=":"
      >
        <el-form-item label="标题" prop="title">
          <el-input
            v-model="queryParams.title"
            placeholder="标题"
            clearable
            @keyup.enter="handleQuery()"
          />
        </el-form-item>
        <el-form-item label="发布状态" prop="releaseStatus">
          <el-select
            v-model="queryParams.releaseStatus"
            class="!w-[100px]"
            clearable
            placeholder="全部"
          >
            <el-option :value="0" label="未发布" />
            <el-option :value="1" label="已发布" />
            <el-option :value="2" label="已撤回" />
          </el-select>
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
          新增通知
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
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column
          align="center"
          key="title"
          label="通知标题"
          prop="title"
          min-width="150"
        />
        <el-table-column
          align="center"
          key="noticeType"
          label="通知类型"
          prop="noticeTypeLabel"
          min-width="150"
        />
        <el-table-column
          align="center"
          key="releaseBy"
          label="发布人"
          prop="releaseBy"
          min-width="100"
        />
        <el-table-column
          align="center"
          key="priority"
          label="优先级"
          prop="priority"
          min-width="100"
        >
          <template #default="scope">
            <el-tag v-if="scope.row.priority == 0" type="danger">低</el-tag>
            <el-tag v-if="scope.row.priority == 1" type="success">中</el-tag>
            <el-tag v-if="scope.row.priority == 2" type="warning">高</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          key="tarType"
          label="通告对象"
          prop="tarType"
          min-width="100"
        >
          <template #default="scope">
            <el-tag v-if="scope.row.tarType == 0" type="warning">全体</el-tag>
            <el-tag v-if="scope.row.tarType == 1" type="success">指定</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          key="releaseStatus"
          label="发布状态"
          prop="releaseStatus"
          min-width="100"
        >
          <template #default="scope">
            <el-tag v-if="scope.row.releaseStatus == 0" type="warning">
              未发布
            </el-tag>
            <el-tag v-if="scope.row.releaseStatus == 1" type="success">
              已发布
            </el-tag>
            <el-tag v-if="scope.row.releaseStatus == 2" type="primary">
              已撤回
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          key="releaseTime"
          label="发布时间"
          prop="releaseTime"
          min-width="100"
        />
        <el-table-column
          align="center"
          key="recallTime"
          label="撤回时间"
          prop="recallTime"
          min-width="100"
        />
        <el-table-column align="center" fixed="right" label="操作" width="220">
          <template #default="scope">
            <el-button
              v-if="scope.row.releaseStatus != 1"
              v-hasPerm="['system:notice:release']"
              type="primary"
              size="small"
              link
              @click="releaseNotice(scope.row.id)"
            >
              <i-ep-edit />
              发布
            </el-button>
            <el-button
              v-if="scope.row.releaseStatus == 1"
              v-hasPerm="['system:notice:recall']"
              type="primary"
              size="small"
              link
              @click="recallNotice(scope.row.id)"
            >
              <i-ep-edit />
              撤回
            </el-button>
            <el-button
              v-if="scope.row.releaseStatus != 1"
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
              v-if="scope.row.releaseStatus != 1"
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
      top="4vh"
      width="1250"
      @close="handleCloseDialog"
    >
      <el-form
        ref="dataFormRef"
        :model="formData"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="通知标题" prop="title">
          <el-input v-model="formData.title" placeholder="通知标题" clearable />
        </el-form-item>
        <el-form-item label="通知内容" prop="content">
          <editor
            v-model="formData.content"
            style="min-height: 480px; max-height: 500px"
          />
        </el-form-item>
        <el-form-item label="通知类型" prop="noticeType">
          <dictionary
            type="button"
            v-model="formData.noticeType"
            code="notice_type"
          />
        </el-form-item>
        <el-form-item label="优先级" prop="priority">
          <el-radio-group v-model="formData.priority">
            <el-radio :value="0">低</el-radio>
            <el-radio :value="1">中</el-radio>
            <el-radio :value="2">高</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="目标类型" prop="tarType">
          <el-radio-group v-model="formData.tarType">
            <el-radio :value="0">全体</el-radio>
            <el-radio :value="1">指定</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item
          label="指定用户"
          prop="tarType"
          v-if="formData.tarType == 1"
        >
          <el-select
            v-model="formData.tarIds"
            multiple
            search
            placeholder="请选择指定用户"
          >
            <el-option
              v-for="item in userOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
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
import Editor from "@/components/WangEditor/index.vue";

import NoticeAPI, {
  NoticePageVO,
  NoticeForm,
  NoticePageQuery,
} from "@/api/notice";
import UserAPI from "@/api/user";

const queryFormRef = ref(ElForm);
const dataFormRef = ref(ElForm);

const loading = ref(false);
const ids = ref<number[]>([]);
const total = ref(0);

const queryParams = reactive<NoticePageQuery>({
  pageNum: 1,
  pageSize: 10,
});

const userOptions = ref<OptionType[]>([]);
// 通知公告表格数据
const pageData = ref<NoticePageVO[]>([]);

// 弹窗
const dialog = reactive({
  title: "",
  visible: false,
});

// 通知公告表单数据
const formData = reactive<NoticeForm>({
  priority: 0, // 默认优先级为低
  tarType: 0, // 默认目标类型为全体
});

// 通知公告表单校验规则
const rules = reactive({
  title: [{ required: true, message: "请输入通知标题", trigger: "blur" }],
  // content: [{ required: true, message: "请输入通知内容", trigger: "blur" }],
  // 写一个content的校验规则，去掉html标签如果为空则提示
  content: [
    {
      required: true,
      message: "请输入通知内容",
      trigger: "blur",
      validator: (rule: any, value: string, callback: any) => {
        if (!value.replace(/<[^>]+>/g, "").trim()) {
          callback(new Error("请输入通知内容"));
        } else {
          callback();
        }
      },
    },
  ],
  noticeType: [
    { required: true, message: "请选择通知类型", trigger: "change" },
  ],
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
  getUserOptions();
  dialog.visible = true;
  if (id) {
    dialog.title = "修改通知公告";
    NoticeAPI.getFormData(id).then((data) => {
      Object.assign(formData, data);
    });
  } else {
    Object.assign(formData, { priority: 0, tarType: 0 });
    dialog.title = "新增通知公告";
  }
}

function releaseNotice(id: number) {
  NoticeAPI.releaseNotice(id).then((res) => {
    ElMessage.success("发布成功");
    handleQuery();
  });
}

function recallNotice(id: number) {
  NoticeAPI.recallNotice(id).then((res) => {
    ElMessage.success("撤回成功");
    handleQuery();
  });
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

function getUserOptions() {
  if (userOptions.value.length == 0) {
    UserAPI.getOptions().then((res) => {
      userOptions.value = res;
    });
  }
}

onMounted(() => {
  handleQuery();
});
</script>
<style>
.editor-wrapper {
  border: 1px solid #dcdfe6;
}
</style>
