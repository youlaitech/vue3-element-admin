<template>
  <div
    class="rounded bg-[var(--el-bg-color)] border border-[var(--el-border-color)] p-5 h-full md:flex flex-1 flex-col md:overflow-auto"
  >
    <!-- 表格工具栏 -->
    <div class="flex flex-col md:flex-row justify-between gap-y-2.5 mb-2.5">
      <!-- 左侧工具栏 -->
      <div class="toolbar-left flex gap-y-2.5 gap-x-2 md:gap-x-3 flex-wrap">
        <template v-for="(btn, index) in toolbarLeftBtn" :key="index">
          <el-button
            v-hasPerm="btn.perm ?? '*:*:*'"
            v-bind="btn.attrs"
            :disabled="btn.name === 'delete' && removeIds.length === 0"
            @click="handleToolbar(btn.name)"
          >
            {{ btn.text }}
          </el-button>
        </template>
      </div>
      <!-- 右侧工具栏 -->
      <div class="toolbar-right flex gap-y-2.5 gap-x-2 md:gap-x-3 flex-wrap">
        <template v-for="(btn, index) in toolbarRightBtn" :key="index">
          <el-popover v-if="btn.name === 'filter'" placement="bottom" trigger="click">
            <template #reference>
              <el-button v-bind="btn.attrs"></el-button>
            </template>
            <el-scrollbar max-height="350px">
              <template v-for="col in cols" :key="col.prop">
                <el-checkbox v-if="col.prop" v-model="col.show" :label="col.label" />
              </template>
            </el-scrollbar>
          </el-popover>
          <el-button
            v-else
            v-hasPerm="btn.perm ?? '*:*:*'"
            v-bind="btn.attrs"
            @click="handleToolbar(btn.name)"
          ></el-button>
        </template>
      </div>
    </div>

    <!-- 列表 -->
    <el-table
      ref="tableRef"
      v-loading="loading"
      v-bind="contentConfig.table"
      :data="pageData"
      :row-key="pk"
      class="flex-1"
      @selection-change="handleSelectionChange"
      @filter-change="handleFilterChange"
    >
      <template v-for="col in cols" :key="col.prop">
        <el-table-column v-if="col.show" v-bind="col">
          <template #default="scope">
            <!-- 显示图片 -->
            <template v-if="col.templet === 'image'">
              <template v-if="col.prop">
                <template v-if="Array.isArray(scope.row[col.prop])">
                  <template v-for="(item, index) in scope.row[col.prop]" :key="item">
                    <el-image
                      :src="item"
                      :preview-src-list="scope.row[col.prop]"
                      :initial-index="index"
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
            <!-- 根据行的selectList属性返回对应列表值 -->
            <template v-else-if="col.templet === 'list'">
              <template v-if="col.prop">
                {{ (col.selectList ?? {})[scope.row[col.prop]] }}
              </template>
            </template>
            <!-- 格式化显示链接 -->
            <template v-else-if="col.templet === 'url'">
              <template v-if="col.prop">
                <el-link type="primary" :href="scope.row[col.prop]" target="_blank">
                  {{ scope.row[col.prop] }}
                </el-link>
              </template>
            </template>
            <!-- 生成开关组件 -->
            <template v-else-if="col.templet === 'switch'">
              <template v-if="col.prop">
                <!-- pageData.length>0: 解决el-switch组件会在表格初始化的时候触发一次change事件 -->
                <el-switch
                  v-model="scope.row[col.prop]"
                  :active-value="col.activeValue ?? 1"
                  :inactive-value="col.inactiveValue ?? 0"
                  :inline-prompt="true"
                  :active-text="col.activeText ?? ''"
                  :inactive-text="col.inactiveText ?? ''"
                  :validate-event="false"
                  :disabled="!hasButtonPerm(col.prop)"
                  @change="
                    pageData.length > 0 && handleModify(col.prop, scope.row[col.prop], scope.row)
                  "
                />
              </template>
            </template>
            <!-- 生成输入框组件 -->
            <template v-else-if="col.templet === 'input'">
              <template v-if="col.prop">
                <el-input
                  v-model="scope.row[col.prop]"
                  :type="col.inputType ?? 'text'"
                  :disabled="!hasButtonPerm(col.prop)"
                  @blur="handleModify(col.prop, scope.row[col.prop], scope.row)"
                />
              </template>
            </template>
            <!-- 格式化为价格 -->
            <template v-else-if="col.templet === 'price'">
              <template v-if="col.prop">
                {{ `${col.priceFormat ?? "￥"}${scope.row[col.prop]}` }}
              </template>
            </template>
            <!-- 格式化为百分比 -->
            <template v-else-if="col.templet === 'percent'">
              <template v-if="col.prop">{{ scope.row[col.prop] }}%</template>
            </template>
            <!-- 显示图标 -->
            <template v-else-if="col.templet === 'icon'">
              <template v-if="col.prop">
                <template v-if="scope.row[col.prop].startsWith('el-icon-')">
                  <el-icon>
                    <component :is="scope.row[col.prop].replace('el-icon-', '')" />
                  </el-icon>
                </template>
                <template v-else>
                  <div class="i-svg:{{ scope.row[col.prop] }}" />
                </template>
              </template>
            </template>
            <!-- 格式化时间 -->
            <template v-else-if="col.templet === 'date'">
              <template v-if="col.prop">
                {{
                  scope.row[col.prop]
                    ? useDateFormat(scope.row[col.prop], col.dateFormat ?? "YYYY-MM-DD HH:mm:ss")
                        .value
                    : ""
                }}
              </template>
            </template>
            <!-- 列操作栏 -->
            <template v-else-if="col.templet === 'tool'">
              <template v-for="(btn, index) in tableToolbarBtn" :key="index">
                <el-button
                  v-if="btn.render === undefined || btn.render(scope.row)"
                  v-hasPerm="btn.perm ?? '*:*:*'"
                  v-bind="btn.attrs"
                  @click="
                    handleOperate({
                      name: btn.name,
                      row: scope.row,
                      column: scope.column,
                      $index: scope.$index,
                    })
                  "
                >
                  {{ btn.text }}
                </el-button>
              </template>
            </template>
            <!-- 自定义 -->
            <template v-else-if="col.templet === 'custom'">
              <slot :name="col.slotName ?? col.prop" :prop="col.prop" v-bind="scope" />
            </template>
          </template>
        </el-table-column>
      </template>
    </el-table>

    <!-- 分页 -->
    <div v-if="showPagination" class="mt-4">
      <el-scrollbar :class="['h-8!', { 'flex-x-end': contentConfig?.pagePosition === 'right' }]">
        <el-pagination
          v-bind="pagination"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </el-scrollbar>
    </div>

    <!-- 导出弹窗 -->
    <el-dialog
      v-model="exportsModalVisible"
      :align-center="true"
      title="导出数据"
      width="600px"
      style="padding-right: 0"
      @close="handleCloseExportsModal"
    >
      <!-- 滚动 -->
      <el-scrollbar max-height="60vh">
        <!-- 表单 -->
        <el-form
          ref="exportsFormRef"
          style="padding-right: var(--el-dialog-padding-primary)"
          :model="exportsFormData"
          :rules="exportsFormRules"
        >
          <el-form-item label="文件名" prop="filename">
            <el-input v-model="exportsFormData.filename" clearable />
          </el-form-item>
          <el-form-item label="工作表名" prop="sheetname">
            <el-input v-model="exportsFormData.sheetname" clearable />
          </el-form-item>
          <el-form-item label="数据源" prop="origin">
            <el-select v-model="exportsFormData.origin">
              <el-option label="当前数据 (当前页的数据)" :value="ExportsOriginEnum.CURRENT" />
              <el-option
                label="选中数据 (所有选中的数据)"
                :value="ExportsOriginEnum.SELECTED"
                :disabled="selectionData.length <= 0"
              />
              <el-option
                label="全量数据 (所有分页的数据)"
                :value="ExportsOriginEnum.REMOTE"
                :disabled="contentConfig.exportsAction === undefined"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="字段" prop="fields">
            <el-checkbox-group v-model="exportsFormData.fields">
              <template v-for="col in cols" :key="col.prop">
                <el-checkbox v-if="col.prop" :value="col.prop" :label="col.label" />
              </template>
            </el-checkbox-group>
          </el-form-item>
        </el-form>
      </el-scrollbar>
      <!-- 弹窗底部操作按钮 -->
      <template #footer>
        <div style="padding-right: var(--el-dialog-padding-primary)">
          <el-button type="primary" @click="handleExportsSubmit">确 定</el-button>
          <el-button @click="handleCloseExportsModal">取 消</el-button>
        </div>
      </template>
    </el-dialog>
    <!-- 导入弹窗 -->
    <el-dialog
      v-model="importModalVisible"
      :align-center="true"
      title="导入数据"
      width="600px"
      style="padding-right: 0"
      @close="handleCloseImportModal"
    >
      <!-- 滚动 -->
      <el-scrollbar max-height="60vh">
        <!-- 表单 -->
        <el-form
          ref="importFormRef"
          style="padding-right: var(--el-dialog-padding-primary)"
          :model="importFormData"
          :rules="importFormRules"
        >
          <el-form-item label="文件名" prop="files">
            <el-upload
              ref="uploadRef"
              v-model:file-list="importFormData.files"
              class="w-full"
              accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
              :drag="true"
              :limit="1"
              :auto-upload="false"
              :on-exceed="handleFileExceed"
            >
              <el-icon class="el-icon--upload"><upload-filled /></el-icon>
              <div class="el-upload__text">
                <span>将文件拖到此处，或</span>
                <em>点击上传</em>
              </div>
              <template #tip>
                <div class="el-upload__tip">
                  *.xlsx / *.xls
                  <el-link
                    v-if="contentConfig.importTemplate"
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
      <!-- 弹窗底部操作按钮 -->
      <template #footer>
        <div style="padding-right: var(--el-dialog-padding-primary)">
          <el-button
            type="primary"
            :disabled="importFormData.files.length === 0"
            @click="handleImportSubmit"
          >
            确 定
          </el-button>
          <el-button @click="handleCloseImportModal">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { hasAuth } from "@/plugins/permission";
