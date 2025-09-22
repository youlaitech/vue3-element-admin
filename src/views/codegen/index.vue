<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <div class="search-container">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item prop="keywords" label="关键字">
          <el-input
            v-model="queryParams.keywords"
            placeholder="表名"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>

        <el-form-item class="search-buttons">
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
    </div>

    <el-card shadow="hover" class="table-card">
      <el-table
        ref="dataTableRef"
        v-loading="loading"
        :data="pageData"
        highlight-current-row
        border
        class="data-table__content"
      >
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
              @click="handleOpenDialog(scope.row.tableName)"
            >
              <template #icon>
                <MagicStick />
              </template>
              生成代码
            </el-button>

            <el-button
              v-if="scope.row.isConfigured === 1"
              type="danger"
              size="small"
              link
              @click="handleResetConfig(scope.row.tableName)"
            >
              <template #icon>
                <RefreshLeft />
              </template>
              重置配置
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination
        v-if="total > 0"
        v-model:total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="handleQuery"
      />
    </el-card>

    <el-drawer
      v-model="dialog.visible"
      :title="dialog.title"
      size="80%"
      @close="dialog.visible = false"
    >
      <el-steps :active="active" align-center finish-status="success" simple>
        <el-step title="基础配置" />
        <el-step title="字段配置" />
        <el-step title="预览生成" />
      </el-steps>

      <div class="mt-5">
        <el-form
          v-show="active == 0"
          :model="genConfigFormData"
          :label-width="100"
          :rules="genConfigFormRules"
        >
          <el-row>
            <el-col :span="12">
              <el-form-item label="表名" prop="tableName">
                <el-input v-model="genConfigFormData.tableName" readonly />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="业务名" prop="businessName">
                <el-input v-model="genConfigFormData.businessName" placeholder="用户" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="12">
              <el-form-item label="主包名" prop="packageName">
                <el-input v-model="genConfigFormData.packageName" placeholder="com.youlai.boot" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="模块名" prop="moduleName">
                <el-input v-model="genConfigFormData.moduleName" placeholder="system" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="12">
              <el-form-item label="实体名" prop="entityName">
                <el-input v-model="genConfigFormData.entityName" placeholder="User" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="作者">
                <el-input v-model="genConfigFormData.author" placeholder="youlai" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="12">
              <el-form-item label="移除表前缀">
                <el-input v-model="genConfigFormData.removeTablePrefix" placeholder="如: sys_" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="页面类型">
                <el-radio-group v-model="genConfigFormData.pageType">
                  <el-radio-button label="classic">普通</el-radio-button>
                  <el-radio-button label="curd">封装(CURD)</el-radio-button>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="12">
              <el-form-item>
                <template #label>
                  <div class="flex-y-between">
                    <span>上级菜单</span>
                    <el-tooltip effect="dark">
                      <template #content>
                        选择上级菜单，生成代码后会自动创建对应菜单。
                        <br />
                        注意1：生成菜单后需分配权限给角色，否则菜单将无法显示。
                        <br />
                        注意2：演示环境默认不生成菜单，如需生成，请在本地部署数据库。
                      </template>
                      <el-icon class="cursor-pointer">
                        <QuestionFilled />
                      </el-icon>
                    </el-tooltip>
                  </div>
                </template>

                <el-tree-select
                  v-model="genConfigFormData.parentMenuId"
                  placeholder="选择上级菜单"
                  :data="menuOptions"
                  check-strictly
                  :render-after-expand="false"
                  filterable
                  clearable
                />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>

        <div v-show="active == 1" class="elTableCustom">
          <div class="mb-2 flex-y-center gap-2">
            <el-tag size="small" type="info">批量设置</el-tag>
            <el-space size="small">
              <el-dropdown>
                <el-button size="small" type="primary" plain>查询</el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="bulkSet('isShowInQuery', 1)">全选</el-dropdown-item>
                    <el-dropdown-item @click="bulkSet('isShowInQuery', 0)">全不选</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
              <el-dropdown>
                <el-button size="small" type="success" plain>列表</el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="bulkSet('isShowInList', 1)">全选</el-dropdown-item>
                    <el-dropdown-item @click="bulkSet('isShowInList', 0)">全不选</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
              <el-dropdown>
                <el-button size="small" type="warning" plain>表单</el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="bulkSet('isShowInForm', 1)">全选</el-dropdown-item>
                    <el-dropdown-item @click="bulkSet('isShowInForm', 0)">全不选</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </el-space>
          </div>
          <el-table
            v-loading="loading"
            row-key="id"
            :element-loading-text="loadingText"
            highlight--currentrow
            :data="genConfigFormData.fieldConfigs"
          >
            <el-table-column width="55" align="center">
              <el-icon class="cursor-move sortable-handle">
                <Rank />
              </el-icon>
            </el-table-column>

            <el-table-column label="列名" width="110">
              <template #default="scope">
                {{ scope.row.columnName }}
              </template>
            </el-table-column>

            <el-table-column label="列类型" width="80">
              <template #default="scope">
                {{ scope.row.columnType }}
              </template>
            </el-table-column>
            <el-table-column label="字段名" width="120">
              <template #default="scope">
                <el-input v-model="scope.row.fieldName" />
              </template>
            </el-table-column>
            <el-table-column label="字段类型" width="80">
              <template #default="scope">
                {{ scope.row.fieldType }}
              </template>
            </el-table-column>

            <el-table-column label="字段注释" min-width="100">
              <template #default="scope">
                <el-input v-model="scope.row.fieldComment" />
              </template>
            </el-table-column>

            <el-table-column label="最大长度" width="80">
              <template #default="scope">
                <el-input v-model="scope.row.maxLength" />
              </template>
            </el-table-column>

            <el-table-column width="70" label="查询">
              <template #default="scope">
                <el-checkbox v-model="scope.row.isShowInQuery" :true-value="1" :false-value="0" />
              </template>
            </el-table-column>

            <el-table-column width="70" label="列表">
              <template #default="scope">
                <el-checkbox v-model="scope.row.isShowInList" :true-value="1" :false-value="0" />
              </template>
            </el-table-column>

            <el-table-column width="70" label="表单">
              <template #default="scope">
                <el-checkbox v-model="scope.row.isShowInForm" :true-value="1" :false-value="0" />
              </template>
            </el-table-column>

            <el-table-column label="必填" width="70">
              <template #default="scope">
                <el-checkbox
                  v-if="scope.row.isShowInForm == 1"
                  v-model="scope.row.isRequired"
                  :true-value="1"
                  :false-value="0"
                />
                <span v-else>-</span>
              </template>
            </el-table-column>

            <el-table-column label="查询方式" min-width="120">
              <template #default="scope">
                <el-select
                  v-if="scope.row.isShowInQuery === 1"
                  v-model="scope.row.queryType"
                  placeholder="请选择"
                >
                  <el-option
                    v-for="(item, key) in queryTypeOptions"
                    :key="key"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
                <span v-else>-</span>
              </template>
            </el-table-column>

            <el-table-column label="表单类型" min-width="120">
              <template #default="scope">
                <el-select
                  v-if="scope.row.isShowInQuery === 1 || scope.row.isShowInForm === 1"
                  v-model="scope.row.formType"
                  placeholder="请选择"
                >
                  <el-option
                    v-for="(item, key) in formTypeOptions"
                    :key="key"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
                <span v-else>-</span>
              </template>
            </el-table-column>

            <el-table-column label="字典类型" min-width="100">
              <template #default="scope">
                <el-select
                  v-if="scope.row.formType === FormTypeEnum.SELECT.value"
                  v-model="scope.row.dictType"
                  placeholder="请选择"
                  clearable
                >
                  <el-option
                    v-for="item in dictOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
                <span v-else>-</span>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <el-row v-show="active == 2">
          <el-col :span="24" class="mb-2">
            <div class="flex-y-center gap-3">
              <span class="text-sm color-#909399">预览范围</span>
              <el-radio-group v-model="previewScope" size="small">
                <el-radio-button label="all">全部</el-radio-button>
                <el-radio-button label="frontend">前端</el-radio-button>
                <el-radio-button label="backend">后端</el-radio-button>
              </el-radio-group>
              <span class="ml-3 text-sm color-#909399">类型</span>
              <el-checkbox-group v-model="previewTypes" size="small">
                <el-checkbox-button v-for="t in previewTypeOptions" :key="t" :label="t">
                  {{ t }}
                </el-checkbox-button>
              </el-checkbox-group>
            </div>
          </el-col>
          <el-col :span="6">
            <el-scrollbar max-height="72vh">
              <el-tree
                :data="filteredTreeData"
                default-expand-all
                highlight-current
                @node-click="handleFileTreeNodeClick"
              >
                <template #default="{ data }">
                  <div :class="`i-svg:${getFileTreeNodeIcon(data.label)}`" />
                  <span class="ml-1">{{ data.label }}</span>
                </template>
              </el-tree>
            </el-scrollbar>
          </el-col>
          <el-col :span="18">
            <el-scrollbar max-height="72vh">
              <div class="absolute z-36 right-5 top-2">
                <el-link type="primary" @click="handleCopyCode">
                  <el-icon>
                    <CopyDocument />
                  </el-icon>
                  一键复制
                </el-link>
              </div>

              <Codemirror
                ref="cmRef"
                v-model:value="code"
                :options="cmOptions"
                border
                :readonly="true"
                height="100%"
                width="100%"
              />
            </el-scrollbar>
          </el-col>
        </el-row>
      </div>

      <template #footer>
        <el-button v-if="active !== 0" type="success" @click="handlePrevClick">
          <el-icon>
            <Back />
          </el-icon>
          {{ prevBtnText }}
        </el-button>
        <el-button type="primary" @click="handleNextClick">
          {{ nextBtnText }}
          <el-icon v-if="active !== 2">
            <Right />
          </el-icon>
          <el-icon v-else>
            <Download />
          </el-icon>
        </el-button>
        <el-button
          v-if="active === 2"
          :disabled="!supportsFSAccess"
          type="primary"
          plain
          @click="openWriteDialog"
        >
          <template #icon>
            <el-icon><FolderOpened /></el-icon>
          </template>
          写入本地
        </el-button>
      </template>
    </el-drawer>
    <!-- 写入本地对话框 -->
    <el-dialog v-model="writeDialog.visible" title="写入本地" width="820px">
      <div class="space-y-3">
        <el-alert
          v-if="!supportsFSAccess"
          title="当前浏览器不支持 File System Access API，建议使用 Chrome/Edge 最新版"
          type="warning"
          show-icon
          :closable="false"
        />

        <el-form :label-width="110">
          <el-form-item label="前端根目录">
            <div class="flex-y-center gap-2">
              <el-input v-model="frontendDirPath" placeholder="请选择前端根目录" readonly />
              <el-button :disabled="!supportsFSAccess" @click="pickFrontendDir">选择</el-button>
            </div>
          </el-form-item>
          <el-form-item label="后端根目录">
            <div class="flex-y-center gap-2">
              <el-input v-model="backendDirPath" placeholder="请选择后端根目录" readonly />
              <el-button :disabled="!supportsFSAccess" @click="pickBackendDir">选择</el-button>
            </div>
          </el-form-item>
          <el-form-item label="写入范围">
            <el-radio-group v-model="writeScope">
              <el-radio-button label="all">全部</el-radio-button>
              <el-radio-button label="frontend">仅前端</el-radio-button>
              <el-radio-button label="backend">仅后端</el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="覆盖策略">
            <el-radio-group v-model="overwriteMode">
              <el-radio-button label="overwrite">覆盖</el-radio-button>
              <el-radio-button label="skip">跳过已存在</el-radio-button>
              <el-radio-button label="ifChanged">仅变更覆盖</el-radio-button>
            </el-radio-group>
          </el-form-item>
        </el-form>

        <div v-if="writeProgress.total > 0" class="mt-2">
          <el-progress :text-inside="true" :stroke-width="16" :percentage="writeProgress.percent" />
          <div class="mt-1 text-sm color-#909399">
            {{ writeProgress.done }}/{{ writeProgress.total }} {{ writeProgress.current }}
          </div>
        </div>
      </div>

      <template #footer>
        <el-button @click="writeDialog.visible = false">取 消</el-button>
        <el-button
          type="primary"
          :disabled="!canWriteToLocal || writeRunning"
          @click="confirmWrite"
        >
          写 入
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: "Codegen",
});

