<template>
  <div class="app-container">
    <div class="search-container">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item label="通知标题" prop="title">
          <el-input
            v-model="queryParams.title"
            placeholder="关键字"
            clearable
            @keyup.enter="handleQuery()"
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
      <el-table
        ref="dataTableRef"
        v-loading="loading"
        :data="pageData"
        highlight-current-row
      >
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
            <DictLabel :dictCode="'notice_level'" :value="scope.row.type" />
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          key="releaseTime"
          label="发布时间"
          prop="publishTime"
          min-width="100"
        />

        <el-table-column
          align="center"
          label="发布人"
          prop="publisherName"
          min-width="100"
        />
        <el-table-column align="center" label="状态" min-width="100">
          <template #default="scope">
            <el-tag v-if="scope.row.isRead == 1" type="success">已读</el-tag>
            <el-tag v-if="scope.row.isRead == 0" type="warning">未读</el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" fixed="right" label="操作" width="80">
          <template #default="scope">
            <el-button
              type="primary"
              size="small"
              link
              @click="viewNoticeDetail(scope.row.id)"
            >
              查看
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

    <NoticeDetail ref="noticeDetailRef" />
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: "MyNotice",
  inheritAttrs: false,
});

import NoticeAPI, { NoticePageVO, NoticePageQuery } from "@/api/notice";

const queryFormRef = ref(ElForm);
const noticeDetailRef = ref();

const pageData = ref<NoticePageVO[]>([]);

const loading = ref(false);
const total = ref(0);

const queryParams = reactive<NoticePageQuery>({
  pageNum: 1,
  pageSize: 10,
});

/** 查询通知公告 */
function handleQuery() {
  loading.value = true;
  NoticeAPI.getMyNoticePage(queryParams)
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

function viewNoticeDetail(id: string) {
  noticeDetailRef.value.openNotice(id);
}

onMounted(() => {
  handleQuery();
});
</script>