import { useDateFormat, useThrottleFn } from "@vueuse/core";
import {
  genFileId,
  type FormInstance,
  type FormRules,
  type UploadInstance,
  type UploadRawFile,
  type UploadUserFile,
  type TableInstance,
} from "element-plus";
import ExcelJS from "exceljs";
import { reactive, ref, computed } from "vue";
import type { IContentConfig, IObject, IOperateData } from "./types";
import type { IToolsButton } from "./types";

// 定义接收的属性
const props = defineProps<{ contentConfig: IContentConfig }>();
// 定义自定义事件
const emit = defineEmits<{
  addClick: [];
  exportClick: [];
  searchClick: [];
  toolbarClick: [name: string];
  editClick: [row: IObject];
  filterChange: [data: IObject];
  operateClick: [data: IOperateData];
}>();

// 表格工具栏按钮配置
const config = computed(() => props.contentConfig);
const buttonConfig = reactive<Record<string, IObject>>({
  add: { text: "新增", attrs: { icon: "plus", type: "success" }, perm: "add" },
  delete: { text: "删除", attrs: { icon: "delete", type: "danger" }, perm: "delete" },
  import: { text: "导入", attrs: { icon: "upload", type: "" }, perm: "import" },
  export: { text: "导出", attrs: { icon: "download", type: "" }, perm: "export" },
  refresh: { text: "刷新", attrs: { icon: "refresh", type: "" }, perm: "*:*:*" },
  filter: { text: "筛选列", attrs: { icon: "operation", type: "" }, perm: "*:*:*" },
  search: { text: "搜索", attrs: { icon: "search", type: "" }, perm: "search" },
  imports: { text: "批量导入", attrs: { icon: "upload", type: "" }, perm: "imports" },
  exports: { text: "批量导出", attrs: { icon: "download", type: "" }, perm: "exports" },
  view: { text: "查看", attrs: { icon: "view", type: "primary" }, perm: "view" },
  edit: { text: "编辑", attrs: { icon: "edit", type: "primary" }, perm: "edit" },
});

