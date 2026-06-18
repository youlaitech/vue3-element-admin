<template>
  <el-card class="page-search" shadow="never">
    <el-form ref="queryFormRef" :model="params" :inline="true">
      <el-form-item prop="keywords" label="关键字">
        <el-input
          v-model="params.keywords"
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
    <el-table v-loading="loading" :data="list" highlight-current-row border>
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
            v-if="scope.row.isConfigured === TABLE_CONFIGURED"
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
      v-model:total="total"
      v-model:page="params.pageNum"
      v-model:limit="params.pageSize"
      @pagination="fetchData"
    />
  </el-card>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { MagicStick, Refresh, RefreshLeft, Search } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox, type FormInstance } from "element-plus";

import GeneratorAPI from "@/api/codegen";
import type { TableItem, TableQueryParams } from "@/api/codegen";
import { usePageTable } from "@/composables";

/** 表已配置代码生成（1:是;0:否）。 */
const TABLE_CONFIGURED = 1;

const emit = defineEmits<{
  generate: [tableName: string];
  "reset-config": [tableName: string];
}>();

const queryFormRef = ref<FormInstance>();

// ── 分页表格状态 ────────────────────────────────────────────
/** 分页表格数据管理 */
const { loading, list, total, params, fetchData, handleQuery, handleResetQuery } = usePageTable<
  TableItem,
  TableQueryParams
>({
  initialParams: {
    pageNum: 1,
    pageSize: 10,
  },
  request: GeneratorAPI.getTablePage,
  onBeforeReset: () => queryFormRef.value?.resetFields(),
});

/**
 * 重置指定表的代码生成配置。
 *
 * @param tableName 表名
 */
async function handleResetConfig(tableName: string): Promise<void> {
  try {
    await ElMessageBox.confirm("确定要重置配置吗？", "提示", { type: "warning" });
  } catch {
    return;
  }

  await GeneratorAPI.resetGenConfig(tableName);
  ElMessage.success("重置成功");
  handleQuery();
}

onMounted(() => {
  handleQuery();
});

defineExpose({ handleQuery, handleResetConfig });
</script>
