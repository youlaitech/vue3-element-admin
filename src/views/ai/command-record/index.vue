<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <div class="search-container">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item prop="keywords" label="关键字">
          <el-input
            v-model="queryParams.keywords"
            placeholder="原始命令/函数名称/用户名"
            clearable
            style="width: 220px"
            @keyup.enter="handleQuery"
          />
        </el-form-item>

        <el-form-item prop="provider" label="AI提供商">
          <el-select
            v-model="queryParams.provider"
            placeholder="请选择"
            clearable
            style="width: 140px"
          >
            <el-option label="通义千问" value="qwen" />
            <el-option label="OpenAI" value="openai" />
            <el-option label="DeepSeek" value="deepseek" />
            <el-option label="Gemini" value="gemini" />
          </el-select>
        </el-form-item>

        <el-form-item prop="model" label="AI模型">
          <el-input
            v-model="queryParams.model"
            placeholder="如 qwen-plus"
            clearable
            style="width: 160px"
            @keyup.enter="handleQuery"
          />
        </el-form-item>

        <el-form-item prop="parseSuccess" label="解析状态">
          <el-select
            v-model="queryParams.parseSuccess"
            placeholder="请选择"
            clearable
            style="width: 140px"
          >
            <el-option label="成功" :value="true" />
            <el-option label="失败" :value="false" />
          </el-select>
        </el-form-item>

        <el-form-item prop="executeStatus" label="执行状态">
          <el-select
            v-model="queryParams.executeStatus"
            placeholder="请选择"
            clearable
            style="width: 140px"
          >
            <el-option label="待执行" value="pending" />
            <el-option label="成功" value="success" />
            <el-option label="失败" value="failed" />
          </el-select>
        </el-form-item>

        <el-form-item prop="isDangerous" label="风险操作">
          <el-select
            v-model="queryParams.isDangerous"
            placeholder="请选择"
            clearable
            style="width: 140px"
          >
            <el-option label="是" :value="true" />
            <el-option label="否" :value="false" />
          </el-select>
        </el-form-item>

        <el-form-item prop="createTime" label="创建时间">
          <el-date-picker
            v-model="queryParams.createTime"
            :editable="false"
            type="daterange"
            range-separator="~"
            start-placeholder="开始时间"
            end-placeholder="截止时间"
            value-format="YYYY-MM-DD"
            style="width: 260px"
          />
        </el-form-item>

        <el-form-item class="search-buttons">
          <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
          <el-button icon="Refresh" @click="handleResetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 数据表格 -->
    <el-card shadow="hover" class="data-table">
      <el-table
        v-loading="loading"
        :data="pageData"
        highlight-current-row
        border
        class="data-table__content"
      >
        <el-table-column label="创建时间" prop="createTime" width="180" />
        <el-table-column label="用户名" prop="username" width="120" />
        <el-table-column
          label="原始命令"
          prop="originalCommand"
          min-width="220"
          show-overflow-tooltip
        />
        <el-table-column
          label="函数名称"
          prop="functionName"
          min-width="160"
          show-overflow-tooltip
        />
        <el-table-column label="AI提供商" prop="provider" width="120" />
        <el-table-column label="AI模型" prop="model" width="160" show-overflow-tooltip />
        <el-table-column label="解析状态" width="110" align="center">
          <template #default="{ row }">
            <el-tag :type="row.parseSuccess ? 'success' : 'danger'" size="small">
              {{ row.parseSuccess ? "成功" : "失败" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="执行状态" width="110" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.executeStatus" :type="statusTagType[row.executeStatus]" size="small">
              {{ statusText[row.executeStatus] }}
            </el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="风险" width="90" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.isDangerous" type="warning" size="small">风险</el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="置信度" prop="confidence" width="100" align="center">
          <template #default="{ row }">
            <span v-if="row.confidence !== undefined && row.confidence !== null">
              {{ (row.confidence * 100).toFixed(0) }}%
            </span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="解析耗时(ms)" prop="parseTime" width="120" align="center" />
        <el-table-column label="执行耗时(ms)" prop="executionTime" width="120" align="center" />
        <el-table-column label="IP地址" prop="ipAddress" width="140" />
        <el-table-column label="操作" width="100" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleViewDetail(row)">
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination
        v-if="total > 0"
        v-model:total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="fetchData"
      />
    </el-card>

    <!-- 详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="AI 命令记录详情" width="880px" append-to-body>
      <el-descriptions v-if="currentRow" :column="2" border>
        <el-descriptions-item label="记录ID">
          {{ currentRow.id }}
        </el-descriptions-item>
        <el-descriptions-item label="用户名">
          {{ currentRow.username }}
        </el-descriptions-item>

        <el-descriptions-item label="AI提供商">
          {{ currentRow.provider || "-" }}
        </el-descriptions-item>
        <el-descriptions-item label="AI模型">
          {{ currentRow.model || "-" }}
        </el-descriptions-item>

        <el-descriptions-item label="解析状态">
          <el-tag :type="currentRow.parseSuccess ? 'success' : 'danger'" size="small">
            {{ currentRow.parseSuccess ? "成功" : "失败" }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="置信度">
          <span v-if="currentRow.confidence !== undefined && currentRow.confidence !== null">
            {{ (currentRow.confidence * 100).toFixed(0) }}%
          </span>
          <span v-else>-</span>
        </el-descriptions-item>

        <el-descriptions-item label="解析耗时">
          {{ formatNumber(currentRow.parseTime) }} ms
        </el-descriptions-item>
        <el-descriptions-item label="Token统计">
          输入 {{ currentRow.inputTokens || 0 }} / 输出 {{ currentRow.outputTokens || 0 }} / 总计
          {{ currentRow.totalTokens || 0 }}
        </el-descriptions-item>

        <el-descriptions-item label="原始命令" :span="2">
          <el-input :model-value="currentRow.originalCommand" type="textarea" :rows="2" readonly />
        </el-descriptions-item>

        <el-descriptions-item v-if="currentRow.explanation" label="AI说明" :span="2">
          {{ currentRow.explanation }}
        </el-descriptions-item>

        <el-descriptions-item v-if="currentRow.functionCalls" label="函数调用" :span="2">
          <el-input
            :model-value="formatJson(currentRow.functionCalls)"
            type="textarea"
            :rows="6"
            readonly
          />
        </el-descriptions-item>

        <el-descriptions-item v-if="currentRow.parseErrorMessage" label="解析错误" :span="2">
          <el-alert :title="currentRow.parseErrorMessage" type="error" :closable="false" />
        </el-descriptions-item>

        <el-descriptions-item label="函数名称">
          {{ currentRow.functionName || "-" }}
        </el-descriptions-item>
        <el-descriptions-item label="执行状态">
          <el-tag
            v-if="currentRow.executeStatus"
            :type="statusTagType[currentRow.executeStatus]"
            size="small"
          >
            {{ statusText[currentRow.executeStatus] }}
          </el-tag>
          <span v-else>-</span>
        </el-descriptions-item>

        <el-descriptions-item label="执行耗时">
          {{ formatNumber(currentRow.executionTime) }} ms
        </el-descriptions-item>
        <el-descriptions-item label="影响行数">
          {{ formatNumber(currentRow.affectedRows) }}
        </el-descriptions-item>

        <el-descriptions-item v-if="currentRow.functionArguments" label="执行参数" :span="2">
          <el-input
            :model-value="formatJson(currentRow.functionArguments)"
            type="textarea"
            :rows="4"
            readonly
          />
        </el-descriptions-item>

        <el-descriptions-item v-if="currentRow.executeResult" label="执行结果" :span="2">
          <el-input
            :model-value="formatJson(currentRow.executeResult)"
            type="textarea"
            :rows="4"
            readonly
          />
        </el-descriptions-item>

        <el-descriptions-item v-if="currentRow.executeErrorMessage" label="执行错误" :span="2">
          <el-alert :title="currentRow.executeErrorMessage" type="error" :closable="false" />
        </el-descriptions-item>

        <el-descriptions-item label="风险操作">
          <el-tag v-if="currentRow.isDangerous" type="warning" size="small">风险操作</el-tag>
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item label="是否确认">
          <span v-if="currentRow.requiresConfirmation">
            {{ currentRow.userConfirmed ? "已确认" : "待确认" }}
          </span>
          <span v-else>-</span>
        </el-descriptions-item>

        <el-descriptions-item label="IP地址">
          {{ currentRow.ipAddress || "-" }}
        </el-descriptions-item>
        <el-descriptions-item label="页面路由">
          {{ currentRow.currentRoute || "-" }}
        </el-descriptions-item>
        <el-descriptions-item label="User-Agent" :span="2">
          {{ currentRow.userAgent || "-" }}
        </el-descriptions-item>

        <el-descriptions-item label="创建时间">
          {{ currentRow.createTime }}
        </el-descriptions-item>
        <el-descriptions-item label="更新时间">
          {{ currentRow.updateTime || "-" }}
        </el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">
          {{ currentRow.remark || "-" }}
        </el-descriptions-item>
      </el-descriptions>

      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: "AiCommandRecord",
  inheritAttrs: false,
});

import AiCommandApi, { AiCommandRecordVO, AiCommandRecordPageQuery } from "@/api/ai";
import { onMounted, reactive, ref } from "vue";

const queryFormRef = ref();

const loading = ref(false);
const total = ref(0);

const queryParams = reactive<AiCommandRecordPageQuery>({
  pageNum: 1,
  pageSize: 10,
  keywords: "",
  provider: "",
  model: "",
  parseSuccess: undefined,
  executeStatus: "",
  isDangerous: undefined,
  createTime: ["", ""],
});

const pageData = ref<AiCommandRecordVO[]>([]);

const detailDialogVisible = ref(false);
const currentRow = ref<AiCommandRecordVO>();

const statusText: Record<string, string> = {
  pending: "待执行",
  success: "成功",
  failed: "失败",
};

const statusTagType: Record<string, "info" | "success" | "danger"> = {
  pending: "info",
  success: "success",
  failed: "danger",
};

function fetchData() {
  loading.value = true;
  AiCommandApi.getCommandRecordPage(queryParams)
    .then((data) => {
      pageData.value = data.list || [];
      total.value = data.total || 0;
    })
    .finally(() => {
      loading.value = false;
    });
}

function handleQuery() {
  queryParams.pageNum = 1;
  fetchData();
}

function handleResetQuery() {
  queryFormRef.value?.resetFields();
  queryParams.pageNum = 1;
  fetchData();
}

function handleViewDetail(row: AiCommandRecordVO) {
  currentRow.value = row;
  detailDialogVisible.value = true;
}

function formatJson(jsonStr?: string) {
  if (!jsonStr) return "-";
  try {
    return JSON.stringify(JSON.parse(jsonStr), null, 2);
  } catch {
    return jsonStr;
  }
}

function formatNumber(value?: number | string | null) {
  if (value === undefined || value === null || value === "") {
    return "-";
  }
  return value;
}

onMounted(() => {
  fetchData();
});
</script>

<style lang="scss" scoped>
.search-container {
  margin-bottom: 20px;
}

.search-buttons {
  margin-left: 10px;
}
</style>
