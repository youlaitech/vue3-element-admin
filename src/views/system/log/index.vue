<template>
  <div class="page-container">
    <el-card class="page-search" shadow="never">
      <el-form ref="queryFormRef" :model="params" :inline="true" label-width="auto">
        <el-form-item prop="keywords" label="关键字">
          <el-input
            v-model="params.keywords"
            placeholder="IP/操作人"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>

        <el-form-item prop="createTime" label="操作时间">
          <el-date-picker
            v-model="params.createTime"
            :editable="false"
            type="daterange"
            range-separator="~"
            start-placeholder="开始时间"
            end-placeholder="截止时间"
            value-format="YYYY-MM-DD"
            style="width: 260px"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleQuery">搜索</el-button>
          <el-button @click="handleResetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card ref="tableWrapperRef" class="page-content" shadow="never">
      <div class="page-toolbar">
        <div class="page-toolbar__right" style="margin-left: auto">
          <el-tooltip content="刷新" placement="top">
            <el-button class="page-icon-btn" @click="fetchData">
              <el-icon><Refresh /></el-icon>
            </el-button>
          </el-tooltip>
          <el-tooltip content="全屏" placement="top">
            <el-button class="page-icon-btn" @click="toggleFullscreen">
              <el-icon><FullScreen /></el-icon>
            </el-button>
          </el-tooltip>
        </div>
      </div>
      <el-table v-loading="loading" :data="list" highlight-current-row border>
        <el-table-column label="操作标题" prop="title" min-width="180" show-overflow-tooltip />
        <el-table-column label="状态" prop="status" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === LOG_STATUS_SUCCESS ? 'success' : 'danger'" size="small">
              {{ row.status === LOG_STATUS_SUCCESS ? "成功" : "失败" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="IP地址" prop="ip" width="140" />
        <el-table-column label="请求路径" prop="requestUri" min-width="180" show-overflow-tooltip />
        <el-table-column label="请求方法" prop="requestMethod" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getMethodTagType(row.requestMethod)" size="small" effect="plain">
              {{ row.requestMethod }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="执行时间(ms)" prop="executionTime" width="120" align="center" />
        <el-table-column label="操作人" prop="operatorName" width="120" />
        <el-table-column label="操作时间" prop="createTime" width="180" />
        <el-table-column label="操作" width="80" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleDetail(row as LogItem)">
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination
        v-if="total > 0"
        v-model:total="total"
        v-model:page="params.pageNum"
        v-model:limit="params.pageSize"
        @pagination="fetchData"
      />
    </el-card>

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailVisible" title="日志详情" width="720px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="操作标题" :span="2">
          {{ detailData.title }}
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag
            :type="detailData.status === LOG_STATUS_SUCCESS ? 'success' : 'danger'"
            size="small"
          >
            {{ detailData.status === LOG_STATUS_SUCCESS ? "成功" : "失败" }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="执行时间">
          {{ detailData.executionTime }}ms
        </el-descriptions-item>
        <el-descriptions-item label="操作人">{{ detailData.operatorName }}</el-descriptions-item>
        <el-descriptions-item label="操作时间">{{ detailData.createTime }}</el-descriptions-item>
        <el-descriptions-item label="IP地址">{{ detailData.ip }}</el-descriptions-item>
        <el-descriptions-item label="请求方法">{{ detailData.requestMethod }}</el-descriptions-item>
        <el-descriptions-item label="请求路径" :span="2">
          {{ detailData.requestUri }}
        </el-descriptions-item>
        <el-descriptions-item label="浏览器">{{ detailData.browser }}</el-descriptions-item>
        <el-descriptions-item label="操作系统">{{ detailData.os }}</el-descriptions-item>
        <el-descriptions-item label="自定义内容" :span="2">
          <div v-if="detailData.content" class="whitespace-pre-wrap">{{ detailData.content }}</div>
          <span v-else class="color-text-placeholder">无</span>
        </el-descriptions-item>
        <el-descriptions-item v-if="detailData.errorMsg" label="错误信息" :span="2">
          <span class="color-danger">{{ detailData.errorMsg }}</span>
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { useFullscreen } from "@vueuse/core";
import { type FormInstance, type TagProps } from "element-plus";
import { FullScreen, Refresh } from "@element-plus/icons-vue";

import LogAPI from "@/api/system/log";
import type { LogItem, LogQueryParams } from "@/api/system/log";
import { usePageTable } from "@/composables";

defineOptions({
  name: "Log",
  inheritAttrs: false,
});

const tableWrapperRef = ref<HTMLElement | null>(null);
const { toggle: toggleFullscreen } = useFullscreen(tableWrapperRef);

const queryFormRef = ref<FormInstance>();

// 日志状态：1=成功，0=失败。
const LOG_STATUS_SUCCESS = 1;

/** 分页表格数据管理 */
const { loading, list, total, params, fetchData, handleQuery, handleResetQuery } = usePageTable<
  LogItem,
  LogQueryParams
>({
  initialParams: {
    pageNum: 1,
    pageSize: 10,
    keywords: "",
    createTime: undefined,
  },
  request: LogAPI.getPage,
  onBeforeReset: () => queryFormRef.value?.resetFields(),
});

const detailVisible = ref(false);
const detailData = ref<Partial<LogItem>>({});

/**
 * 请求方法 → el-tag 类型映射。
 *
 * @param method HTTP 方法（GET/POST/PUT/DELETE/PATCH 等）
 */
function getMethodTagType(method: string): TagProps["type"] {
  const map: Record<string, TagProps["type"]> = {
    GET: undefined,
    POST: "success",
    PUT: "warning",
    DELETE: "danger",
    PATCH: "info",
  };
  return map[method?.toUpperCase()] ?? "info";
}

/**
 * 打开日志详情弹窗。
 *
 * @param row 当前日志行
 */
function handleDetail(row: LogItem): void {
  detailData.value = row;
  detailVisible.value = true;
}

onMounted(() => {
  handleQuery();
});
</script>