import Sortable from "sortablejs";
import "codemirror/mode/javascript/javascript.js";
import Codemirror from "codemirror-editor-vue3";
import type { CmComponentRef } from "codemirror-editor-vue3";
import type { EditorConfiguration } from "codemirror";

import { FormTypeEnum } from "@/enums/codegen/form-enum";
import { QueryTypeEnum } from "@/enums/codegen/query-enum";

import GeneratorAPI, {
  TablePageVO,
  GenConfigForm,
  TablePageQuery,
  FieldConfig,
} from "@/api/codegen-api";
import { ElLoading } from "element-plus";

import DictAPI from "@/api/system/dict-api";
import MenuAPI from "@/api/system/menu-api";

interface TreeNode {
  label: string;
  content?: string;
  children?: TreeNode[];
}
const treeData = ref<TreeNode[]>([]);
const previewScope = ref<"all" | "frontend" | "backend">("all");
const previewTypeOptions = ["ts", "vue", "java", "xml"];
const previewTypes = ref<string[]>([...previewTypeOptions]);

const filteredTreeData = computed<TreeNode[]>(() => {
  if (!treeData.value.length) return [];
  // 基于原树按 scope/types 过滤叶子节点
  const match = (label: string, parentPath: string[]): boolean => {
    // scope 过滤：根据路径初步判断
    const pathStr = parentPath.join("/");
    if (previewScope.value !== "all") {
      const isBackend = /(^|\/)src\/main\//.test(pathStr) || /(^|\/)java\//.test(pathStr);
      const scopeOfNode = isBackend ? "backend" : "frontend";
      if (scopeOfNode !== previewScope.value) return false;
    }
    // 类型过滤：根据后缀
    const ext = label.split(".").pop() || "";
    return previewTypes.value.includes(ext);
  };

  const cloneFilter = (node: TreeNode, parents: string[] = []): TreeNode | null => {
    if (!node.children || node.children.length === 0) {
      return match(node.label, parents) ? { ...node } : null;
    }
    const nextParents = [...parents, node.label];
    const children = (node.children || [])
      .map((c) => cloneFilter(c, nextParents))
      .filter(Boolean) as TreeNode[];
    if (!children.length) return null;
    return { label: node.label, children };
  };

  const filtered = treeData.value.map((n) => cloneFilter(n)).filter(Boolean) as TreeNode[];
  return filtered;
});