// 主键
const pk = props.contentConfig.pk ?? "id";
// 权限名称前缀
const authPrefix = computed(() => props.contentConfig.permPrefix);

// 获取按钮权限标识
function getButtonPerm(action: string): string | null {
  // 如果action已经包含完整路径(包含冒号)，则直接使用
  if (action.includes(":")) {
    return action;
  }
  // 否则使用权限前缀组合
  return authPrefix.value ? `${authPrefix.value}:${action}` : null;
}

// 检查是否有权限
function hasButtonPerm(action: string): boolean {
  const perm = getButtonPerm(action);
  // 如果没有设置权限标识，则默认具有权限
  if (!perm) return true;
  return hasAuth(perm);
}

// 创建工具栏按钮
function createToolbar(toolbar: Array<string | IToolsButton>, attr = {}) {
  return toolbar.map((item) => {
    const isString = typeof item === "string";
    return {
      name: isString ? item : item?.name || "",
      text: isString ? buttonConfig[item].text : item?.text,
      attrs: {
        ...attr,
        ...(isString ? buttonConfig[item].attrs : item?.attrs),
      },
      render: isString ? undefined : (item?.render ?? undefined),
      perm: isString
        ? getButtonPerm(buttonConfig[item].perm)
        : item?.perm
          ? getButtonPerm(item.perm as string)
          : "*:*:*",
    };
  });
}

