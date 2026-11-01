<template>
  <div
    class="rounded bg-[var(--el-bg-color)] border border-[var(--el-border-color)] p-5 h-full md:flex flex-1 flex-col md:overflow-auto"
  >
    <div class="flex flex-col md:flex-row justify-between gap-y-2.5 mb-2.5">
      <div class="toolbar-left flex gap-y-2.5 gap-x-2 md:gap-x-3 flex-wrap">
        <template v-for="btn in leftToolbarButtons" :key="btn.key">
          <slot
            v-if="isActionVisible(btn)"
            :name="'toolbar-action-' + btn.key"
            :action="getActionState(btn)"
          >
            <el-button
              v-bind="btn.buttonProps"
              :disabled="isActionDisabled(btn)"
              :loading="isActionPending(btn)"
              @click="runAction(btn)"
            >
              {{ btn.label }}
            </el-button>
          </slot>
        </template>
      </div>
      <div class="toolbar-right flex gap-y-2.5 gap-x-2 md:gap-x-3 flex-wrap">
        <template v-for="btn in rightToolbarButtons" :key="btn.key">
          <el-popover
            v-if="btn.key === 'columns' && isActionVisible(btn)"
            placement="bottom"
            trigger="click"
          >
            <template #reference>
              <el-button
                v-bind="btn.buttonProps"
                :aria-label="btn.label"
                :title="btn.label"
                :disabled="isActionDisabled(btn)"
              />
            </template>
            <el-scrollbar max-height="350px">
              <template v-for="col in columns" :key="col.columnKey ?? col.prop ?? col.type">
                <el-checkbox
                  v-if="col.prop"
                  v-model="col.show"
                  :disabled="col.hideable === false"
                  :label="col.label"
                />
              </template>
              <el-button link @click="restoreColumns">恢复默认列</el-button>
            </el-scrollbar>
          </el-popover>
          <slot
            v-else-if="btn.key !== 'columns' && isActionVisible(btn)"
            :name="'toolbar-action-' + btn.key"
            :action="getActionState(btn)"
          >
            <el-button
              v-bind="btn.buttonProps"
              :aria-label="btn.label"
              :title="btn.label"
              :disabled="isActionDisabled(btn)"
              :loading="isActionPending(btn)"
              @click="runAction(btn)"
            />
          </slot>
        </template>
      </div>
    </div>

    <el-alert
      v-if="loadError || actionError"
      class="mb-4"
      type="error"
      :title="loadError || actionError"
      :closable="false"
    />
    <el-table
      ref="elementTableRef"
      v-loading="loading"
      v-bind="tableConfig.table"
      :data="pageData"
      :row-key="rowKey"
      class="flex-1"
      @selection-change="handleSelectionChange"
      @filter-change="handleFilterChange"
      @sort-change="handleSortChange"
    >
      <template v-for="col in columns" :key="col.columnKey ?? col.prop ?? col.type">
        <el-table-column v-if="col.show" v-bind="getColumnAttrs(col)">
          <template v-if="!col.type || col.type === 'default'" #header="scope">
            <slot :name="'header-' + (col.columnKey ?? col.prop)" v-bind="scope">
              {{ col.label }}
            </slot>
          </template>
          <template
            v-if="!col.type || col.type === 'default' || col.type === 'expand'"
            #default="scope"
          >
            <template v-if="$slots['cell-' + col.prop]">
              <slot :name="'cell-' + col.prop" :prop="col.prop" v-bind="scope" />
            </template>
            <template v-else-if="col.cellType === 'image'">
              <template v-if="col.prop">
                <template v-if="Array.isArray(scope.row[col.prop])">
                  <template v-for="(item, index) in scope.row[col.prop]" :key="item">
                    <el-image
                      :src="item"
                      :preview-src-list="scope.row[col.prop]"
                      :initial-index="Number(index)"
                      :preview-teleported="true"
                      :style="`width: ${col.imageWidth ?? 40}px; height: ${col.imageHeight ?? 40}px`"
                    />
                  </template>
                </template>
                <template v-else>
                  <el-image
                    :src="scope.row[col.prop]"
                    :preview-src-list="[scope.row[col.prop]]"
                    :preview-teleported="true"
                    :style="`width: ${col.imageWidth ?? 40}px; height: ${col.imageHeight ?? 40}px`"
                  />
                </template>
              </template>
            </template>
            <template v-else-if="col.cellType === 'list'">
              <template v-if="col.prop">
                {{ (col.selectList ?? {})[scope.row[col.prop]] }}
              </template>
            </template>
            <template v-else-if="col.cellType === 'url'">
              <template v-if="col.prop">
                <el-link type="primary" :href="scope.row[col.prop]" target="_blank">
                  {{ scope.row[col.prop] }}
                </el-link>
              </template>
            </template>
            <template v-else-if="col.cellType === 'switch'">
              <template v-if="col.prop">
                <el-switch
                  v-model="scope.row[col.prop]"
                  :active-value="col.activeValue ?? 1"
                  :inactive-value="col.inactiveValue ?? 0"
                  :inline-prompt="true"
                  :active-text="col.activeText ?? ''"
                  :inactive-text="col.inactiveText ?? ''"
                  :validate-event="false"
                  :disabled="isCellDisabled(scope.row, col.prop)"
                  @change="handleModify(col.prop, scope.row[col.prop], scope.row)"
                />
              </template>
            </template>
            <template v-else-if="col.cellType === 'input'">
              <template v-if="col.prop">
                <el-input
                  v-model="scope.row[col.prop]"
                  :type="col.inputType ?? 'text'"
                  :disabled="isCellDisabled(scope.row, col.prop)"
                  @blur="handleModify(col.prop, scope.row[col.prop], scope.row)"
                />
              </template>
            </template>
            <template v-else-if="col.cellType === 'price'">
              <template v-if="col.prop">
                {{ `${col.priceFormat ?? ""}${scope.row[col.prop]}` }}
              </template>
            </template>
            <template v-else-if="col.cellType === 'percent'">
              <template v-if="col.prop">{{ scope.row[col.prop] }}%</template>
            </template>
            <template v-else-if="col.cellType === 'icon'">
              <template v-if="col.prop">
                <template
                  v-if="
                    typeof scope.row[col.prop] === 'string' &&
                    scope.row[col.prop].startsWith('el-icon-')
                  "
                >
                  <el-icon>
                    <component :is="scope.row[col.prop].replace('el-icon-', '')" />
                  </el-icon>
                </template>
                <template v-else>
                  <div :class="'i-svg:' + (scope.row[col.prop] ?? '')" />
                </template>
              </template>
            </template>
            <template v-else-if="col.cellType === 'date'">
              <template v-if="col.prop">
                {{
                  scope.row[col.prop]
                    ? useDateFormat(scope.row[col.prop], col.dateFormat ?? "YYYY-MM-DD HH:mm:ss")
                        .value
                    : ""
                }}
              </template>
            </template>
            <template v-else-if="col.cellType === 'actions'">
              <TableActions
                :actions="getRowActions(col, scope.row)"
                :max-visible="col.maxVisibleActions"
              >
                <template
                  v-for="name in getRowActionSlotNames($slots)"
                  #[name.slice(4)]="slotProps"
                >
                  <slot :name="name" :row="scope.row" v-bind="slotProps" />
                </template>
              </TableActions>
            </template>
            <template v-else-if="col.cellType === 'custom'">
              <slot :name="col.slotName ?? col.prop" :prop="col.prop" v-bind="scope" />
            </template>
          </template>
        </el-table-column>
      </template>
    </el-table>

    <div v-if="showPagination" class="mt-4">
      <el-scrollbar :class="['h-8!', { 'flex-x-end': tableConfig?.pagePosition === 'right' }]">
        <el-pagination
          v-bind="pagination"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </el-scrollbar>
    </div>

    <el-dialog
      v-model="exportDialogVisible"
      :close-on-click-modal="!exporting"
      :close-on-press-escape="!exporting"
      :show-close="!exporting"
      :align-center="true"
      title="导出数据"
      width="600px"
      style="padding-right: 0"
      @close="closeExportDialog"
    >
      <el-alert v-if="exportError" :title="exportError" type="error" :closable="false" />
      <el-scrollbar max-height="60vh">
        <el-form
          ref="exportFormRef"
          style="padding-right: var(--el-dialog-padding-primary)"
          :model="exportForm"
          :rules="exportRules"
        >
          <el-form-item label="文件名" prop="fileName">
            <el-input v-model="exportForm.fileName" clearable />
          </el-form-item>
          <el-form-item label="工作表名" prop="sheetName">
            <el-input v-model="exportForm.sheetName" clearable />
          </el-form-item>
          <el-form-item label="数据来源" prop="scope">
            <el-select v-model="exportForm.scope">
              <el-option label="当前数据 (当前页的数据)" :value="ExportScope.CURRENT" />
              <el-option
                label="选中数据 (所有选中的数据)"
                :value="ExportScope.SELECTED"
                :disabled="selectedRows.length <= 0"
              />
              <el-option
                label="全量数据 (所有分页的数据)"
                :value="ExportScope.ALL"
                :disabled="tableConfig.fetchExportRows === undefined"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="字段" prop="fields">
            <el-checkbox-group v-model="exportForm.fields">
              <template v-for="col in columns" :key="col.prop">
                <el-checkbox
                  v-if="col.prop && col.cellType !== 'actions'"
                  :value="col.prop"
                  :label="col.label"
                />
              </template>
            </el-checkbox-group>
          </el-form-item>
        </el-form>
      </el-scrollbar>
      <template #footer>
        <div style="padding-right: var(--el-dialog-padding-primary)">
          <el-button type="primary" :loading="exporting" @click="handleExport">确定</el-button>
          <el-button :disabled="exporting" @click="closeExportDialog">取消</el-button>
        </div>
      </template>
    </el-dialog>
    <el-dialog
      v-model="importModalVisible"
      :close-on-click-modal="!importing"
      :close-on-press-escape="!importing"
      :show-close="!importing"
      :align-center="true"
      title="导入数据"
      width="600px"
      style="padding-right: 0"
      @close="handleCloseImportModal"
    >
      <el-alert v-if="importError" :title="importError" type="error" :closable="false" />
      <el-scrollbar max-height="60vh">
        <el-form
          ref="importFormRef"
          style="padding-right: var(--el-dialog-padding-primary)"
          :model="importFormData"
          :rules="importFormRules"
        >
          <el-form-item label="文件" prop="files">
            <el-upload
              ref="uploadRef"
              v-model:file-list="importFormData.files"
              class="w-full"
              :accept="isFileImport ? '.xlsx,.xls' : '.xlsx'"
              :disabled="importing"
              :drag="true"
              :limit="1"
              :auto-upload="false"
              :on-exceed="handleFileExceed"
            >
              <el-icon class="el-icon--upload"><upload-filled /></el-icon>
              <div class="el-upload__text">
                <span>将文件拖到此处，或点击上传</span>
                <em>点击上传</em>
              </div>
              <template #tip>
                <div class="el-upload__tip">
                  *.xlsx / *.xls
                  <el-link
                    v-if="tableConfig.importTemplate"
                    type="primary"
                    icon="download"
                    underline="never"
                    @click="handleDownloadTemplate"
                  >
                    下载模板
                  </el-link>
                </div>
              </template>
            </el-upload>
          </el-form-item>
        </el-form>
      </el-scrollbar>
      <template #footer>
        <div style="padding-right: var(--el-dialog-padding-primary)">
          <el-button
            type="primary"
            :disabled="importFormData.files.length === 0"
            :loading="importing"
            @click="handleImportSubmit"
          >
            确定
          </el-button>
          <el-button :disabled="importing" @click="handleCloseImportModal">取消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { hasPerm } from "@/utils/permission";
