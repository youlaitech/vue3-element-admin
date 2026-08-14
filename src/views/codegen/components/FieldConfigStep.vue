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

        <el-button size="small" type="info" plain @click="guideVisible = true">
          <el-icon><QuestionFilled /></el-icon>
          生成器说明
        </el-button>
      </div>
    </div>

    <!-- 生成器说明对话框 -->
    <el-dialog v-model="guideVisible" title="生成器说明" width="800px" top="6vh">
      <div class="generator-guide" v-html="renderMarkdown(guideContent)"></div>
    </el-dialog>

    <!-- 字段表格 -->
    <div class="field-table-scroll">
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
        <el-table-column label="字段信息" min-width="320">
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
                  <el-input v-model="row.fieldName" size="small" style="width: 100px" />
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-xs text-gray-500 w-10 text-right">注释</span>
                  <el-input v-model="row.fieldComment" size="small" style="width: 100px" />
                </div>
              </div>
            </div>
          </template>
        </el-table-column>

        <!-- 查询 -->
        <el-table-column label="查询" width="95">
          <template #default="{ row }">
            <div class="flex flex-col items-center gap-1">
              <el-checkbox v-model="row.isShowInQuery" :true-value="1" :false-value="0" />
              <el-select
                v-model="row.queryType"
                :disabled="row.isShowInQuery !== 1"
                size="small"
                placeholder=""
                style="width: 100%"
              >
                <el-option
                  v-for="(item, key) in queryTypeOptions"
                  :key="key"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </div>
          </template>
        </el-table-column>

        <!-- 列表 -->
        <el-table-column label="列表" width="40" align="center">
          <template #default="{ row }">
            <el-checkbox v-model="row.isShowInList" :true-value="1" :false-value="0" />
          </template>
        </el-table-column>

        <!-- 表单 -->
        <el-table-column label="表单" width="40" align="center">
          <template #default="{ row }">
            <el-checkbox v-model="row.isShowInForm" :true-value="1" :false-value="0" />
          </template>
        </el-table-column>

        <!-- 表单类型 -->
        <el-table-column label="表单类型" width="108">
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
                :disabled="isFormTypeOptionDisabled(row, item.value)"
              />
            </el-select>
          </template>
        </el-table-column>

        <!-- 验证 -->
        <el-table-column label="验证" width="180">
          <template #default="{ row }">
            <!-- 数字输入框：最大/最小值范围 -->
            <div
              v-if="row.formType === FormTypeEnum.INPUT_NUMBER.value"
              class="flex items-center gap-1"
            >
              <el-input-number
                v-model="row.minValue"
                size="small"
                :controls="false"
                placeholder="最小值"
                style="width: 72px"
              />
              <span class="text-gray-400 text-xs">~</span>
              <el-input-number
                v-model="row.maxValue"
                size="small"
                :controls="false"
                placeholder="最大值"
                style="width: 72px"
              />
            </div>
            <!-- 日期框：开始/结束 -->
            <div
              v-else-if="row.formType === FormTypeEnum.DATE.value"
              class="flex items-center gap-1"
            >
              <el-date-picker
                v-model="row.startValue"
                type="date"
                size="small"
                value-format="YYYY-MM-DD"
                placeholder="开始日期"
                style="width: 72px"
              />
              <span class="text-gray-400 text-xs">~</span>
              <el-date-picker
                v-model="row.endValue"
                type="date"
                size="small"
                value-format="YYYY-MM-DD"
                placeholder="结束日期"
                style="width: 72px"
              />
            </div>
            <!-- 日期时间框：开始/结束 -->
            <div
              v-else-if="row.formType === FormTypeEnum.DATE_TIME.value"
              class="flex items-center gap-1"
            >
              <el-date-picker
                v-model="row.startValue"
                type="datetime"
                size="small"
                value-format="YYYY-MM-DD HH:mm:ss"
                placeholder="开始时间"
                style="width: 72px"
              />
              <span class="text-gray-400 text-xs">~</span>
              <el-date-picker
                v-model="row.endValue"
                type="datetime"
                size="small"
                value-format="YYYY-MM-DD HH:mm:ss"
                placeholder="结束时间"
                style="width: 72px"
              />
            </div>
            <!-- 输入框：校验类型 -->
            <el-select
              v-else-if="row.formType === FormTypeEnum.INPUT.value"
              v-model="row.validateType"
              clearable
              size="small"
              placeholder="请选择"
              style="width: 100%"
            >
              <el-option
                v-for="item in validateTypeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
            <!-- 多对一：选择关联表 -->
            <el-select
              v-else-if="row.formType === FormTypeEnum.MANY_TO_ONE.value"
              v-model="row.relationTable"
              clearable
              filterable
              size="small"
              placeholder="选择关联表"
              style="width: 100%"
            >
              <el-option
                v-for="item in tableOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
            <!-- 用户选一：固定关联用户表 -->
            <span
              v-else-if="row.formType === FormTypeEnum.USER_SELECT.value"
              class="text-xs text-gray-500"
            >
              关联用户表
            </span>
            <span v-else class="text-gray-300 text-xs">-</span>
          </template>
        </el-table-column>

        <!-- 字典类型 -->
        <el-table-column label="字典类型" width="105">
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
  </div>
