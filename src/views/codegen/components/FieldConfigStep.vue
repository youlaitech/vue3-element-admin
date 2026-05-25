<template>
  <div class="field-config-step">
    <!-- 顶部统计栏 -->
    <div class="stats-bar">
      <div class="stat-item">
        <div class="stat-icon bg-primary">
          <el-icon><Tickets /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ fieldConfigs.length }}</div>
          <div class="stat-label">字段总数</div>
        </div>
      </div>
      <div class="stat-item">
        <div class="stat-icon bg-success">
          <el-icon><Search /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ queryCount }}</div>
          <div class="stat-label">查询字段</div>
        </div>
      </div>
      <div class="stat-item">
        <div class="stat-icon bg-warning">
          <el-icon><List /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ listCount }}</div>
          <div class="stat-label">列表字段</div>
        </div>
      </div>
      <div class="stat-item">
        <div class="stat-icon bg-info">
          <el-icon><EditPen /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ formCount }}</div>
          <div class="stat-label">表单字段</div>
        </div>
      </div>

      <!-- 批量操作 -->
      <div class="bulk-actions">
        <span class="text-sm text-gray-500">批量:</span>
        <el-dropdown @command="(cmd: any) => bulkSet(cmd.key, cmd.value)">
          <el-button size="small" type="primary" plain>
            <el-icon><Search /></el-icon>
            查询
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item :command="{ key: 'isShowInQuery', value: 1 }">
                全选
              </el-dropdown-item>
              <el-dropdown-item :command="{ key: 'isShowInQuery', value: 0 }">
                全不选
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-dropdown @command="(cmd: any) => bulkSet(cmd.key, cmd.value)">
          <el-button size="small" type="success" plain>
            <el-icon><List /></el-icon>
            列表
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item :command="{ key: 'isShowInList', value: 1 }">全选</el-dropdown-item>
              <el-dropdown-item :command="{ key: 'isShowInList', value: 0 }">
                全不选
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-dropdown @command="(cmd: any) => bulkSet(cmd.key, cmd.value)">
          <el-button size="small" type="warning" plain>
            <el-icon><EditPen /></el-icon>
            表单
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item :command="{ key: 'isShowInForm', value: 1 }">全选</el-dropdown-item>
              <el-dropdown-item :command="{ key: 'isShowInForm', value: 0 }">
                全不选
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <!-- 字段表格 -->
    <el-table
      ref="tableRef"
      v-loading="loading"
      :data="fieldConfigs"
      :element-loading-text="loadingText"
      highlight-current-row
      class="field-table"
    >
      <!-- 拖拽手柄 -->
      <el-table-column width="48" align="center">
        <template #default>
          <el-icon class="cursor-move sortable-handle text-gray-400 hover:text-primary">
            <Rank />
          </el-icon>
        </template>
      </el-table-column>

      <!-- 字段信息 -->
      <el-table-column label="字段信息" min-width="360">
        <template #default="{ row }">
          <div class="flex items-start gap-3">
            <div class="field-info" style="flex-shrink: 0; width: 140px">
              <div class="flex items-center gap-2">
                <span class="font-medium text-sm">{{ row.columnName }}</span>
                <el-tag v-if="row.isPrimaryKey" size="small" type="warning" effect="dark">
                  主键
                </el-tag>
              </div>
              <div class="text-xs text-gray-400 font-mono mt-1">
                {{ row.columnType }} → {{ row.fieldType }}
                <span v-if="row.maxLength">({{ row.maxLength }})</span>
              </div>
            </div>
            <div class="flex-1 flex flex-col gap-1.5">
              <div class="flex items-center gap-2">
                <span class="text-xs text-gray-500 w-10 text-right">字段名</span>
                <el-input v-model="row.fieldName" size="small" style="width: 130px" />
              </div>
              <div class="flex items-center gap-2">
                <span class="text-xs text-gray-500 w-10 text-right">注释</span>
                <el-input v-model="row.fieldComment" size="small" style="width: 130px" />
              </div>
            </div>
          </div>
        </template>
      </el-table-column>

      <!-- 查询 -->
      <el-table-column label="查询" width="60" align="center">
        <template #default="{ row }">
          <el-checkbox v-model="row.isShowInQuery" :true-value="1" :false-value="0" />
        </template>
      </el-table-column>

      <!-- 查询方式 -->
      <el-table-column label="查询方式" width="120">
        <template #default="{ row }">
          <el-select
            v-model="row.queryType"
            :disabled="row.isShowInQuery !== 1"
            size="small"
            placeholder=""
          >
            <el-option
              v-for="(item, key) in queryTypeOptions"
              :key="key"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </template>
      </el-table-column>

      <!-- 列表 -->
      <el-table-column label="列表" width="60" align="center">
        <template #default="{ row }">
          <el-checkbox v-model="row.isShowInList" :true-value="1" :false-value="0" />
        </template>
      </el-table-column>

      <!-- 表单 -->
      <el-table-column label="表单" width="60" align="center">
        <template #default="{ row }">
          <el-checkbox v-model="row.isShowInForm" :true-value="1" :false-value="0" />
        </template>
      </el-table-column>

      <!-- 表单类型 -->
      <el-table-column label="表单类型" width="120">
        <template #default="{ row }">
          <el-select
            v-model="row.formType"
            :disabled="row.isShowInForm !== 1 && row.isShowInQuery !== 1"
            size="small"
            placeholder=""
          >
            <el-option
              v-for="(item, key) in formTypeOptions"
              :key="key"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </template>
      </el-table-column>

      <!-- 字典类型 -->
      <el-table-column label="字典类型" width="120">
        <template #default="{ row }">
          <el-select
            v-if="row.formType === FormTypeEnum.SELECT.value"
            v-model="row.dictType"
            clearable
            size="small"
            placeholder="请选择"
          >
            <el-option
              v-for="item in dictOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
          <span v-else class="text-gray-300 text-xs">-</span>
        </template>
      </el-table-column>

      <!-- 必填 -->
      <el-table-column label="必填" width="60" align="center">
        <template #default="{ row }">
          <el-switch
            v-model="row.isRequired"
            :active-value="1"
            :inactive-value="0"
            :disabled="row.isShowInForm !== 1"
            size="small"
          />
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import Sortable from "sortablejs";
import { FormTypeEnum, QueryTypeEnum } from "@/enums/codegen";
import type { GenConfigForm } from "@/api/codegen";