import TableActions from "@/components/TableActions/index.vue";
import { useDateFormat } from "@vueuse/core";
import {
  genFileId,
  type FormInstance,
  type FormRules,
  type UploadInstance,
  type UploadRawFile,
  type UploadUserFile,
  type TableInstance,
} from "element-plus";
import { reactive, ref, computed, type Slots } from "vue";
import type { Column, Workbook } from "exceljs";
import { cloneDeep } from "lodash-es";
import { downloadFile } from "@/utils/download";
import { parseWorksheetRows, readImportSummary } from "./utils/workbook";
import type { CrudTableConfig, CrudRecord, CrudRowActionEvent, CrudActionContext } from "./types";
import type { CrudAction } from "./types";
import { buildSort, type TableSort } from "./utils/sort";
import type { SortExpression } from "@/api/common";

const props = defineProps<{
  tableConfig: CrudTableConfig;
  /** 由组合页面统一首次查询时关闭，默认自动加载 */
  autoLoad?: boolean;
}>();

const emit = defineEmits<{
  create: [];
  "toggle-search": [];
  "toolbar-action": [key: string];
  "filter-change": [data: CrudRecord];
  "row-action": [data: CrudRowActionEvent];
}>();

const config = computed(() => props.tableConfig);
const builtInActions: Record<string, Omit<CrudAction, "key">> = {
  create: { label: "新增", buttonProps: { icon: "plus", type: "success" }, permission: "create" },
  delete: { label: "删除", buttonProps: { icon: "delete", type: "danger" }, permission: "delete" },
  import: { label: "导入", buttonProps: { icon: "upload", type: "" }, permission: "import" },
  export: { label: "导出", buttonProps: { icon: "download", type: "" }, permission: "export" },
  refresh: { label: "刷新", buttonProps: { icon: "refresh", type: "" }, permission: "*:*:*" },
  columns: { label: "列设置", buttonProps: { icon: "operation", type: "" }, permission: "*:*:*" },
  search: { label: "搜索", buttonProps: { icon: "search", type: "" }, permission: "list" },
  view: { label: "查看", buttonProps: { icon: "view", type: "primary" }, permission: "update" },
  edit: { label: "编辑", buttonProps: { icon: "edit", type: "primary" }, permission: "update" },
};