// 左侧工具栏按钮
const toolbarLeftBtn = computed(() => {
  if (!config.value.toolbar || config.value.toolbar.length === 0) return [];
  return createToolbar(config.value.toolbar, {});
});

// 右侧工具栏按钮
const toolbarRightBtn = computed(() => {
  if (!config.value.defaultToolbar || config.value.defaultToolbar.length === 0) return [];
  return createToolbar(config.value.defaultToolbar, { circle: true });
});

// 表格操作工具栏
const tableToolbar = config.value.cols[config.value.cols.length - 1].operat ?? ["edit", "delete"];
const tableToolbarBtn = createToolbar(tableToolbar, { link: true, size: "small" });

// 表格列
const cols = ref(
  props.contentConfig.cols.map((col) => {
    if (col.initFn) {
      col.initFn(col);
    }
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
      // 配合表格row-key实现跨页多选
      col.reserveSelection = true;
    }
    return col;
  })
);
// 加载状态
const loading = ref(false);
// 列表数据
const pageData = ref<IObject[]>([]);
// 显示分页
const showPagination = props.contentConfig.pagination !== false;
// 分页配置
const defaultPagination = {
  background: true,
  layout: "total, sizes, prev, pager, next, jumper",
  pageSize: 20,
  pageSizes: [10, 20, 30, 50],
  total: 0,
  currentPage: 1,
};
const pagination = reactive(
  typeof props.contentConfig.pagination === "object"
    ? { ...defaultPagination, ...props.contentConfig.pagination }
    : defaultPagination
);
// 分页相关的请求参数
const request = props.contentConfig.request ?? {
  pageName: "pageNum",
  limitName: "pageSize",
};

const tableRef = ref<TableInstance>();

