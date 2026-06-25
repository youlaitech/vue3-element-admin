<template>
  <div class="page-container">
    <el-card class="page-search" shadow="never">
      <el-form ref="queryFormRef" :model="params" :inline="true">
        <el-form-item label="通知标题" prop="title">
          <el-input
            v-model="params.title"
            placeholder="关键字"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleQuery">
            <template #icon>
              <Search />
            </template>
            搜索
          </el-button>
          <el-button @click="handleResetQuery">
            <template #icon>
              <Refresh />
            </template>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="page-content" shadow="never">
      <div class="page-table-wrapper">
        <el-table
          v-loading="loading"
          :data="list"
          class="page-table"
          height="100%"
          highlight-current-row
        >
          <el-table-column type="index" label="序号" width="60" />
          <el-table-column label="通知标题" prop="title" min-width="200" />
          <el-table-column align="center" label="通知类型" width="150">
            <template #default="scope">
              <DictTag v-model="scope.row.type" code="notice_type" />
            </template>
          </el-table-column>
          <el-table-column align="center" label="通知等级" width="100">
            <template #default="scope">
              <DictTag v-model="scope.row.level" code="notice_level" />
            </template>
          </el-table-column>
          <el-table-column
            key="releaseTime"
            align="center"
            label="发布时间"
            prop="publishTime"
            width="150"
          />
          <el-table-column align="center" label="发布人" prop="publisherName" width="150" />
          <el-table-column align="center" label="状态" width="100">
            <template #default="scope">
              <el-tag v-if="scope.row.isRead === NOTICE_READ" type="success">已读</el-tag>
              <el-tag v-else type="info">未读</el-tag>
            </template>
          </el-table-column>
          <el-table-column align="center" fixed="right" label="操作" width="80">
            <template #default="scope">
              <el-button type="primary" size="small" link @click="handleReadNotice(scope.row.id)">
                查看
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <pagination
        v-if="total > 0"
        v-model:total="total"
        v-model:page="params.pageNum"
        v-model:limit="params.pageSize"
        @pagination="fetchData"
      />
    </el-card>

    <el-dialog
      v-model="noticeDialogVisible"
      :title="noticeDetail?.title ?? '通知详情'"
      width="800px"
      custom-class="notice-detail"
    >
      <div v-if="noticeDetail" class="notice-detail__wrapper">
        <div class="notice-detail__meta">
          <span>
            <el-icon><User /></el-icon>
            {{ noticeDetail.publisherName }}
          </span>
          <span class="ml-2">
            <el-icon><Timer /></el-icon>
            {{ noticeDetail.publishTime }}
          </span>
        </div>

        <div class="notice-detail__content">
          <div v-html="noticeDetail.content"></div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { Refresh, Search, Timer, User } from "@element-plus/icons-vue";

import NoticeAPI from "@/api/system/notice";
import type { NoticeDetail, NoticeItem, NoticeQueryParams } from "@/api/system/notice";
import { usePageTable } from "@/composables";

defineOptions({
  name: "MyNotice",
  inheritAttrs: false,
});

/** 通知已读标记（1:已读;0:未读）。 */
const NOTICE_READ = 1;

const queryFormRef = ref();

/** 分页表格数据管理 */
const { loading, list, total, params, fetchData, handleQuery, handleResetQuery } = usePageTable<
  NoticeItem,
  NoticeQueryParams
>({
  initialParams: {
    pageNum: 1,
    pageSize: 10,
  },
  request: NoticeAPI.getMyNoticePage,
  onBeforeReset: () => queryFormRef.value?.resetFields(),
});

const noticeDialogVisible = ref(false);
const noticeDetail = ref<NoticeDetail | null>(null);

/**
 * 查看通知详情。
 *
 * @param id 通知 ID
 */
async function handleReadNotice(id: string): Promise<void> {
  const data = await NoticeAPI.getDetail(id);
  noticeDetail.value = data;
  noticeDialogVisible.value = true;
}

onMounted(() => {
  handleQuery();
});
</script>

<style lang="scss" scoped>
:deep(.el-dialog__header) {
  text-align: center;
}

.notice-detail {
  &__wrapper {
    padding: 0 20px;
  }

  &__meta {
    display: flex;
    align-items: center;
    margin-bottom: 16px;
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }

  &__publisher {
    margin-right: 24px;

    i {
      margin-right: 4px;
    }
  }

  &__content {
    max-height: 60vh;
    padding-top: 16px;
    margin-bottom: 24px;
    overflow-y: auto;
    border-top: 1px solid var(--el-border-color);

    &::-webkit-scrollbar {
      width: 6px;
    }
  }
}
</style>