const rowKey = props.tableConfig.rowKey ?? "id";
const permissionPrefix = computed(() => props.tableConfig.permissionPrefix);

/**
 * 有前缀时补全相对权限，完整权限原样保留。
 */
function resolvePermission(permission: string | string[]): string | string[] {
  const resolve = (value: string) =>
    value.includes(":") || !permissionPrefix.value ? value : `${permissionPrefix.value}:${value}`;
  return Array.isArray(permission) ? permission.map(resolve) : resolve(permission);
}

/**
 * 未配置前缀时，单元格编辑不附加内置权限。
 */
function hasActionPermission(action: string): boolean {
  return !permissionPrefix.value || hasPerm(resolvePermission(action));
}

/**
 * 将业务配置合并到内置按钮默认值。
 */
function resolveActions(
  actions: Array<string | CrudAction>,
  buttonProps: CrudAction["buttonProps"] = {},
) {
  return actions.map((item) => {
    const isString = typeof item === "string";
    const key = isString ? item : item.key;
    const defaults = builtInActions[key];
    if (isString && !defaults) throw new Error(`未知内置按钮：${key}`);
    const defaultPermission =
      permissionPrefix.value || defaults?.permission === "*:*:*" ? defaults?.permission : undefined;
    const permission = isString ? defaultPermission : (item.permission ?? defaultPermission);
    if (!permission && permissionPrefix.value) throw new Error(`按钮 ${key} 缺少权限配置`);
    return {
      key,
      label: isString ? defaults.label : (item.label ?? defaults?.label),
      buttonProps: {
        ...buttonProps,
        ...defaults?.buttonProps,
        ...(!isString ? item.buttonProps : {}),
      },
      visible: isString ? true : (item.visible ?? true),
      disabled: isString ? false : (item.disabled ?? false),
      onClick: isString ? undefined : item.onClick,
      permission: permission ? resolvePermission(permission) : null,
    };
  });
}

