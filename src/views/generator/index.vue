<template>
  <div class="app-container">
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

        <el-form-item>
          <el-button type="primary" @click="handleQuery">
            <i-ep-search />
            搜索
          </el-button>
          <el-button @click="handleResetQuery">
            <i-ep-refresh />
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-card shadow="never" class="table-container">
      <el-table
        ref="dataTableRef"
        v-loading="loading"
        :data="pageData"
        highlight-current-row
        border
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="表名" prop="tableName" min-width="100" />
        <el-table-column label="描述" prop="tableComment" width="150" />

        <el-table-column label="存储引擎" align="center" prop="engine" />

        <el-table-column
          label="排序规则"
          align="center"
          prop="tableCollation"
        />
        <el-table-column label="创建时间" align="center" prop="createTime" />

        <el-table-column fixed="right" label="操作" width="200">
          <template #default="scope">
            <el-button
              type="primary"
              size="small"
              link
              @click="handleOpenDialog(scope.row.tableName)"
            >
              <i-ep-MagicStick />
              生成代码
            </el-button>

            <el-button
              type="danger"
              size="small"
              link
              @click="handleResetConfig(scope.row.tableName)"
            >
              <i-ep-RefreshLeft />
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
      @close="dialog.visible = false"
      size="80%"
    >
      <el-steps :active="active" align-center finish-status="success" simple>
        <el-step title="基础配置" />
        <el-step title="字段配置" />
        <el-step title="预览生成" />
      </el-steps>

      <div class="mt-5">
        <el-form v-show="active == 0" :model="formData" :label-width="100">
          <el-row>
            <el-col :span="12">
              <el-form-item label="表名">
                <el-input v-model="formData.tableName" readonly />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="业务名">
                <el-input v-model="formData.businessName" placeholder="用户" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="12">
              <el-form-item label="模块名">
                <el-input v-model="formData.moduleName" placeholder="system" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="包名">
                <el-input
                  v-model="formData.packageName"
                  placeholder="com.youlai.boot"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="12">
              <el-form-item label="实体名">
                <el-input v-model="formData.entityName" placeholder="User" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="作者">
                <el-input v-model="formData.author" placeholder="youlai" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="12">
              <el-form-item label="上级菜单">
                <el-tree-select
                  v-model="formData.parentMenuId"
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

        <div class="elTableCustom" v-show="active == 1">
          <el-table
            v-loading="fieldLoading"
            row-key="id"
            :element-loading-text="loadingText"
            highlight--currentrow
            :data="formData.fieldConfigs"
          >
            <el-table-column type="index" label="序号" width="80" />
            <el-table-column label="字段列名" width="150">
              <template #default="scope">
                {{ scope.row.columnName }}
              </template>
            </el-table-column>

            <el-table-column label="字段类型" width="80">
              <template #default="scope">
                {{ scope.row.columnType }}
              </template>
            </el-table-column>
            <el-table-column label="Java属性" width="120">
              <template #default="scope">
                <el-input v-model="scope.row.fieldName" />
              </template>
            </el-table-column>
            <el-table-column label="Java类型" width="120">
              <template #default="scope">
                <el-input v-model="scope.row.fieldType" />
              </template>
            </el-table-column>

            <el-table-column label="字段描述" min-width="120">
              <template #default="scope">
                <el-input v-model="scope.row.fieldComment" />
              </template>
            </el-table-column>

            <el-table-column label="最大长度" width="100">
              <template #default="scope">
                <el-input v-model="scope.row.maxLength" />
              </template>
            </el-table-column>

            <el-table-column label="查询" width="70">
              <template #default="scope">
                <el-checkbox
                  v-model="scope.row.isShowInQuery"
                  :true-value="1"
                  :false-value="0"
                />
              </template>
            </el-table-column>

            <el-table-column label="列表" width="70">
              <template #default="scope">
                <el-checkbox
                  v-model="scope.row.isShowInList"
                  :true-value="1"
                  :false-value="0"
                />
              </template>
            </el-table-column>

            <el-table-column label="表单" width="70">
              <template #default="scope">
                <el-checkbox
                  v-model="scope.row.isShowInForm"
                  :true-value="1"
                  :false-value="0"
                />
              </template>
            </el-table-column>

            <el-table-column label="必填" width="70">
              <template #default="scope">
                <el-checkbox
                  v-model="scope.row.isRequired"
                  :true-value="1"
                  :false-value="0"
                  :disabled="scope.row.isShowInForm !== 1"
                />
              </template>
            </el-table-column>

            <el-table-column label="查询方式" min-width="100">
              <template #default="scope">
                <el-select v-model="scope.row.queryType" placeholder="请选择">
                  <el-option
                    v-for="(item, key) in queryTypeOptions"
                    :key="key"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </template>
            </el-table-column>

            <el-table-column label="表单类型" min-width="110">
              <template #default="scope">
                <el-select v-model="scope.row.formType" placeholder="请选择">
                  <el-option
                    v-for="(item, key) in formTypeOptions"
                    :key="key"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </template>
            </el-table-column>

            <el-table-column label="字典类型" min-width="100">
              <template #default="scope">
                <el-select
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
              </template>
            </el-table-column>
          </el-table>
        </div>

        <el-row v-show="active == 2">
          <el-col :span="6">
            <el-scrollbar max-height="72vh">
              <el-tree
                :data="treeData"
                default-expand-all
                highlight-current
                @node-click="handleFileTreeNodeClick"
              >
                <template #default="{ data }">
                  <svg-icon :icon-class="getFileTreeNodeIcon(data.label)" />
                  <span class="ml-1">{{ data.label }}</span>
                </template>
              </el-tree>
            </el-scrollbar>
          </el-col>
          <el-col :span="18">
            <el-scrollbar max-height="72vh">
              <div class="absolute-rt z-36 right-5 top-2">
                <el-link @click="handleCopyCode" type="primary">
                  <el-icon>
                    <CopyDocument />
                  </el-icon>
                  一键复制
                </el-link>
              </div>

              <Codemirror
                v-model:value="code"
                :options="cmOptions"
                border
                ref="cmRef"
                :readonly="true"
                height="100%"
                width="100%"
              />
            </el-scrollbar>
          </el-col>
        </el-row>
      </div>

      <template #footer>
        <el-button type="success" @click="handlePrevClick" v-if="active !== 0">
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
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: "Generator",
});
//导入sortablejs
import Sortable from "sortablejs";
import "codemirror/mode/javascript/javascript.js";
import Codemirror from "codemirror-editor-vue3";
import type { CmComponentRef } from "codemirror-editor-vue3";
import type { EditorConfiguration } from "codemirror";