// 行选中
const selectionData = ref<IObject[]>([]);
// 删除ID集合 用于批量删除
const removeIds = ref<(number | string)[]>([]);
function handleSelectionChange(selection: any[]) {
  selectionData.value = selection;
  removeIds.value = selection.map((item) => item[pk]);
}

// 获取行选中
function getSelectionData() {
  return selectionData.value;
}

// 刷新
function handleRefresh(isRestart = false) {
  fetchPageData(lastFormData, isRestart);
}

// 删除
function handleDelete(id?: number | string) {
  const ids = [id || removeIds.value].join(",");
  if (!ids) {
    ElMessage.warning("请勾选删除项");
    return;
  }

  ElMessageBox.confirm("确认删除?", "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(function () {
      if (props.contentConfig.deleteAction) {
        props.contentConfig
          .deleteAction(ids)
          .then(() => {
            ElMessage.success("删除成功");
            removeIds.value = [];
            //清空选中项
            tableRef.value?.clearSelection();
            handleRefresh(true);
          })
          .catch(() => {});
      } else {
        ElMessage.error("未配置deleteAction");
      }
    })
    .catch(() => {});
}

// 导出表单
const fields: string[] = [];
cols.value.forEach((item) => {
  if (item.prop !== undefined) {
    fields.push(item.prop);
  }
});
const enum ExportsOriginEnum {
  CURRENT = "current",
  SELECTED = "selected",
  REMOTE = "remote",
}
const exportsModalVisible = ref(false);
const exportsFormRef = ref<FormInstance>();
const exportsFormData = reactive({
  filename: "",
  sheetname: "",
  fields,
  origin: ExportsOriginEnum.CURRENT,
});
const exportsFormRules: FormRules = {
  fields: [{ required: true, message: "请选择字段" }],
  origin: [{ required: true, message: "请选择数据源" }],
};
// 打开导出弹窗
function handleOpenExportsModal() {
  exportsModalVisible.value = true;
}
// 导出确认
const handleExportsSubmit = useThrottleFn(() => {
  exportsFormRef.value?.validate((valid: boolean) => {
    if (valid) {
      handleExports();
      handleCloseExportsModal();
    }
  });
}, 3000);
// 关闭导出弹窗
function handleCloseExportsModal() {
  exportsModalVisible.value = false;
  exportsFormRef.value?.resetFields();
  nextTick(() => {
    exportsFormRef.value?.clearValidate();
  });
}
// 导出
function handleExports() {
  const filename = exportsFormData.filename
    ? exportsFormData.filename
    : props.contentConfig.permPrefix || "export";
  const sheetname = exportsFormData.sheetname ? exportsFormData.sheetname : "sheet";
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetname);
  const columns: Partial<ExcelJS.Column>[] = [];
  cols.value.forEach((col) => {
    if (col.label && col.prop && exportsFormData.fields.includes(col.prop)) {
      columns.push({ header: col.label, key: col.prop });
    }
  });
  worksheet.columns = columns;
  if (exportsFormData.origin === ExportsOriginEnum.REMOTE) {
    if (props.contentConfig.exportsAction) {
      props.contentConfig.exportsAction(lastFormData).then((res) => {
        worksheet.addRows(res);
        workbook.xlsx
          .writeBuffer()
          .then((buffer) => {
            saveXlsx(buffer, filename as string);
          })
          .catch((error) => console.log(error));
      });
    } else {
      ElMessage.error("未配置exportsAction");
    }
  } else {
    worksheet.addRows(
      exportsFormData.origin === ExportsOriginEnum.SELECTED ? selectionData.value : pageData.value
    );
    workbook.xlsx
      .writeBuffer()
      .then((buffer) => {
        saveXlsx(buffer, filename as string);
      })
      .catch((error) => console.log(error));
  }
}