/**
 * 已合并默认值的按钮配置。
 */
type ResolvedAction = ReturnType<typeof resolveActions>[number];

/**
 * 取得当前行和勾选记录，供按钮条件及回调使用。
 */
function getActionContext(row?: CrudRecord): CrudActionContext {
  return { row, selectedRows: selectedRows.value, selectedKeys: selectedKeys.value };
}

/**
 * 同时检查权限和业务显示条件。
 */
function isActionVisible(button: ResolvedAction, row?: CrudRecord): boolean {
  if (button.permission && !hasPerm(button.permission)) return false;
  return typeof button.visible === "function"
    ? button.visible(getActionContext(row))
    : button.visible;
}

/**
 * 工具栏和各行分别记录动作执行状态。
 */
function getActionKey(button: ResolvedAction, row?: CrudRecord): string {
  return JSON.stringify([row ? row[rowKey] : null, button.key]);
}

/**
 * 判断动作是否正在执行。
 */
function isActionPending(button: ResolvedAction, row?: CrudRecord): boolean {
  return pendingActions.has(getActionKey(button, row));
}

/**
 * 业务配置不能启用正在执行或尚不满足条件的按钮。
 */
function isActionDisabled(button: ResolvedAction, row?: CrudRecord): boolean {
  const disabled =
    typeof button.disabled === "function"
      ? button.disabled(getActionContext(row))
      : button.disabled;
  return (
    !!button.buttonProps.disabled ||
    disabled ||
    isActionPending(button, row) ||
    (!row && button.key === "delete" && selectedKeys.value.length === 0) ||
    (button.key === "export" && (!canExport.value || exporting.value))
  );
}

/**
 * 提供按钮插槽的显示状态和执行方法。
 */
function getActionState(button: ResolvedAction, row?: CrudRecord) {
  return {
    key: button.key,
    label: button.label,
    buttonProps: button.buttonProps,
    disabled: isActionDisabled(button, row),
    loading: isActionPending(button, row),
    run: () => runAction(button, row),
  };
}

/**
 * 先筛选可见动作，再交给操作栏计算折叠数量。
 */
function getRowActions(column: CrudTableConfig["columns"][number], row: CrudRecord) {
  return resolveActions(column.actions ?? ["edit", "delete"], { link: true, size: "small" })
    .filter((action) => isActionVisible(action, row))
    .map((action) => getActionState(action, row));
}

/**
 * 转发行操作插槽，保留原有 row-action 命名。
 */
function getRowActionSlotNames(slots: Slots): string[] {
  return Object.keys(slots).filter((name) => name.startsWith("row-action-"));
}

/**
 * 执行前检查条件，并等待自定义操作完成。
 */
async function runAction(button: ResolvedAction, row?: CrudRecord): Promise<void> {
  if (!isActionVisible(button, row) || isActionDisabled(button, row)) return;
  const key = getActionKey(button, row);
  pendingActions.add(key);
  actionError.value = "";
  try {
    if (button.onClick) await button.onClick(getActionContext(row));
    else if (button.key === "delete" && config.value.deleteByIds)
      await handleDelete(row?.[rowKey], button.permission);
    else if (row) emit("row-action", { key: button.key, row });
    else await handleToolbar(button.key);
  } catch (error) {
    actionError.value = error instanceof Error ? error.message : "操作失败，请重试";
  } finally {
    pendingActions.delete(key);
  }
}