import { FormTypeEnum } from "@/enums/FormTypeEnum";
import { QueryTypeEnum } from "@/enums/QueryTypeEnum";

import GeneratorAPI, {
  TablePageVO,
  GenConfigForm,
  TablePageQuery,
} from "@/api/generator";

import DictAPI from "@/api/dict";
import MenuAPI from "@/api/menu";

const queryFormRef = ref(ElForm);

const loading = ref(false);
const fieldLoading = ref(false);
const loadingText = ref("loading...");
const total = ref(0);
const queryParams = reactive<TablePageQuery>({
  keywords: undefined,
  pageNum: 1,
  pageSize: 10,
});
const pageData = ref<TablePageVO[]>([]);
const formData = ref<GenConfigForm>({
  fieldConfigs: [],
});
const formTypeOptions: Record<string, OptionType> = FormTypeEnum;
const queryTypeOptions: Record<string, OptionType> = QueryTypeEnum;
const dictOptions = ref<OptionType[]>();
const menuOptions = ref<OptionType[]>([]);

const dialog = reactive({
  visible: false,
  title: "",
});

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
const sortFlag = ref<Object>();

interface TreeNode {
  label: string;
  content?: string;
  children?: TreeNode[];
}

const treeData = ref<TreeNode[]>([]);

const initSort = () => {
  if (sortFlag.value) {
    return;
  }
  const table = document.querySelector(
    ".elTableCustom .el-table__body-wrapper tbody"
  );
  sortFlag.value = Sortable.create(<HTMLElement>table, {
    group: "shared",
    animation: 150,
    ghostClass: "sortable-ghost", //拖拽样式
    easing: "cubic-bezier(1, 0, 0, 1)",
    onStart: (item: any) => {},

    // 结束拖动事件
    onEnd: (item: any) => {
      setNodeSort(item.oldIndex, item.newIndex);
    },
  });
};