// 导入表单
let isFileImport = false;
const uploadRef = ref<UploadInstance>();
const importModalVisible = ref(false);
const importFormRef = ref<FormInstance>();
const importFormData = reactive<{
  files: UploadUserFile[];
}>({
  files: [],
});
const importFormRules: FormRules = {
  files: [{ required: true, message: "请选择文件" }],
};
// 打开导入弹窗
function handleOpenImportModal(isFile: boolean = false) {
  importModalVisible.value = true;
  isFileImport = isFile;
}
// 覆盖前一个文件
function handleFileExceed(files: File[]) {
  uploadRef.value!.clearFiles();
  const file = files[0] as UploadRawFile;
  file.uid = genFileId();
  uploadRef.value!.handleStart(file);
}
// 下载导入模板
function handleDownloadTemplate() {
  const importTemplate = props.contentConfig.importTemplate;
  if (typeof importTemplate === "string") {
    window.open(importTemplate);
  } else if (typeof importTemplate === "function") {
    importTemplate().then((response) => {
      const fileData = response.data;
      const fileName = decodeURI(
        response.headers["content-disposition"].split(";")[1].split("=")[1]
      );
      saveXlsx(fileData, fileName);
    });
  } else {
    ElMessage.error("未配置importTemplate");
  }
}
// 导入确认
const handleImportSubmit = useThrottleFn(() => {
  importFormRef.value?.validate((valid: boolean) => {
    if (valid) {
      if (isFileImport) {
        handleImport();
      } else {
        handleImports();
      }
    }
  });
}, 3000);
// 关闭导入弹窗
function handleCloseImportModal() {
  importModalVisible.value = false;
  importFormRef.value?.resetFields();
  nextTick(() => {
    importFormRef.value?.clearValidate();
  });
}
// 文件导入
function handleImport() {
  const importAction = props.contentConfig.importAction;
  if (importAction === undefined) {
    ElMessage.error("未配置importAction");
    return;
  }
  importAction(importFormData.files[0].raw as File).then(() => {
    ElMessage.success("导入数据成功");
    handleCloseImportModal();
    handleRefresh(true);
  });
}
// 导入
function handleImports() {
  const importsAction = props.contentConfig.importsAction;
  if (importsAction === undefined) {
    ElMessage.error("未配置importsAction");
    return;
  }
  // 获取选择的文件
  const file = importFormData.files[0].raw as File;
  // 创建Workbook实例
  const workbook = new ExcelJS.Workbook();
  // 使用FileReader对象来读取文件内容
  const fileReader = new FileReader();
  // 二进制字符串的形式加载文件
  fileReader.readAsArrayBuffer(file);
  fileReader.onload = (ev) => {
    if (ev.target !== null && ev.target.result !== null) {
      const result = ev.target.result as ArrayBuffer;
      // 从 buffer中加载数据解析
      workbook.xlsx
        .load(result)
        .then((workbook) => {
          // 解析后的数据
          const data = [];
          // 获取第一个worksheet内容
          const worksheet = workbook.getWorksheet(1);
          if (worksheet) {
            // 获取第一行的标题
            const fields: any[] = [];
            worksheet.getRow(1).eachCell((cell) => {
              fields.push(cell.value);
            });
            // 遍历工作表的每一行（从第二行开始，因为第一行通常是标题行）
            for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
              const rowData: IObject = {};
              const row = worksheet.getRow(rowNumber);
              // 遍历当前行的每个单元格
              row.eachCell((cell, colNumber) => {
                // 获取标题对应的键，并将当前单元格的值存储到相应的属性名中
                rowData[fields[colNumber - 1]] = cell.value;
              });
              // 将当前行的数据对象添加到数组中
              data.push(rowData);
            }
          }
          if (data.length === 0) {
            ElMessage.error("未解析到数据");
            return;
          }
          importsAction(data).then(() => {
            ElMessage.success("导入数据成功");
            handleCloseImportModal();
            handleRefresh(true);
          });
        })
        .catch((error) => console.log(error));
    } else {
      ElMessage.error("读取文件失败");
    }
  };
}

