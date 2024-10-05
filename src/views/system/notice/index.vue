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
        <el-form-item label="发布状态" prop="publishStatus">
          <el-select
            v-model="queryParams.publishStatus"
            class="!w-[100px]"
            clearable
            placeholder="全部"
          >
            <el-option :value="0" label="未发布" />
            <el-option :value="1" label="已发布" />
            <el-option :value="-1" label="已撤回" />
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
          v-hasPerm="['sys:notice:add']"
          type="success"
          @click="handleOpenDialog()"
        >
          <i-ep-plus />
          新增通知
        </el-button>
        <el-button
          v-hasPerm="['sys:notice:delete']"
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
        <el-table-column align="center" label="通知类型" min-width="150">
          <template #default="scope">
            <DictLabel :dictCode="'notice_type'" :value="scope.row.type" />
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          label="发布人"
          prop="publisherName"
          min-width="100"
        />
        <el-table-column align="center" label="通知等级" min-width="100">
          <template #default="scope">
            <DictLabel :dictCode="'notice_level'" :value="scope.row.level" />
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          label="通告目标类型"
          prop="targetType"
          min-width="100"
        >
          <template #default="scope">
            <el-tag v-if="scope.row.targetType == 1" type="warning">
              全体
            </el-tag>
            <el-tag v-if="scope.row.targetType == 2" type="success">
              指定
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="发布状态" min-width="100">
          <template #default="scope">
            <el-tag v-if="scope.row.publishStatus == 0" type="info">
              未发布
            </el-tag>
            <el-tag v-if="scope.row.publishStatus == 1" type="success">
              已发布
            </el-tag>
            <el-tag v-if="scope.row.publishStatus == -1" type="warning">
              已撤回
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="操作时间" min-width="220">
          <template #default="scope">
            <div class="flex-x-start">
              <span>创建时间：</span>
              <span>{{ scope.row.createTime || "-" }}</span>
            </div>

            <div v-if="scope.row.publishStatus === 1" class="flex-x-start">
              <span>发布时间：</span>
              <span>{{ scope.row.publishTime || "-" }}</span>
            </div>
            <div
              v-else-if="scope.row.publishStatus === -1"
              class="flex-x-start"
            >
              <span>撤回时间：</span>
              <span>{{ scope.row.revokeTime || "-" }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column align="center" fixed="right" label="操作" width="220">
          <template #default="scope">
            <el-button
              type="primary"
              size="small"
              @click="openNoticeDetailDialog(scope.row.id)"
              link
            >
              查看
            </el-button>
            <el-button
              v-if="scope.row.publishStatus != 1"
              v-hasPerm="['sys:notice:publish']"
              type="primary"
              size="small"
              link
              @click="handlePublishNotice(scope.row.id)"
            >
              发布
            </el-button>
            <el-button
              v-if="scope.row.publishStatus == 1"
              v-hasPerm="['sys:notice:revoke']"
              type="primary"
              size="small"
              link
              @click="revokeNotice(scope.row.id)"
            >
              撤回
            </el-button>
            <el-button
              v-if="scope.row.publishStatus != 1"
              v-hasPerm="['sys:notice:edit']"
              type="primary"
              size="small"
              link
              @click="handleOpenDialog(scope.row.id)"
            >
              编辑
            </el-button>
            <el-button
              v-if="scope.row.publishStatus != 1"
              v-hasPerm="['sys:notice:delete']"
              type="danger"
              size="small"
              link
              @click="handleDelete(scope.row.id)"
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
          <WangEditor
            v-model="formData.content"
            style="min-height: 480px; max-height: 500px"
          />
        </el-form-item>
        <el-form-item label="通知类型" prop="type">
          <dictionary
            type="button"
            v-model="formData.type"
            code="notice_type"
          />
        </el-form-item>
        <el-form-item label="优先级" prop="level">
          <el-radio-group v-model="formData.level">
            <el-radio value="L">低</el-radio>
            <el-radio value="M">中</el-radio>
            <el-radio value="H">高</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="目标类型" prop="targetType">
          <el-radio-group v-model="formData.targetType">
            <el-radio :value="1">全体</el-radio>
            <el-radio :value="2">指定</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item
          label="指定用户"
          prop="targetUserIds"
          v-if="formData.targetType == 2"
        >
          <el-select
            v-model="formData.targetUserIds"
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
    <!-- 通知公告详情 -->
    <NoticeDetail ref="noticeDetailRef" />
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
import UserAPI from "@/api/user";

const queryFormRef = ref(ElForm);
const dataFormRef = ref(ElForm);
const noticeDetailRef = ref();

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
  level: "L", // 默认优先级为低
  targetType: 1, // 默认目标类型为全体
});

// 通知公告表单校验规则
const rules = reactive({
  title: [{ required: true, message: "请输入通知标题", trigger: "blur" }],
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
  type: [{ required: true, message: "请选择通知类型", trigger: "change" }],
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
  UserAPI.getOptions().then((data) => {
    userOptions.value = data;
  });

  dialog.visible = true;
  if (id) {
    dialog.title = "修改公告";
    NoticeAPI.getFormData(id).then((data) => {
      Object.assign(formData, data);
    });
  } else {
    Object.assign(formData, { level: 0, targetType: 0 });
    dialog.title = "新增公告";
  }
}

function handlePublishNotice(id: number) {
  NoticeAPI.publish(id).then(() => {
    ElMessage.success("发布成功");
    handleQuery();
  });
}

function revokeNotice(id: number) {
  NoticeAPI.revoke(id).then(() => {
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

/** 打开通知公告详情弹窗 */
function openNoticeDetailDialog(id: number) {
  noticeDetailRef.value.openNotice(id);
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
