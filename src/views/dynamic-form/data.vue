<template>
  <div class="page-container">
    <el-card ref="tableWrapperRef" class="page-content" shadow="never">
      <div class="page-toolbar">
        <div class="page-toolbar__left">
          <span class="data-toolbar__title">{{ title }}</span>
          <el-tag v-if="formKey" type="info" effect="plain">{{ formKey }}</el-tag>
          <el-button
            v-hasPerm="['form:data:delete']"
            type="danger"
            :disabled="!hasSelection"
            @click="handleDelete()"
          >
            删除
          </el-button>
          <el-button v-hasPerm="['form:data:list']" :loading="exporting" @click="handleExport">
            导出
          </el-button>
        </div>
        <div class="page-toolbar__right">
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

      <div class="page-table-wrapper">
        <el-table
          v-loading="loading"
          highlight-current-row
          :data="list"
          class="page-table"
          border
          height="100%"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" align="center" />
          <!-- 动态字段列：由表单规则提取，超出上限的字段在详情抽屉查看 -->
          <el-table-column
            v-for="field in displayFields"
            :key="field.field"
            :label="field.title"
            :prop="field.field"
            min-width="140"
            show-overflow-tooltip
          >
            <template #default="scope">
              {{ formatCellValue(getFieldValue(scope.row as FormDataItem, field.field), field) }}
            </template>
          </el-table-column>
          <!-- 弹性列：吸收剩余宽度，避免表格右侧留白 -->
          <el-table-column label="提交人" min-width="120" align="center" show-overflow-tooltip>
            <template #default="scope">
              {{ (scope.row as FormDataItem).createByName || "匿名" }}
            </template>
          </el-table-column>
          <el-table-column label="版本" prop="formVersion" width="70" align="center" />
          <el-table-column label="提交时间" prop="createTime" width="170" align="center" />
          <el-table-column fixed="right" label="操作" align="center" width="140">
            <template #default="scope">
              <el-button
                type="primary"
                link
                size="small"
                @click.stop="handleDetailClick(scope.row as FormDataItem)"
              >
                详情
              </el-button>
              <el-button
                v-hasPerm="['form:data:delete']"
                type="danger"
                link
                size="small"
                @click.stop="handleDelete((scope.row as FormDataItem).id)"
              >
                删除
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

    <!-- 数据详情抽屉：form-create 只读回显提交时的表单结构 -->
    <el-drawer v-model="detailState.visible" title="数据详情" size="560px">
      <el-descriptions v-if="detailRow" :column="2" border class="data-detail__desc">
        <el-descriptions-item label="提交人">
          {{ detailRow.createByName || "匿名" }}
        </el-descriptions-item>
        <el-descriptions-item label="提交时间">{{ detailRow.createTime }}</el-descriptions-item>
        <el-descriptions-item label="表单版本">v{{ detailRow.formVersion }}</el-descriptions-item>
      </el-descriptions>

      <form-create
        v-model="detailData"
        v-model:api="detailApi"
        :rule="detailRule"
        :option="detailOption"
      />
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { useFullscreen } from "@vueuse/core";
import { ElMessage, ElMessageBox } from "element-plus";
import { Refresh } from "@element-plus/icons-vue";
import type { Options, Rule } from "@form-create/element-ui";
import type { Column } from "exceljs";

import FormAPI from "@/api/form";
import type { FormDataItem, FormDataQueryParams } from "@/api/form";
import { usePageTable, useTableSelection } from "@/composables";
import { downloadFile } from "@/utils";
import {
  extractFields,
  formatCellValue,
  parseDataJson,
  type FormFieldMeta,
} from "./utils/form-field";

defineOptions({
  name: "FormData",
  inheritAttrs: false,
});

const route = useRoute();

/** 表单唯一标识（列表"数据"按钮携带） */
const formKey = computed(() => String(route.query.formKey ?? ""));

/** 页面标题（列表页携带） */
const title = computed(() => String(route.query.title ?? "表单数据"));

const tableWrapperRef = ref<HTMLElement | null>(null);
const { toggle: toggleFullscreen } = useFullscreen(tableWrapperRef);

/** 表单名称（导出文件名用） */
const formName = ref("");

/** 导出中状态（防重复触发） */
const exporting = ref(false);

/** 表单规则（shallowRef 避免深代理破坏 Rule 内部 Creator 结构） */
const rule = shallowRef<Rule[]>([]);

/** 从表单规则提取的字段元数据（field + title + 选项映射） */
const fields = ref<FormFieldMeta[]>([]);

/** 动态列上限：超出部分在详情抽屉查看，避免表格横向溢出 */
const MAX_FIELD_COLUMNS = 6;

const displayFields = computed(() => fields.value.slice(0, MAX_FIELD_COLUMNS));

/** 分页表格数据管理 */
const { loading, list, total, params, fetchData } = usePageTable<FormDataItem, FormDataQueryParams>(
  {
    initialParams: { pageNum: 1, pageSize: 10 },
    request: (queryParams) => FormAPI.getFormDataPage(formKey.value, queryParams),
  }
);

const { selectedIds, hasSelection, handleSelectionChange } = useTableSelection<FormDataItem>();

/** 详情抽屉状态 */
const detailState = reactive({
  visible: false,
});

/** 详情行（descriptions 展示提交人/时间） */
const detailRow = ref<FormDataItem>();