const leftToolbarButtons = computed(() => {
  if (!config.value.toolbarActions || config.value.toolbarActions.length === 0) return [];
  return resolveActions(config.value.toolbarActions, {});
});

const rightToolbarButtons = computed(() => {
  if (!config.value.tableTools || config.value.tableTools.length === 0) return [];
  return resolveActions(config.value.tableTools, { circle: true });
});

const columns = ref(
  props.tableConfig.columns.map((source) => {
    const col = { ...source };
    if (col.hideable === false) col.show = true;
    if (col.show === undefined) {
      col.show = true;
    }
    if (col.prop !== undefined && col.columnKey === undefined && col["column-key"] === undefined) {
      col.columnKey = col.prop;
    }
    if (
      col.type === "selection" &&
      col.reserveSelection === undefined &&
      col["reserve-selection"] === undefined
    ) {
      // 配合表格 row-key 实现跨页多选
      col.reserveSelection = true;
    }
    return col;
  }),
);
const loading = ref(false);
const loadError = ref("");
const actionError = ref("");
columns.value.forEach((column) => {
  if (column.onInit)
    void Promise.resolve()
      .then(() => column.onInit?.(column))
      .catch((error: unknown) => {
        actionError.value = error instanceof Error ? error.message : "列选项加载失败";
      });
});
const pendingActions = reactive(new Set<string>());
const sort = ref<SortExpression[]>();
const initialSort = props.tableConfig.table?.defaultSort;
if (initialSort?.prop && initialSort.order) {
  const column = columns.value.find((col) => col.prop === initialSort.prop);
  if (column?.sortable === "custom")
    sort.value = buildSort(initialSort, column.sortField ?? column.prop);
}
const pageData = ref<CrudRecord[]>([]);
const confirmedRows = new Map<string | number, CrudRecord>();
const pendingCells = reactive(new Set<string>());
const defaultColumnVisibility = columns.value.map((col) => col.show);

/**
 * 只向 Element Plus 传递列属性，保留自有元数据供渲染和请求使用。
 */
function getColumnAttrs(column: CrudTableConfig["columns"][number]): CrudRecord {
  const attrs = { ...column };
  for (const key of [
    "show",
    "hideable",
    "sortField",
    "cellType",
    "actions",
    "maxVisibleActions",
    "slotName",
    "onInit",
    "filterJoin",
    "imageWidth",
    "imageHeight",
    "selectList",
    "activeValue",
    "inactiveValue",
    "activeText",
    "inactiveText",
    "inputType",
    "priceFormat",
    "dateFormat",
  ]) {
    Reflect.deleteProperty(attrs, key);
  }
  return attrs;
}
const showPagination = props.tableConfig.pagination !== false;
const defaultPagination = {
  background: true,
  layout: "total, sizes, prev, pager, next, jumper",
  pageSize: 20,
  pageSizes: [10, 20, 30, 50],
  total: 0,
  currentPage: 1,
};
const pagination = reactive(
  typeof props.tableConfig.pagination === "object"
    ? { ...defaultPagination, ...props.tableConfig.pagination }
    : defaultPagination,
);
const paginationKeys = props.tableConfig.paginationKeys ?? {
  page: "pageNum",
  size: "pageSize",
};

const elementTableRef = ref<TableInstance>();

const selectedRows = ref<CrudRecord[]>([]);
const selectedKeys = ref<(number | string)[]>([]);
/**
 * 更新勾选记录及主键。
 */
function handleSelectionChange(selection: CrudRecord[]) {
  selectedRows.value = selection;
  selectedKeys.value = selection.map(getRowKey);
}

/**
 * 列显隐只修改当前实例，恢复时使用声明初值。
 */
function restoreColumns(): void {
  columns.value.forEach((col, index) => {
    col.show = defaultColumnVisibility[index];
  });
}

/**
 * 同步清理选中行、主键及界面状态。
 */
function clearSelection(): void {
  selectedRows.value = [];
  selectedKeys.value = [];
  elementTableRef.value?.clearSelection();
}

/**
 * 读取当前勾选的记录。
 */
function getSelection() {
  return selectedRows.value;
}

/**
 * 沿用已提交的条件查询，可选择回到第一页。
 */
function refresh(resetPage = false): Promise<void> {
  return loadData(appliedQuery, resetPage);
}

/**
 * 删除指定行或勾选记录，成功后刷新列表。
 */
async function handleDelete(
  id?: number | string,
  permission?: string | string[] | null,
): Promise<void> {
  const ids = id === undefined ? selectedKeys.value.join(",") : String(id);
  if (!ids) return;
  const action = props.tableConfig.deleteByIds;
  if (!action) throw new Error("未配置删除接口");
  const confirmed = await ElMessageBox.confirm("确认删除选中记录？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(
    () => true,
    () => false,
  );
  if (!confirmed || (permission && !hasPerm(permission))) return;
  await action(ids);
  clearSelection();
  ElMessage.success("删除成功");
  // 删除已成功，刷新失败可单独重试。
  await refresh().catch(() => undefined);
}