</template>

<script setup lang="ts">
import Sortable from "sortablejs";
import { FormTypeEnum, QueryTypeEnum } from "@/enums/codegen";
import GeneratorAPI from "@/api/codegen";
import type { GenConfigForm, FieldConfig, TableItem } from "@/api/codegen";
import type { OptionItem } from "@/api/common";
import guideContent from "../docs/generator-guide.md?raw";

/** 生成器说明对话框可见性 */
const guideVisible = ref(false);

/**
 * 轻量 markdown 渲染（支持标题/列表/表格/引用/分隔线/加粗/行内代码）。
 *
 * @description 项目未引入 markdown 渲染库，教程为固定格式，这里做最小化渲染。
 */
function renderMarkdown(md: string): string {
  const escapeHtml = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const inline = (s: string) =>
    escapeHtml(s)
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/`([^`]+)`/g, "<code>$1</code>");

  const lines = md.split("\n");
  const html: string[] = [];
  let inTable = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // 表格
    if (trimmed.startsWith("|")) {
      if (!inTable) {
        html.push("<table>");
        inTable = true;
      }
      const cells = trimmed
        .split("|")
        .slice(1, -1)
        .map((c) => inline(c.trim()));
      const isHeader = /^[-:]+$/.test(cells.join("").replace(/<[^>]+>/g, ""));
      if (!isHeader) {
        html.push(`<tr>${cells.map((c) => `<td>${c}</td>`).join("")}</tr>`);
      }
      continue;
    }
    if (inTable) {
      html.push("</table>");
      inTable = false;
    }

    // 标题
    const heading = /^(#{1,4})\s+(.*)$/.exec(trimmed);
    if (heading) {
      const level = heading[1].length;
      html.push(`<h${level}>${inline(heading[2])}</h${level}>`);
      continue;
    }
    // 分隔线
    if (/^(-{3,}|\*{3,})$/.test(trimmed)) {
      html.push("<hr />");
      continue;
    }
    // 引用
    if (trimmed.startsWith(">")) {
      html.push(`<blockquote>${inline(trimmed.replace(/^>\s?/, ""))}</blockquote>`);
      continue;
    }
    // 无序列表
    if (/^[-*]\s+/.test(trimmed)) {
      html.push(`<li>${inline(trimmed.replace(/^[-*]\s+/, ""))}</li>`);
      continue;
    }
    // 空行
    if (!trimmed) {
      html.push("");
      continue;
    }
    // 普通段落
    html.push(`<p>${inline(trimmed)}</p>`);
  }
  if (inTable) html.push("</table>");
  return html.join("\n");
}

const formData = defineModel<GenConfigForm>({ required: true });

defineProps<{
  loading: boolean;
  loadingText: string;
  dictOptions?: OptionItem[];
}>();

const formTypeOptions: Record<string, OptionItem> = FormTypeEnum;
const queryTypeOptions: Record<string, OptionItem> = QueryTypeEnum;

/**
 * 是否为外键字段（数据库列名以 _id 结尾）。
 *
 * @description
 * 外键字段可配置为"多对一"，且不可设置为日期/日期时间类型。
 */
function isForeignKeyField(columnName?: string): boolean {
  return !!columnName && columnName.endsWith("_id");
}

/**
 * 是否为用户字段（user_id / create_by / update_by）。
 *
 * @description
 * 用户字段强制表单类型为"用户选一"。
 */
function isUserSelectField(columnName?: string): boolean {
  return columnName === "user_id" || columnName === "create_by" || columnName === "update_by";
}

/**
 * 根据字段名后缀推断默认表单类型。
 *
 * @description
 * - `_time` 结尾：默认"日期时间框"
 * - `_date` 结尾：默认"日期框"
 * - 其他：无默认（返回 undefined）
 */
function getDefaultFormTypeByColumnName(columnName?: string): number | undefined {
  if (!columnName) return undefined;
  if (columnName.endsWith("_time")) return FormTypeEnum.DATE_TIME.value as number;
  if (columnName.endsWith("_date")) return FormTypeEnum.DATE.value as number;
  return undefined;
}

/**
 * 判断表单类型选项是否禁用。
 *
 * @description
 * - 用户字段（user_id / update_by）：强制必选"用户选一"，禁用其他所有类型
 * - 其他外键字段（_id 结尾）：禁用"日期框""日期时间框"，允许"多对一"
 * - 非外键字段：禁用"多对一"
 */
function isFormTypeOptionDisabled(row: FieldConfig, value: string | number): boolean {
  const columnName = row.columnName;
  // 用户字段必选"用户选一"
  if (isUserSelectField(columnName)) {
    return value !== FormTypeEnum.USER_SELECT.value;
  }
  const isForeignKey = isForeignKeyField(columnName);
  if (isForeignKey) {
    return value === FormTypeEnum.DATE.value || value === FormTypeEnum.DATE_TIME.value;
  }
  return value === FormTypeEnum.MANY_TO_ONE.value;
}

/** 输入框校验类型选项 */
const validateTypeOptions: OptionItem[] = [
  { value: "mobile", label: "手机号" },
  { value: "email", label: "邮箱" },
  { value: "url", label: "网址" },
  { value: "digits", label: "全数字" },
  { value: "english", label: "全英文" },
  { value: "chinese", label: "汉字" },
];

/** 多对一关联表选项（当前表列表，值=表名，标签=描述(表名)） */
const tableOptions = ref<OptionItem[]>([]);

/** 加载表列表，供多对一关联表选择 */
async function loadTableOptions() {
  try {
    const { list } = await GeneratorAPI.getTablePage({ pageNum: 1, pageSize: 1000 });
    tableOptions.value = list.map((item: TableItem) => ({
      value: item.tableName,
      label: item.tableComment ? `${item.tableComment}(${item.tableName})` : item.tableName,
    }));
  } catch {
    tableOptions.value = [];
  }
}

onMounted(loadTableOptions);

const tableRef = ref();
const sortFlag = ref<Sortable | null>(null);

const fieldConfigs = computed(() => formData.value?.fieldConfigs || []);

// 用户字段强制修正表单类型为"用户选一"；_time/_date 结尾字段默认日期时间/日期类型
watch(
  fieldConfigs,
  (list) => {
    list.forEach((row) => {
      if (isUserSelectField(row.columnName) && row.formType !== FormTypeEnum.USER_SELECT.value) {
        row.formType = FormTypeEnum.USER_SELECT.value as number;
      }
      // 未设置表单类型时，按字段名后缀应用默认类型
      if (row.formType == null) {
        const defaultType = getDefaultFormTypeByColumnName(row.columnName);
        if (defaultType != null) {
          row.formType = defaultType;
        }
      }
    });
  },
  { deep: true, immediate: true }
);

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

  .field-table-scroll {
    overflow-x: auto;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 12px;
  }

  .field-table {
    width: max-content;
    min-width: 100%;

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

/* 生成器说明教程排版 */
.generator-guide {
  max-height: 70vh;
  padding: 4px 8px;
  overflow-y: auto;
  font-size: 14px;
  line-height: 1.8;
  color: var(--el-text-color-primary);

  h1,
  h2,
  h3,
  h4 {
    margin: 16px 0 8px;
    font-weight: 600;
    color: var(--el-text-color-primary);

    &:first-child {
      margin-top: 0;
    }
  }

  h1 {
    padding-bottom: 8px;
    font-size: 20px;
    border-bottom: 1px solid var(--el-border-color-lighter);
  }

  h2 {
    font-size: 17px;
  }

  h3 {
    font-size: 15px;
  }

  p {
    margin: 6px 0;
  }

  ul {
    padding-left: 20px;
    margin: 6px 0;
    list-style: disc;

    li {
      margin: 3px 0;
    }
  }

  blockquote {
    padding: 8px 12px;
    margin: 10px 0;
    color: var(--el-text-color-secondary);
    background: var(--el-fill-color-light);
    border-left: 4px solid var(--el-color-primary);
    border-radius: 4px;
  }

  code {
    padding: 2px 6px;
    font-family: "JetBrains Mono", Consolas, monospace;
    font-size: 13px;
    color: var(--el-color-primary);
    background: var(--el-fill-color-light);
    border-radius: 4px;
  }

  table {
    width: 100%;
    margin: 10px 0;
    font-size: 13px;
    border-collapse: collapse;

    td {
      padding: 8px 10px;
      border: 1px solid var(--el-border-color-lighter);
    }
  }

  hr {
    margin: 16px 0;
    border: none;
    border-top: 1px solid var(--el-border-color-lighter);
  }
}
</style>