const queryFormRef = ref();
const queryParams = reactive<TablePageQuery>({
  pageNum: 1,
  pageSize: 10,
});

const loading = ref(false);
const loadingText = ref("loading...");

const pageData = ref<TablePageVO[]>([]);
const total = ref(0);

const formTypeOptions: Record<string, OptionType> = FormTypeEnum;
const queryTypeOptions: Record<string, OptionType> = QueryTypeEnum;
const dictOptions = ref<OptionType[]>();
const menuOptions = ref<OptionType[]>([]);
const genConfigFormData = ref<GenConfigForm>({
  fieldConfigs: [],
  pageType: "classic",
});

const genConfigFormRules = {
  tableName: [{ required: true, message: "请输入表名", trigger: "blur" }],
  businessName: [{ required: true, message: "请输入业务名", trigger: "blur" }],
  packageName: [{ required: true, message: "请输入主包名", trigger: "blur" }],
  moduleName: [{ required: true, message: "请输入模块名", trigger: "blur" }],
  entityName: [{ required: true, message: "请输入实体名", trigger: "blur" }],
};

const dialog = reactive({
  visible: false,
  title: "",
});

// 页面风格使用后端持久化字段 genConfigFormData.ui
watch(
  () => genConfigFormData.value.removeTablePrefix,
  (prefix) => {
    const table = genConfigFormData.value.tableName;
    if (!table) return;
    const p = prefix || "";
    const base = table.startsWith(p) ? table.slice(p.length) : table;
    // 将下划线分隔的表名转为帕斯卡命名
    const camel = base
      .split("_")
      .filter(Boolean)
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join("");
    genConfigFormData.value.entityName = camel;
  }
);