const detailApi = ref();
const detailData = ref<Record<string, unknown>>({});
const detailRule = shallowRef<Rule[]>([]);
const detailOption = ref<Options>({ submitBtn: false, resetBtn: false });

onMounted(async () => {
  if (!formKey.value) {
    ElMessage.error("缺少表单标识参数");
    return;
  }
  // 先拉表单规则提取动态列，再查数据（表格列依赖字段元数据）
  const renderData = await FormAPI.getRender(formKey.value);
  formName.value = renderData.formName;
  rule.value = JSON.parse(renderData.formJson);
  fields.value = extractFields(rule.value);
  fetchData();
});

/** 行数据解析缓存（行ID -> 字段值映射，避免模板重复解析 dataJson） */
const rowDataMap = computed(() => {
  const map = new Map<string, Record<string, unknown>>();
  list.value.forEach((row) => map.set(row.id, parseDataJson(row.dataJson)));
  return map;
});

/**
 * 取行数据的指定字段值
 * @param row 数据行
 * @param field 字段名
 */
function getFieldValue(row: FormDataItem, field: string): unknown {
  return rowDataMap.value.get(row.id)?.[field];
}

// 打开详情抽屉只读回显（优先提交时版本快照，防止表单改版后历史数据漂移）
async function handleDetailClick(row: FormDataItem): Promise<void> {
  const detail = await FormAPI.getFormDataDetail(formKey.value, row.id);
  detailRow.value = detail;
  detailData.value = detail.dataJson ? JSON.parse(detail.dataJson) : {};
  // 独立 JSON.parse，与页面渲染规则隔离，可安全置为只读
  detailRule.value = detail.formJson
    ? JSON.parse(detail.formJson)
    : JSON.parse(JSON.stringify(rule.value));
  // 强制隐藏提交/重置按钮（快照配置可能开启）
  const parsedOption: Options = detail.optionsJson ? JSON.parse(detail.optionsJson) : {};
  detailOption.value = { ...parsedOption, submitBtn: false, resetBtn: false };
  detailState.visible = true;
  // form-create 挂载完成后再禁用
  await nextTick();
  detailApi.value?.disabled(true);
}

/**
 * 删除单个或批量表单数据
 * @param id 指定时删除单条，否则删除勾选项
 */
async function handleDelete(id?: string): Promise<void> {
  const dataIds = id ?? selectedIds.value.join(",");
  if (!dataIds) {
    ElMessage.warning("请勾选删除项");
    return;
  }

  try {
    await ElMessageBox.confirm("删除后不可恢复，确认删除已选中的数据项?", "警告", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });
  } catch {
    ElMessage.info("已取消删除");
    return;
  }

  loading.value = true;
  try {
    await FormAPI.deleteFormData(formKey.value, dataIds);
    ElMessage.success("删除成功");
    fetchData();
  } finally {
    loading.value = false;
  }
}

/** 导出分页大小 */
const EXPORT_PAGE_SIZE = 500;

/** 导出页数上限（超出截断提示） */
const EXPORT_MAX_PAGES = 100;

// 导出全量数据为 Excel（全部字段 + 提交人/版本/时间；分页拉取，exceljs 按需加载）
async function handleExport(): Promise<void> {
  if (exporting.value) return;
  exporting.value = true;
  try {
    const rows: FormDataItem[] = [];
    let total = 0;
    for (let pageNum = 1; pageNum <= EXPORT_MAX_PAGES; pageNum++) {
      const page = await FormAPI.getFormDataPage(formKey.value, {
        pageNum,
        pageSize: EXPORT_PAGE_SIZE,
      });
      total = page.total;
      rows.push(...page.list);
      if (rows.length >= total) break;
    }
    if (rows.length < total) {
      ElMessage.warning(`数据量超出导出上限，仅导出前 ${rows.length} 条`);
    }
    if (rows.length === 0) {
      ElMessage.warning("暂无数据可导出");
      return;
    }

    const ExcelJS = await import("exceljs");
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("表单数据");
    const columns: Partial<Column>[] = [
      ...fields.value.map((field) => ({ header: field.title, key: field.field })),
      { header: "提交人", key: "createByName" },
      { header: "版本", key: "formVersion" },
      { header: "提交时间", key: "createTime" },
    ];
    worksheet.columns = columns;
    // 列宽按表头长度自适应并设下限，避免中文长标题列被压缩不可读
    worksheet.columns.forEach((column) => {
      column.width = Math.max((column.header?.length ?? 4) * 2.5 + 4, 12);
    });
    worksheet.addRows(
      rows.map((row) => {
        const data = parseDataJson(row.dataJson);
        const record: Record<string, unknown> = {};
        fields.value.forEach((field) => {
          record[field.field] = formatCellValue(data[field.field], field);
        });
        record.createByName = row.createByName || "匿名";
        record.formVersion = row.formVersion;
        record.createTime = row.createTime;
        return record;
      })
    );

    const buffer = await workbook.xlsx.writeBuffer();
    downloadFile({ data: buffer }, `${formName.value || formKey.value}-数据.xlsx`);
    ElMessage.success(`成功导出 ${rows.length} 条数据`);
  } finally {
    exporting.value = false;
  }
}
</script>

<style lang="scss" scoped>
.data-toolbar__title {
  font-size: 15px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.data-detail__desc {
  margin-bottom: 16px;
}
</style>