// 操作栏
function handleToolbar(name: string) {
  switch (name) {
    case "refresh":
      handleRefresh();
      break;
    case "exports":
      handleOpenExportsModal();
      break;
    case "imports":
      handleOpenImportModal();
      break;
    case "search":
      emit("searchClick");
      break;
    case "add":
      emit("addClick");
      break;
    case "delete":
      handleDelete();
      break;
    case "import":
      handleOpenImportModal(true);
      break;
    case "export":
      emit("exportClick");
      break;
    default:
      emit("toolbarClick", name);
      break;
  }
}

// 操作列
function handleOperate(data: IOperateData) {
  switch (data.name) {
    case "delete":
      if (props.contentConfig?.deleteAction) {
        handleDelete(data.row[pk]);
      } else {
        emit("operateClick", data);
      }
      break;
    default:
      emit("operateClick", data);
      break;
  }
}

// 属性修改
function handleModify(field: string, value: boolean | string | number, row: Record<string, any>) {
  if (props.contentConfig.modifyAction) {
    props.contentConfig.modifyAction({
      [pk]: row[pk],
      field,
      value,
    });
  } else {
    ElMessage.error("未配置modifyAction");
  }
}

// 分页切换
function handleSizeChange(value: number) {
  pagination.pageSize = value;
  handleRefresh();
}
function handleCurrentChange(value: number) {
  pagination.currentPage = value;
  handleRefresh();
}

// 远程数据筛选
let filterParams: IObject = {};
function handleFilterChange(newFilters: any) {
  const filters: IObject = {};
  for (const key in newFilters) {
    const col = cols.value.find((col) => {
      return col.columnKey === key || col["column-key"] === key;
    });
    if (col && col.filterJoin !== undefined) {
      filters[key] = newFilters[key].join(col.filterJoin);
    } else {
      filters[key] = newFilters[key];
    }
  }
  filterParams = { ...filterParams, ...filters };
  emit("filterChange", filterParams);
}

// 获取筛选条件
function getFilterParams() {
  return filterParams;
}

// 获取分页数据
let lastFormData = {};
function fetchPageData(formData: IObject = {}, isRestart = false) {
  loading.value = true;
  // 上一次搜索条件
  lastFormData = formData;
  // 重置页码
  if (isRestart) {
    pagination.currentPage = 1;
  }
  props.contentConfig
    .indexAction(
      showPagination
        ? {
            [request.pageName]: pagination.currentPage,
            [request.limitName]: pagination.pageSize,
            ...formData,
          }
        : formData
    )
    .then((data) => {
      if (showPagination) {
        if (props.contentConfig.parseData) {
          data = props.contentConfig.parseData(data);
        }
        pagination.total = data.total;
        pageData.value = data.list;
      } else {
        pageData.value = data;
      }
    })
    .finally(() => {
      loading.value = false;
    });
}
fetchPageData();

// 导出Excel
function exportPageData(formData: IObject = {}) {
  if (props.contentConfig.exportAction) {
    props.contentConfig.exportAction(formData).then((response) => {
      const fileData = response.data;
      const fileName = decodeURI(
        response.headers["content-disposition"].split(";")[1].split("=")[1]
      );
      saveXlsx(fileData, fileName);
    });
  } else {
    ElMessage.error("未配置exportAction");
  }
}

// 浏览器保存文件
function saveXlsx(fileData: any, fileName: string) {
  const fileType =
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8";

  const blob = new Blob([fileData], { type: fileType });
  const downloadUrl = window.URL.createObjectURL(blob);

  const downloadLink = document.createElement("a");
  downloadLink.href = downloadUrl;
  downloadLink.download = fileName;

  document.body.appendChild(downloadLink);
  downloadLink.click();

  document.body.removeChild(downloadLink);
  window.URL.revokeObjectURL(downloadUrl);
}

// 暴露的属性和方法
defineExpose({ fetchPageData, exportPageData, getFilterParams, getSelectionData, handleRefresh });
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