const { copy, copied } = useClipboard();
const code = ref();
const cmRef = ref<CmComponentRef>();
const cmOptions: EditorConfiguration = {
  mode: "text/javascript",
};

const prevBtnText = ref("");
const nextBtnText = ref("下一步，字段配置");
const active = ref(0);
const currentTableName = ref("");
const sortFlag = ref<object>();

// ================= 本地写盘（可选） =================
const supportsFSAccess = typeof (window as any).showDirectoryPicker === "function";
const outputMode = ref<"zip" | "local">("zip");
const frontendDirHandle = ref<any>(null);
const backendDirHandle = ref<any>(null);
const frontendDirName = ref("");
const backendDirName = ref("");
// 预览的原始文件列表（用于写盘）
const lastPreviewFiles = ref<{ path: string; fileName: string; content: string }[]>([]);
const needFrontend = computed(() =>
  lastPreviewFiles.value.some((f) => resolveRootForPath(f.path) === "frontend")
);
const needBackend = computed(() =>
  lastPreviewFiles.value.some((f) => resolveRootForPath(f.path) === "backend")
);
const canWriteToLocal = computed(() => {
  if (!lastPreviewFiles.value.length) return false;
  const frontOk = needFrontend.value ? !!frontendDirHandle.value : true;
  const backOk = needBackend.value ? !!backendDirHandle.value : true;
  return frontOk && backOk;
});

// 查询是否全选
const isCheckAllQuery = ref(false);
// 列表是否全选
const isCheckAllList = ref(false);
// 表单是否全选
const isCheckAllForm = ref(false);

watch(active, (val) => {
  if (val === 0) {
    nextBtnText.value = "下一步，字段配置";
  } else if (val === 1) {
    prevBtnText.value = "上一步，基础配置";
    nextBtnText.value = "下一步，确认生成";
  } else if (val === 2) {
    prevBtnText.value = "上一步，字段配置";
    nextBtnText.value = "下载代码";
  }
});

watch(copied, () => {
  if (copied.value) {
    ElMessage.success("复制成功");
  }
});