const fields: string[] = [];
columns.value.forEach((item) => {
  if (item.prop !== undefined && item.cellType !== "actions") {
    fields.push(item.prop);
  }
});
/**
 * 浏览器导出的数据范围。
 */
const enum ExportScope {
  CURRENT = "current",
  SELECTED = "selected",
  ALL = "all",
}
const exportDialogVisible = ref(false);
const exporting = ref(false);
const exportError = ref("");
const exportFormRef = ref<FormInstance>();
const exportForm = reactive({
  fileName: "",
  sheetName: "",
  fields,
  scope: ExportScope.CURRENT,
});
const exportRules: FormRules = {
  fields: [{ required: true, message: "请选择字段" }],
  scope: [{ required: true, message: "请选择数据来源" }],
};

/**
 * 打开浏览器导出表单。
 */
function openExportDialog() {
  exportError.value = "";
  exportDialogVisible.value = true;
}
/**
 * 校验导出配置并生成文件，失败保留弹窗。
 */
async function handleExport(): Promise<void> {
  if (exporting.value) return;
  exporting.value = true;
  exportError.value = "";
  try {
    if (!(await exportFormRef.value?.validate().catch(() => false))) return;
    await exportRows();
    closeExportDialog();
  } catch (error) {
    exportError.value = error instanceof Error ? error.message : "导出失败，请重试";
  } finally {
    exporting.value = false;
  }
}

/**
 * 关闭并重置导出表单。
 */
function closeExportDialog() {
  exportDialogVisible.value = false;
  exportFormRef.value?.resetFields();
  nextTick(() => {
    exportFormRef.value?.clearValidate();
  });
}
/**
 * 按需加载 ExcelJS 并创建工作簿。
 */
async function createWorkbook(): Promise<Workbook> {
  const ExcelJS = await import("exceljs");
  return new ExcelJS.Workbook();
}

/**
 * 按所选字段和数据范围生成 Excel 文件。
 */
async function exportRows(): Promise<void> {
  const query = getExportQuery();
  const fileName = exportForm.fileName || "export";
  const sheetName = exportForm.sheetName || "sheet";
  const exportColumns: Partial<Column>[] = columns.value
    .filter(
      (col) =>
        col.cellType !== "actions" && col.label && col.prop && exportForm.fields.includes(col.prop),
    )
    .map((col) => ({ header: col.label, key: col.prop }));
  const scope = exportForm.scope;
  let rows = cloneDeep(scope === ExportScope.SELECTED ? selectedRows.value : pageData.value);
  if (scope === ExportScope.SELECTED && !rows.length) throw new Error("请先勾选导出记录");
  if (scope === ExportScope.ALL) {
    const action = props.tableConfig.fetchExportRows;
    if (!action) throw new Error("未配置全量导出接口");
    rows = await action(query);
  }
  const workbook = await createWorkbook();
  const worksheet = workbook.addWorksheet(sheetName);
  worksheet.columns = exportColumns;
  worksheet.addRows(rows);
  saveXlsx(await workbook.xlsx.writeBuffer(), fileName);
}

const isFileImport = ref(false);
const uploadRef = ref<UploadInstance>();
const importModalVisible = ref(false);
const importing = ref(false);
const importError = ref("");
const importFormRef = ref<FormInstance>();
const importFormData = reactive<{
  files: UploadUserFile[];
}>({
  files: [],
});
const importFormRules: FormRules = {
  files: [{ required: true, message: "请选择文件" }],
};

/**
 * 打开导入表单，区分文件上传与浏览器解析。
 */
function handleOpenImportModal(isFile: boolean = false) {
  importError.value = "";
  importModalVisible.value = true;
  isFileImport.value = isFile;
}
/**
 * 用新文件替换已选文件。
 */
function handleFileExceed(files: File[]) {
  uploadRef.value!.clearFiles();
  const file = files[0] as UploadRawFile;
  file.uid = genFileId();
  uploadRef.value!.handleStart(file);
}
/**
 * 下载导入模板。
 */
async function handleDownloadTemplate(): Promise<void> {
  const template = props.tableConfig.importTemplate;
  if (typeof template === "string") window.open(template);
  else if (typeof template === "function") downloadFile(await template());
  else ElMessage.error("未配置导入模板");
}

/**
 * 校验后导入文件，成功后刷新列表。
 */