const setNodeSort = (oldIndex: number, newIndex: number) => {
  // 使用arr复制一份表格数组数据
  let arr = Object.assign([], formData.value.fieldConfigs);
  const currentRow = arr.splice(oldIndex, 1)[0];
  arr.splice(newIndex, 0, currentRow);
  arr.forEach((item, index) => {
    item.fieldSort = index + 1;
  });
  formData.value.fieldConfigs = [];
  nextTick(async () => {
    formData.value.fieldConfigs = arr;
  });
};

function handlePrevClick() {
  if (active.value === 2) {
    //这里需要重新获取一次数据，如果第一次生成代码后，再次点击上一步，数据不重新获取，再次点击下一步，会再次插入数据，导致索引重复报错
    formData.value = {
      fieldConfigs: [],
    };
    nextTick(() => {
      fieldLoading.value = true;
      GeneratorAPI.getGenConfig(currentTableName.value)
        .then((data) => {
          formData.value = data;
        })
        .finally(() => {
          fieldLoading.value = false;
        });
    });
    initSort();
  }
  if (active.value-- <= 0) active.value = 0;
}

function handleNextClick() {
  if (active.value === 0) {
    initSort();
  }
  if (active.value === 1) {
    // 保存生成配置
    const tableName = formData.value.tableName;
    if (!tableName) {
      ElMessage.error("表名不能为空");
      return;
    }
    fieldLoading.value = true;
    loadingText.value = "代码生成中，请稍后...";
    GeneratorAPI.saveGenConfig(tableName, formData.value)
      .then(() => {
        handlePreview(tableName);
      })
      .then(() => {
        if (active.value++ >= 2) active.value = 2;
      })
      .finally(() => {
        fieldLoading.value = false;
        loadingText.value = "loading...";
      });
  } else {
    if (active.value++ >= 2) {
      active.value = 2;
    }
    if (active.value === 2) {
      const tableName = formData.value.tableName;
      if (!tableName) {
        ElMessage.error("表名不能为空");
        return;
      }
      GeneratorAPI.downloadZip(tableName, "youlai-admin-code.zip");
    }
  }
}

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
        formData.value = data;
        if (formData.value.id) {
          active.value = 2;
          handlePreview(tableName);
        } else {
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

/** 获取生成预览 */
function handlePreview(tableName: string) {
  treeData.value = [];
  GeneratorAPI.getPreviewData(tableName)
    .then((data) => {
      dialog.title = `代码生成 ${tableName}`;
      // 组装树形结构完善代码
      const tree = buildTree(data);
      treeData.value = [tree];

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
function buildTree(
  data: { path: string; fileName: string; content: string }[]
): TreeNode {
  // 动态获取根节点
  const root: TreeNode = { label: "前后端工程代码", children: [] };

  data.forEach((item) => {
    // 将路径分成数组
    const separator = item.path.includes("/") ? "/" : "\\";
    const parts = item.path.split(separator);

    // 定义特殊路径
    // TODO: 如果菜单有多个节点，需要将此菜单作为独立一级的节点，而不是合并到上一级。 按照此规则， com.youlai.system 则是三个节点，而不是合并到一起，但是这里需要将 com.youlai.system 合并到一起，所以需要特殊处理
    const specialPaths = [
      "src/main",
      "java",
      "youlai-boot",
      "vue3-element-admin",
      "com/youlai/system",
    ];

    // 检查路径中的特殊部分并合并它们
    const mergedParts: string[] = [];
    let buffer: string[] = [];

    parts.forEach((part) => {
      buffer.push(part);
      const currentPath = buffer.join(separator);
      console.log("currentPath", currentPath);
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

const handleCopyCode = () => {
  if (code.value) {
    copy(code.value);
  }
};

watch(copied, () => {
  if (copied.value) {
    ElMessage.success("复制成功");
  }
});

onMounted(() => {
  handleQuery();
  cmRef.value?.destroy();
});
</script>