watch(
  () => genConfigFormData.value.fieldConfigs as FieldConfig[],
  (newVal: FieldConfig[]) => {
    newVal.forEach((fieldConfig) => {
      if (
        fieldConfig.fieldType &&
        fieldConfig.fieldType.includes("Date") &&
        fieldConfig.isShowInQuery === 1
      ) {
        fieldConfig.queryType = QueryTypeEnum.BETWEEN.value as number;
      }
    });
  },
  { deep: true, immediate: true }
);

const initSort = () => {
  if (sortFlag.value) {
    return;
  }
  const table = document.querySelector(".elTableCustom .el-table__body-wrapper tbody");
  sortFlag.value = Sortable.create(<HTMLElement>table, {
    group: "shared",
    animation: 150,
    ghostClass: "sortable-ghost", //拖拽样式
    handle: ".sortable-handle", //拖拽区域
    easing: "cubic-bezier(1, 0, 0, 1)",

    // 结束拖动事件
    onEnd: (item: any) => {
      setNodeSort(item.oldIndex, item.newIndex);
    },
  });
};

const setNodeSort = (oldIndex: number, newIndex: number) => {
  // 使用arr复制一份表格数组数据
  const arr = Object.assign([], genConfigFormData.value.fieldConfigs);
  const currentRow = arr.splice(oldIndex, 1)[0];
  arr.splice(newIndex, 0, currentRow);
  arr.forEach((item: FieldConfig, index) => {
    item.fieldSort = index + 1;
  });
  genConfigFormData.value.fieldConfigs = [];
  nextTick(async () => {
    genConfigFormData.value.fieldConfigs = arr;
  });
};

/** 上一步 */
function handlePrevClick() {
  if (active.value === 2) {
    //这里需要重新获取一次数据，如果第一次生成代码后，再次点击上一步，数据不重新获取，再次点击下一步，会再次插入数据，导致索引重复报错
    genConfigFormData.value = {
      fieldConfigs: [],
    };
    nextTick(() => {
      loading.value = true;
      GeneratorAPI.getGenConfig(currentTableName.value)
        .then((data) => {
          genConfigFormData.value = data;
        })
        .finally(() => {
          loading.value = false;
        });
    });
    initSort();
  }
  if (active.value-- <= 0) active.value = 0;
}

/** 下一步 */
function handleNextClick() {
  if (active.value === 0) {
    //这里需要校验基础配置
    const { tableName, packageName, businessName, moduleName, entityName } =
      genConfigFormData.value;
    if (!tableName || !packageName || !businessName || !moduleName || !entityName) {
      ElMessage.error("表名、业务名、包名、模块名、实体名不能为空");
      return;
    }
    initSort();
  }
  if (active.value === 1) {
    // 保存生成配置
    const tableName = genConfigFormData.value.tableName;
    if (!tableName) {
      ElMessage.error("表名不能为空");
      return;
    }
    loading.value = true;
    loadingText.value = "代码生成中，请稍后...";
    GeneratorAPI.saveGenConfig(tableName, genConfigFormData.value)
      .then(() => {
        handlePreview(tableName);
      })
      .then(() => {
        if (active.value++ >= 2) active.value = 2;
      })
      .finally(() => {
        loading.value = false;
        loadingText.value = "loading...";
      });
  } else {
    if (active.value++ >= 2) {
      active.value = 2;
    }
    if (active.value === 2) {
      const tableName = genConfigFormData.value.tableName;
      if (!tableName) {
        ElMessage.error("表名不能为空");
        return;
      }
      if (outputMode.value === "zip" || !supportsFSAccess) {
        GeneratorAPI.download(tableName, (genConfigFormData.value.pageType as any) || "classic");
      }
    }
  }
}

/** 查询 */
function handleQuery() {
  loading.value = true;
  GeneratorAPI.getTablePage(queryParams)
    .then((data) => {
      pageData.value = data.list;
      total.value = data.total;
    })
    .finally(() => {
      loading.value = false;
    });
}

/** 重置查询 */
function handleResetQuery() {
  queryFormRef.value.resetFields();
  queryParams.pageNum = 1;
  handleQuery();
}

/** 打开弹窗 */
async function handleOpenDialog(tableName: string) {
  dialog.visible = true;
  active.value = 0;

  menuOptions.value = await MenuAPI.getOptions(true);

  currentTableName.value = tableName;
  // 获取字典数据
  DictAPI.getList().then((data) => {
    dictOptions.value = data;
    loading.value = true;
    GeneratorAPI.getGenConfig(tableName)
      .then((data) => {
        dialog.title = `${tableName} 代码生成`;
        genConfigFormData.value = data;

        checkAllSelected("isShowInQuery", isCheckAllQuery);
        checkAllSelected("isShowInList", isCheckAllList);
        checkAllSelected("isShowInForm", isCheckAllForm);

        // 如果已经配置过，直接跳转到预览页面
        if (genConfigFormData.value.id) {
          active.value = 2;
          handlePreview(tableName);
        } else {
          // 如果没有配置过，跳转到基础配置页面
          active.value = 0;
        }
      })
      .finally(() => {
        loading.value = false;
      });
  });
}