async function handleImportSubmit(): Promise<void> {
  if (importing.value) return;
  importing.value = true;
  importError.value = "";
  try {
    if (!(await importFormRef.value?.validate().catch(() => false))) return;
    const result = isFileImport.value ? await importFile() : await importRows();
    const summary = readImportSummary(result);
    if (summary && summary.invalidCount > 0) {
      importError.value =
        "已导入 " +
        summary.validCount +
        " 条，无效 " +
        summary.invalidCount +
        " 条。请修正后重新选择文件。" +
        summary.messages.slice(0, 5).join("；");
      importFormData.files = [];
      if (summary.validCount > 0) await refresh(true).catch(() => undefined);
      return;
    }
    ElMessage.success("导入成功");
    handleCloseImportModal();
    await refresh(true).catch(() => undefined);
  } catch (error) {
    importError.value = error instanceof Error ? error.message : "导入失败，请重试";
  } finally {
    importing.value = false;
  }
}

/**
 * 关闭并重置导入表单。
 */
function handleCloseImportModal() {
  importModalVisible.value = false;
  importFormRef.value?.resetFields();
  nextTick(() => {
    importFormRef.value?.clearValidate();
  });
}
/**
 * 将原文件交给导入接口处理。
 */
async function importFile(): Promise<unknown> {
  const action = props.tableConfig.importFile;
  if (!action) throw new Error("未配置文件导入接口");
  const file = importFormData.files[0]?.raw;
  if (!file) throw new Error("请选择导入文件");
  return action(file);
}
/**
 * 解析 Excel 首张工作表，将数据行交给导入回调。
 */
async function importRows(): Promise<unknown> {
  const action = props.tableConfig.importRows;
  if (!action) throw new Error("未配置数据导入接口");
  const file = importFormData.files[0]?.raw;
  if (!file) throw new Error("请选择导入文件");
  const workbook = await createWorkbook();
  await workbook.xlsx.load(await file.arrayBuffer());
  const worksheet = workbook.getWorksheet(1);
  if (!worksheet) throw new Error("工作簿没有工作表");
  const rows = parseWorksheetRows(worksheet);
  if (!rows.length) throw new Error("未解析到数据");
  return action(rows);
}
/**
 * 执行内置工具，或发出自定义工具栏事件。
 */
async function handleToolbar(key: string): Promise<void> {
  switch (key) {
    case "refresh":
      await refresh();
      break;
    case "search":
      emit("toggle-search");
      break;
    case "create":
      emit("create");
      break;
    case "delete":
      await handleDelete();
      break;
    case "import":
      if (config.value.importFile && config.value.importRows && !config.value.importMode)
        throw new Error("同时配置两种导入回调时，请指定 importMode");
      handleOpenImportModal(
        config.value.importMode ? config.value.importMode === "file" : !!config.value.importFile,
      );
      break;
    case "export":
      if (config.value.exportFile && config.value.fetchExportRows && !config.value.exportMode)
        throw new Error("同时配置两种导出回调时，请指定 exportMode");
      if (config.value.exportMode ? config.value.exportMode === "file" : !!config.value.exportFile)
        await exportFile();
      else openExportDialog();
      break;
    default:
      emit("toolbar-action", key);
      break;
  }
}

/**
 * 保存单元格修改，失败时回滚未刷新的记录。
 */
async function handleModify(
  field: string,
  value: boolean | string | number,
  row: CrudRecord,
): Promise<void> {
  const id = getRowKey(row);
  const original = confirmedRows.get(id);
  if (!original || Object.is(original[field], value) || isCellDisabled(row, field)) return;
  const action = props.tableConfig.updateField;
  if (!action) return;
  const key = JSON.stringify([id, field]);
  pendingCells.add(key);
  actionError.value = "";
  try {
    await action({ [rowKey]: id, field, value });
    if (confirmedRows.get(id) === original) {
      original[field] = cloneDeep(value);
      row[field] = cloneDeep(value);
    }
  } catch (error) {
    if (confirmedRows.get(id) === original && pageData.value.includes(row))
      row[field] = cloneDeep(original[field]);
    actionError.value = error instanceof Error ? error.message : "修改失败，请重试";
  } finally {
    pendingCells.delete(key);
  }
}

/**
 * 读取字符串或数字主键，缺失时抛错。
 */
function getRowKey(row: CrudRecord): string | number {
  const value: unknown = row[rowKey];
  if (typeof value === "string" || typeof value === "number") return value;
  throw new Error("列表记录缺少有效主键：" + rowKey);
}

/**
 * 配置保存接口且有更新权限时允许编辑，保存中禁用。
 */
function isCellDisabled(row: CrudRecord, field: string): boolean {
  return (
    !props.tableConfig.updateField ||
    !hasActionPermission("update") ||
    pendingCells.has(JSON.stringify([getRowKey(row), field]))
  );
}

/**
 * 切换每页条数并回到第一页。
 */
function handleSizeChange(value: number) {
  pagination.pageSize = value;
  void refresh(true).catch(() => undefined);
}
/**
 * 切换页码并查询列表。
 */
function handleCurrentChange(value: number) {
  pagination.currentPage = value;
  void refresh().catch(() => undefined);
}

let filterParams: CrudRecord = {};
/**
 * 转换表头筛选值；清空的列从累计条件中删除，再通知页面应用筛选。
 */