const formData = defineModel<GenConfigForm>({ required: true });

defineProps<{
  loading: boolean;
  loadingText: string;
  dictOptions?: OptionItem[];
}>();

const formTypeOptions: Record<string, OptionItem> = FormTypeEnum;
const queryTypeOptions: Record<string, OptionItem> = QueryTypeEnum;

const tableRef = ref();
const sortFlag = ref<Sortable | null>(null);

const fieldConfigs = computed(() => formData.value?.fieldConfigs || []);

// 统计数量
const queryCount = computed(() => fieldConfigs.value.filter((f) => f.isShowInQuery === 1).length);
const listCount = computed(() => fieldConfigs.value.filter((f) => f.isShowInList === 1).length);
const formCount = computed(() => fieldConfigs.value.filter((f) => f.isShowInForm === 1).length);

// 批量设置
function bulkSet(key: "isShowInQuery" | "isShowInList" | "isShowInForm", value: 0 | 1) {
  fieldConfigs.value.forEach((row) => {
    row[key] = value;
  });
}

// 用 Sortable.js 实现行拖拽排序，需要在字段配置步骤显示后调用
function initSort() {
  if (sortFlag.value) return;
  const tbody = tableRef.value?.$el?.querySelector(".el-table__body-wrapper tbody");
  if (!tbody) return;
  sortFlag.value = Sortable.create(tbody, {
    animation: 150,
    ghostClass: "sortable-ghost",
    handle: ".sortable-handle",
    easing: "cubic-bezier(1, 0, 0, 1)",
    onEnd: (evt: any) => {
      const { oldIndex, newIndex } = evt;
      if (oldIndex === undefined || newIndex === undefined || oldIndex === newIndex) return;
      const list = formData.value?.fieldConfigs || [];
      const [item] = list.splice(oldIndex, 1);
      list.splice(newIndex, 0, item);
    },
  });
}

function destroySort() {
  sortFlag.value?.destroy();
  sortFlag.value = null;
}

// 暴露给父组件
defineExpose({ initSort, destroySort });

onBeforeUnmount(() => {
  destroySort();
});
</script>

<style scoped lang="scss">
.field-config-step {
  .stats-bar {
    display: flex;
    gap: 16px;
    align-items: center;
    padding: 16px 20px;
    margin-bottom: 16px;
    background: var(--el-bg-color);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 12px;

    .stat-item {
      display: flex;
      gap: 10px;
      align-items: center;
      padding: 0 16px;
      border-right: 1px solid var(--el-border-color-lighter);

      &:last-of-type {
        border-right: none;
      }

      .stat-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 38px;
        height: 38px;
        font-size: 18px;
        color: #fff;
        border-radius: 10px;

        &.bg-primary {
          background: linear-gradient(
            135deg,
            var(--el-color-primary),
            var(--el-color-primary-light-3)
          );
        }
        &.bg-success {
          background: linear-gradient(
            135deg,
            var(--el-color-success),
            var(--el-color-success-light-3)
          );
        }
        &.bg-warning {
          background: linear-gradient(
            135deg,
            var(--el-color-warning),
            var(--el-color-warning-light-3)
          );
        }
        &.bg-info {
          background: linear-gradient(135deg, var(--el-color-info), var(--el-color-info-light-3));
        }
      }

      .stat-info {
        .stat-value {
          font-size: 20px;
          font-weight: 700;
          line-height: 1.2;
          color: var(--el-text-color-primary);
        }
        .stat-label {
          margin-top: 2px;
          font-size: 12px;
          color: var(--el-text-color-secondary);
        }
      }
    }

    .bulk-actions {
      display: flex;
      gap: 8px;
      align-items: center;
      margin-left: auto;

      :deep(.el-button) {
        display: inline-flex;
        gap: 4px;
        align-items: center;
      }
    }
  }

  .field-table {
    overflow: hidden;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 12px;

    :deep(.el-table__header) {
      th {
        font-size: 13px;
        font-weight: 600;
        color: var(--el-text-color-primary);
        background: var(--el-fill-color-light);
      }
    }

    :deep(.el-table__row) {
      transition: background 0.2s ease;

      &:hover {
        background: var(--el-fill-color-lighter) !important;
      }
    }
  }
}

.sortable-ghost {
  background: var(--el-color-primary-light-9) !important;
  border: 1px dashed var(--el-color-primary);
  opacity: 0.5;
}
</style>