/** 重置配置 */
function handleResetConfig(tableName: string) {
  ElMessageBox.confirm("确定要重置配置吗？", "提示", {
    type: "warning",
  }).then(() => {
    GeneratorAPI.resetGenConfig(tableName).then(() => {
      ElMessage.success("重置成功");
      handleQuery();
    });
  });
}

type FieldConfigKey = "isShowInQuery" | "isShowInList" | "isShowInForm";

/** 全选 */
// 单列全选开关已移除，改为顶部“批量设置”入口；保留方法时会触发未使用告警，故删除。

function bulkSet(key: FieldConfigKey, value: 0 | 1) {
  const list = genConfigFormData.value?.fieldConfigs || [];
  list.forEach((row: any) => {
    // 只改已有字段，保持响应式
    row[key] = value;
  });
}

const checkAllSelected = (key: keyof FieldConfig, isCheckAllRef: any) => {
  const fieldConfigs = genConfigFormData.value?.fieldConfigs || [];
  isCheckAllRef.value = fieldConfigs.every((row: FieldConfig) => row[key] === 1);
};

/** 获取生成预览 */
function handlePreview(tableName: string) {
  treeData.value = [];
  GeneratorAPI.getPreviewData(tableName, (genConfigFormData.value.pageType as any) || "classic")
    .then((data) => {
      dialog.title = `代码生成 ${tableName}`;
      // 组装树形结构完善代码
      const tree = buildTree(data);
      // 缓存原始数据用于写盘
      lastPreviewFiles.value = data || [];
      // 去掉根节点“前后端代码”，直接展示其 children 作为一级目录
      treeData.value = tree?.children ? [...tree.children] : [];

      // 默认选中第一个叶子节点并设置 code 值
      const firstLeafNode = findFirstLeafNode(tree);
      if (firstLeafNode) {
        code.value = firstLeafNode.content || "";
      }
    })
    .catch(() => {
      active.value = 0;
    });
}

/**
 * 递归构建树形结构
 *
 * @param data - 数据数组
 * @returns 树形结构根节点
 */
function buildTree(data: { path: string; fileName: string; content: string }[]): TreeNode {
  // 动态获取根节点
  const root: TreeNode = { label: "前后端代码", children: [] };

  data.forEach((item) => {
    // 将路径分成数组
    const separator = item.path.includes("/") ? "/" : "\\";
    const parts = item.path.split(separator);

    // 定义特殊路径
    const specialPaths = [
      "src" + separator + "main",
      "java",
      genConfigFormData.value.backendAppName,
      genConfigFormData.value.frontendAppName,
      (genConfigFormData.value.packageName + "." + genConfigFormData.value.moduleName).replace(
        /\./g,
        separator
      ),
    ];

    // 检查路径中的特殊部分并合并它们
    const mergedParts: string[] = [];
    let buffer: string[] = [];

    parts.forEach((part) => {
      buffer.push(part);
      const currentPath = buffer.join(separator);
      if (specialPaths.includes(currentPath)) {
        mergedParts.push(currentPath);
        buffer = [];
      }
    });

    // 将 mergedParts 路径中的分隔符\替换为/
    mergedParts.forEach((part, index) => {
      mergedParts[index] = part.replace(/\\/g, "/");
    });

    if (buffer.length > 0) {
      mergedParts.push(...buffer);
    }

    let currentNode = root;

    mergedParts.forEach((part) => {
      // 查找或创建当前部分的子节点
      let node = currentNode.children?.find((child) => child.label === part);
      if (!node) {
        node = { label: part, children: [] };
        currentNode.children?.push(node);
      }
      currentNode = node;
    });

    // 添加文件节点
    currentNode.children?.push({
      label: item.fileName,
      content: item?.content,
    });
  });

  return root;
}

/**
 * 递归查找第一个叶子节点
 * @param node - 树形节点
 * @returns 第一个叶子节点
 */
function findFirstLeafNode(node: TreeNode): TreeNode | null {
  if (!node.children || node.children.length === 0) {
    return node;
  }
  for (const child of node.children) {
    const leafNode = findFirstLeafNode(child);
    if (leafNode) {
      return leafNode;
    }
  }
  return null;
}

/** 文件树节点 Click */
function handleFileTreeNodeClick(data: TreeNode) {
  if (!data.children || data.children.length === 0) {
    code.value = data.content || "";
  }
}