function handleFilterChange(newFilters: Record<string, (string | number | boolean)[]>) {
  for (const key in newFilters) {
    const values = newFilters[key];
    if (!values || values.length === 0) {
      Reflect.deleteProperty(filterParams, key);
      continue;
    }
    const col = columns.value.find((col) => {
      return col.columnKey === key || col["column-key"] === key;
    });
    filterParams[key] = col && col.filterJoin !== undefined ? values.join(col.filterJoin) : values;
  }
  emit("filter-change", { ...filterParams });
}

/**
 * 读取已转换的表头筛选条件。
 */
function getFilters() {
  return filterParams;
}

let appliedQuery: CrudRecord = {};
let lastSuccessfulQuery: CrudRecord | undefined;
let pageSequence = 0;
const canExport = computed(
  () => !loading.value && !loadError.value && lastSuccessfulQuery !== undefined,
);
onScopeDispose(() => {
  pageSequence += 1;
});

/**
 * 仅最新响应回填列表，成功查询同时记录导出所用条件。
 */
async function loadData(query: CrudRecord = appliedQuery, resetPage = false): Promise<void> {
  const sequence = ++pageSequence;
  loading.value = true;
  loadError.value = "";
  appliedQuery = cloneDeep(query);
  if (resetPage) {
    pagination.currentPage = 1;
    clearSelection();
  }
  const params = {
    ...cloneDeep(query),
    ...cloneDeep(getFilters()),
    ...(showPagination
      ? {
          [paginationKeys.page]: pagination.currentPage,
          [paginationKeys.size]: pagination.pageSize,
        }
      : {}),
  };
  if (sort.value) params.sort = [...sort.value];
  else Reflect.deleteProperty(params, "sort");
  try {
    const data = await props.tableConfig.fetchData(params);
    if (sequence !== pageSequence) return;
    const rows = Array.isArray(data) ? data : data?.list;
    const total = Array.isArray(data) ? data.length : data?.total;
    if (!Array.isArray(rows) || !Number.isInteger(total) || total < 0)
      throw new Error("请在 fetchData 中将接口结果转换为数组或 { list, total }");
    const maxPage = Math.max(1, Math.ceil(total / pagination.pageSize));
    if (showPagination && pagination.currentPage > maxPage) {
      pagination.currentPage = maxPage;
      await loadData(query);
      return;
    }
    pageData.value = rows;
    pagination.total = total;
    confirmedRows.clear();
    pageData.value.forEach((row) => confirmedRows.set(getRowKey(row), cloneDeep(row)));
    lastSuccessfulQuery = cloneDeep(params);
  } catch (error) {
    if (sequence === pageSequence)
      loadError.value = error instanceof Error ? error.message : "列表加载失败";
    throw error;
  } finally {
    if (sequence === pageSequence) loading.value = false;
  }
}

/**
 * 读取上次成功查询的条件，去除分页参数。
 */
function getExportQuery(): CrudRecord {
  if (!canExport.value || !lastSuccessfulQuery) throw new Error("请先成功加载列表再导出");
  const params = cloneDeep(lastSuccessfulQuery);
  Reflect.deleteProperty(params, paginationKeys.page);
  Reflect.deleteProperty(params, paginationKeys.size);
  return params;
}

/**
 * 服务端导出期间禁止重复请求。
 */
async function exportFile(): Promise<void> {
  if (exporting.value) return;
  const action = props.tableConfig.exportFile;
  if (!action) throw new Error("未配置文件导出接口");
  const params = getExportQuery();
  exporting.value = true;
  try {
    downloadFile(await action(params));
  } finally {
    exporting.value = false;
  }
}

/**
 * 应用远程排序；本地排序保留 Element Plus 原有行为。
 */
async function handleSortChange(state: TableSort): Promise<void> {
  const column = columns.value.find((col) => col.prop === state.prop);
  if (column?.sortable !== "custom" && !(state.order === null && sort.value)) return;
  sort.value = buildSort(state, column?.sortField ?? state.prop);
  await refresh(true).catch(() => undefined);
}

/**
 * 清除表头筛选和内部条件，不发起查询。
 */
function clearFilters(): void {
  filterParams = {};
  elementTableRef.value?.clearFilter();
}

if (props.autoLoad !== false) void loadData().catch(() => undefined);

/**
 * 将工作簿保存为 .xlsx 文件。
 */
function saveXlsx(fileData: BlobPart, fileName: string): void {
  downloadFile({ data: fileData }, fileName.endsWith(".xlsx") ? fileName : fileName + ".xlsx");
}

defineExpose({
  loadData,
  exportFile,
  getFilters,
  getSelection,
  getExportQuery,
  refresh,
  clearFilters,
});
</script>

<style lang="scss" scoped>
.toolbar-left,
.toolbar-right {
  .el-button {
    margin-right: 0 !important;
    margin-left: 0 !important;
  }
}
</style>
