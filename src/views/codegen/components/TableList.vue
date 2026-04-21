<template>
  <el-card class="page-search" shadow="never">
    <el-form ref="queryFormRef" :model="queryParams" :inline="true">
      <el-form-item prop="keywords" label="关键字">
        <el-input
          v-model="queryParams.keywords"
          placeholder="表名"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleQuery">
          <template #icon><Search /></template>
          搜索
        </el-button>
        <el-button @click="handleResetQuery">
          <template #icon><Refresh /></template>
          重置
        </el-button>
      </el-form-item>
    </el-form>
  </el-card>

  <el-card class="page-content" shadow="never">
    <el-table v-loading="loading" :data="pageData" highlight-current-row border>
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="表名" prop="tableName" min-width="100" />
      <el-table-column label="描述" prop="tableComment" width="150" />
      <el-table-column label="存储引擎" align="center" prop="engine" />
      <el-table-column label="排序规则" align="center" prop="tableCollation" />
      <el-table-column label="创建时间" align="center" prop="createTime" />
      <el-table-column fixed="right" label="操作" width="200">
        <template #default="scope">
          <el-button
            type="primary"
            size="small"
            link
            @click="emit('generate', scope.row.tableName)"
          >
            <template #icon><MagicStick /></template>
            生成代码
          </el-button>
          <el-button
            v-if="scope.row.isConfigured === 1"
            type="danger"
            size="small"
            link
            @click="emit('reset-config', scope.row.tableName)"
          >
            <template #icon><RefreshLeft /></template>
            重置配置
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-if="total > 0"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      :total="total"
      @pagination="handleQuery"
    />
  </el-card>
</template>

<script setup lang="ts">
import GeneratorAPI from "@/api/codegen";
import type { TableQueryParams, TableItem } from "@/api/codegen";

const emit = defineEmits<{
  generate: [tableName: string];
  "reset-config": [tableName: string];
}>();

const queryFormRef = ref();
const queryParams = reactive<TableQueryParams>({
  pageNum: 1,
  pageSize: 10,
});

const loading = ref(false);
const pageData = ref<TableItem[]>([]);
const total = ref(0);

function handleQuery() {
  loading.value = true;
  GeneratorAPI.getTablePage(queryParams)
    .then((data) => {
      pageData.value = data.list;
      total.value = data.total ?? 0;
    })
    .finally(() => {
      loading.value = false;
    });
}

function handleResetQuery() {
  queryFormRef.value?.resetFields();
  queryParams.pageNum = 1;
  handleQuery();
}

function handleResetConfig(tableName: string) {
  ElMessageBox.confirm("确定要重置配置吗？", "提示", { type: "warning" }).then(() => {
    GeneratorAPI.resetGenConfig(tableName).then(() => {
      ElMessage.success("重置成功");
      handleQuery();
    });
  });
}

onMounted(() => {
  handleQuery();
});

defineExpose({ handleQuery, handleResetConfig });
</script>