/** 获取文件树节点图标 */
function getFileTreeNodeIcon(label: string) {
  if (label.endsWith(".java")) {
    return "java";
  }
  if (label.endsWith(".html")) {
    return "html";
  }
  if (label.endsWith(".vue")) {
    return "vue";
  }
  if (label.endsWith(".ts")) {
    return "typescript";
  }
  if (label.endsWith(".xml")) {
    return "xml";
  }
  return "file";
}

/** 一键复制 */
const handleCopyCode = () => {
  if (code.value) {
    copy(code.value);
  }
};

// =============== 目录选择与写入 ===============
const pickFrontendDir = async () => {
  try {
    // @ts-ignore
    frontendDirHandle.value = await (window as any).showDirectoryPicker();
    frontendDirName.value = frontendDirHandle.value?.name || "";
    ElMessage.success("前端目录选择成功");
  } catch {
    // 用户取消或浏览器不支持
  }
};

const pickBackendDir = async () => {
  try {
    // @ts-ignore
    backendDirHandle.value = await (window as any).showDirectoryPicker();
    backendDirName.value = backendDirHandle.value?.name || "";
    ElMessage.success("后端目录选择成功");
  } catch {
    // 用户取消或浏览器不支持
  }
};

async function ensureDir(root: any, path: string[], force = true) {
  let current = root;
  for (const segment of path) {
    try {
      // @ts-ignore
      current = await current.getDirectoryHandle(segment, { create: true });
    } catch (err: any) {
      // 若同名文件阻塞目录创建，尝试强制删除后重建
      if (force && err?.name === "TypeMismatchError") {
        try {
          // @ts-ignore
          await current.removeEntry(segment, { recursive: true });
          // @ts-ignore
          current = await current.getDirectoryHandle(segment, { create: true });
        } catch {
          throw err;
        }
      } else {
        throw err;
      }
    }
  }
  return current;
}

async function writeFile(dirHandle: any, filePath: string, content: string) {
  const normalized = filePath.replace(/\\/g, "/");
  const parts = normalized.split("/").filter(Boolean);
  const fileName = parts.pop()!;
  const folderSegments = parts;
  const targetDir = await ensureDir(dirHandle, folderSegments, true);
  // @ts-ignore
  let fileHandle;
  try {
    // @ts-ignore
    fileHandle = await targetDir.getFileHandle(fileName, { create: true });
  } catch (err: any) {
    if (err?.name === "TypeMismatchError") {
      // 存在同名目录，尝试删除后重建文件
      try {
        // @ts-ignore
        await targetDir.removeEntry(fileName, { recursive: true });
        // @ts-ignore
        fileHandle = await targetDir.getFileHandle(fileName, { create: true });
      } catch {
        throw err;
      }
    } else {
      throw err;
    }
  }
  // @ts-ignore
  const writable = await fileHandle.createWritable();
  await writable.write(content ?? "");
  await writable.close();
}

async function pathExists(dirHandle: any, filePath: string): Promise<boolean> {
  try {
    const normalized = filePath.replace(/\\/g, "/");
    const parts = normalized.split("/").filter(Boolean);
    const fileName = parts.pop()!;
    const targetDir = await ensureDir(dirHandle, parts, false);
    // @ts-ignore
    await targetDir.getFileHandle(fileName, { create: false });
    return true;
  } catch {
    return false;
  }
}

async function isSameFile(dirHandle: any, filePath: string, content: string): Promise<boolean> {
  try {
    const normalized = filePath.replace(/\\/g, "/");
    const parts = normalized.split("/").filter(Boolean);
    const fileName = parts.pop()!;
    const targetDir = await ensureDir(dirHandle, parts, false);
    // @ts-ignore
    const fileHandle = await targetDir.getFileHandle(fileName, { create: false });
    // @ts-ignore
    const file = await fileHandle.getFile();
    const text = await file.text();
    return text === (content ?? "");
  } catch {
    return false;
  }
}

// 将模板中的 path 映射到前端/后端根目录
function resolveRootForPath(p: string) {
  const normalized = p.replace(/\\/g, "/");
  const frontApp = genConfigFormData.value.frontendAppName;
  const backApp = genConfigFormData.value.backendAppName;
  if (
    (backApp && normalized.startsWith(`${backApp}/`)) ||
    normalized.includes("/src/main/") ||
    normalized.startsWith("src/main/") ||
    normalized.startsWith("java/")
  ) {
    return "backend" as const;
  }
  if ((frontApp && normalized.startsWith(`${frontApp}/`)) || normalized.startsWith("src/")) {
    return "frontend" as const;
  }
  // 默认前端
  return "frontend" as const;
}

function stripProjectRoot(p: string) {
  const normalized = p.replace(/\\/g, "/");
  const frontApp = genConfigFormData.value.frontendAppName;
  const backApp = genConfigFormData.value.backendAppName;
  let rel = normalized;
  if (frontApp && normalized.startsWith(`${frontApp}/`)) {
    rel = normalized.slice(frontApp.length + 1);
  } else if (backApp && normalized.startsWith(`${backApp}/`)) {
    rel = normalized.slice(backApp.length + 1);
  } else {
    const idx = normalized.indexOf("/src/");
    if (idx > -1) {
      rel = normalized.slice(idx + 1); // 保留 'src/...'
    } else if (normalized.startsWith("src/")) {
      rel = normalized;
    }
  }
  return rel;
}

const writeGeneratedCode = async () => {
  if (!supportsFSAccess) {
    ElMessage.warning("当前浏览器不支持本地写入，请选择下载ZIP");
    return;
  }
  if (
    (needFrontend.value && !frontendDirHandle.value) ||
    (needBackend.value && !backendDirHandle.value)
  ) {
    ElMessage.warning("请先选择所需的前端/后端目录");
    return;
  }
  if (!lastPreviewFiles.value.length) {
    ElMessage.warning("请先生成预览");
    return;
  }
  loading.value = true;
  const loadingSvc = ElLoading.service({
    lock: true,
    text: "正在写入代码...",
  });
  writeRunning.value = true;
  let frontCount = 0;
  let backCount = 0;
  const failed: string[] = [];
  const files = lastPreviewFiles.value.filter((f) => {
    const root = resolveRootForPath(f.path);
    return writeScope.value === "all" || root === writeScope.value;
  });
  writeProgress.total = files.length;
  writeProgress.done = 0;
  writeProgress.percent = 0;
  writeProgress.current = "";

  const concurrency = 4;
  const queue = files.slice();
  const workers: Promise<void>[] = [];

  async function worker() {
    while (queue.length) {
      const item = queue.shift()!;
      try {
        const root = resolveRootForPath(item.path);
        const relativePath = stripProjectRoot(`${item.path}/${item.fileName}`);
        writeProgress.current = relativePath;
        if (overwriteMode.value === "ifChanged") {
          // 简单差异：已有文件内容与待写内容相同则跳过
          // @ts-ignore
          const targetRoot = root === "frontend" ? frontendDirHandle.value : backendDirHandle.value;
          const existsSame = await isSameFile(targetRoot, relativePath, item.content || "");
          if (existsSame) {
            // 视作成功但不写
            writeProgress.done++;
            writeProgress.percent = Math.round((writeProgress.done / writeProgress.total) * 100);
            continue;
          }
        }
        if (overwriteMode.value === "skip") {
          // @ts-ignore
          const targetRoot = root === "frontend" ? frontendDirHandle.value : backendDirHandle.value;
          const exists = await pathExists(targetRoot, relativePath);
          if (exists) {
            writeProgress.done++;
            writeProgress.percent = Math.round((writeProgress.done / writeProgress.total) * 100);
            continue;
          }
        }
        if (root === "frontend") {
          await writeFile(frontendDirHandle.value, relativePath, item.content || "");
          frontCount++;
        } else {
          await writeFile(backendDirHandle.value, relativePath, item.content || "");
          backCount++;
        }
      } catch (err) {
        console.error("写入失败:", item.path, err);
        failed.push(item.path);
      } finally {
        writeProgress.done++;
        writeProgress.percent = Math.round((writeProgress.done / writeProgress.total) * 100);
      }
    }
  }

  for (let i = 0; i < concurrency; i++) {
    workers.push(worker());
  }
  await Promise.all(workers);
  loading.value = false;
  loadingSvc.close();
  writeRunning.value = false;
  if (failed.length) {
    ElMessage.warning(
      `部分文件写入失败：${failed.length} 个，成功 前端 ${frontCount} 个/后端 ${backCount} 个。打开控制台查看详情`
    );
  } else {
    ElMessage.success(`写入完成：前端 ${frontCount} 个文件，后端 ${backCount} 个文件`);
  }
};

const writeDialog = reactive({ visible: false });
const frontendDirPath = ref("");
const backendDirPath = ref("");
const writeScope = ref<"all" | "frontend" | "backend">("all");
const overwriteMode = ref<"overwrite" | "skip" | "ifChanged">("overwrite");
const writeProgress = reactive({ total: 0, done: 0, percent: 0, current: "" });
const writeRunning = ref(false);

// 提示文本已取消展示，保留逻辑意义不大，移除。

function openWriteDialog() {
  writeDialog.visible = true;
}

// 同步展示路径
watch(frontendDirName, (v) => (frontendDirPath.value = v));
watch(backendDirName, (v) => (backendDirPath.value = v));

async function confirmWrite() {
  await writeGeneratedCode();
  writeDialog.visible = false;
}

/** 组件挂载后执行 */
onMounted(() => {
  handleQuery();
  cmRef.value?.destroy();
});
</script>
