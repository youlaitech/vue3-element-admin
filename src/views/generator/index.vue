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

        <el-table-column fixed="right" label="操作" width="150">
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
                <el-input v-model="formData.tableName" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="业务名">
                <el-input v-model="formData.businessName" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="12">
              <el-form-item label="模块名">
                <el-input v-model="formData.moduleName" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="包名">
                <el-input v-model="formData.packageName" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="12">
              <el-form-item label="实体名">
                <el-input v-model="formData.entityName" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="作者">
                <el-input v-model="formData.author" />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>

        <el-table
          v-show="active == 1"
          v-loading="loading"
          :element-loading-text="loadingText"
          highlight--currentrow
          :data="formData.fieldConfigs"
        >
          <el-table-column label="字段列名" width="100">
            <template #default="scope">
              <el-form-item>
                {{ scope.row.columnName }}
              </el-form-item>
            </template>
          </el-table-column>

          <el-table-column label="字段类型" width="100">
            <template #default="scope">
              <el-form-item>
                {{ scope.row.columnType }}
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column label="Java属性" width="120">
            <template #default="scope">
              <el-form-item
                :prop="'fieldConfigs.' + scope.$index + '.fieldName'"
              >
                <el-input v-model="scope.row.fieldName" />
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column label="Java类型" width="120">
            <template #default="scope">
              <el-form-item
                :prop="'fieldConfigs.' + scope.$index + '.fieldType'"
              >
                <el-input v-model="scope.row.fieldType" />
              </el-form-item>
            </template>
          </el-table-column>

          <el-table-column label="字段描述">
            <template #default="scope">
              <el-form-item
                :prop="'fieldConfigs.' + scope.$index + '.fieldComment'"
              >
                <el-input v-model="scope.row.fieldComment" />
              </el-form-item>
            </template>
          </el-table-column>

          <el-table-column label="最大长度" width="100">
            <template #default="scope">
              <el-form-item>
                <el-input v-model="scope.row.maxLength" />
              </el-form-item>
            </template>
          </el-table-column>

          <el-table-column label="查询" width="70">
            <template #default="scope">
              <el-form-item>
                <el-checkbox
                  v-model="scope.row.isShowInQuery"
                  :true-value="1"
                  :false-value="0"
                />
              </el-form-item>
            </template>
          </el-table-column>

          <el-table-column label="列表" width="70">
            <template #default="scope">
              <el-form-item>
                <el-checkbox
                  v-model="scope.row.isShowInList"
                  :true-value="1"
                  :false-value="0"
                />
              </el-form-item>
            </template>
          </el-table-column>

          <el-table-column label="表单" width="70">
            <template #default="scope">
              <el-form-item>
                <el-checkbox
                  v-model="scope.row.isShowInForm"
                  :true-value="1"
                  :false-value="0"
                />
              </el-form-item>
            </template>
          </el-table-column>

          <el-table-column label="是否必填" width="100">
            <template #default="scope">
              <el-form-item>
                <el-checkbox
                  v-model="scope.row.isRequired"
                  :true-value="1"
                  :false-value="0"
                  :disabled="scope.row.isShowInForm !== 1"
                />
              </el-form-item>
            </template>
          </el-table-column>

          <el-table-column label="查询方式">
            <template #default="scope">
              <el-form-item>
                <el-select v-model="scope.row.queryType" placeholder="请选择">
                  <el-option
                    v-for="(item, key) in queryTypeOptions"
                    :key="key"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </template>
          </el-table-column>

          <el-table-column label="表单类型">
            <template #default="scope">
              <el-form-item>
                <el-select v-model="scope.row.formType" placeholder="请选择">
                  <el-option
                    v-for="(item, key) in formTypeOptions"
                    :key="key"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </template>
          </el-table-column>

          <el-table-column label="字典类型">
            <template #default="scope">
              <el-form-item>
                <el-select v-model="scope.row.dictType" placeholder="请选择">
                  <el-option
                    v-for="item in dictOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </template>
          </el-table-column>
        </el-table>

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
                  <el-icon><CopyDocument /></el-icon>
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
          <el-icon><Back /></el-icon>
          {{ prevBtnText }}
        </el-button>
        <el-button type="primary" @click="handleNextClick">
          {{ nextBtnText }}
          <el-icon v-if="active !== 2"><Right /></el-icon>
          <el-icon v-else><Download /></el-icon>
        </el-button>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: "Generator",
});

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

const queryFormRef = ref(ElForm);

const loading = ref(false);
const loadingText = ref("loading...");
const total = ref(0);
const queryParams = reactive<TablePageQuery>({
  pageNum: 1,
  pageSize: 10,
});
const pageData = ref<TablePageVO[]>([]);
const formData = ref<GenConfigForm>({});
const formTypeOptions: Record<string, OptionType> = FormTypeEnum;
const queryTypeOptions: Record<string, OptionType> = QueryTypeEnum;
const dictOptions = ref<OptionType[]>();

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

interface TreeNode {
  label: string;
  content?: string;
  children?: TreeNode[];
}

const treeData = ref<TreeNode[]>([]);

function handlePrevClick() {
  if (active.value-- <= 0) active.value = 0;
}

function handleNextClick() {
  if (active.value === 1) {
    // 保存生成配置
    const tableName = formData.value.tableName;
    if (!tableName) {
      ElMessage.error("表名不能为空");
      return;
    }
    loading.value = true;
    loadingText.value = "代码生成中，请稍后...";
    GeneratorAPI.saveGenConfig(tableName, formData.value)
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
    if (active.value++ >= 2) active.value = 2;
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
function handleOpenDialog(tableName: string) {
  dialog.visible = true;

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
      handleQuery();
    });
  });
}

/** 获取生成预览 */
function handlePreview(tableName: string) {
  treeData.value = [];
  GeneratorAPI.getPreviewData(tableName).then((data) => {
    dialog.title = `代码生成 ${tableName}`;
    // 组装树形结构完善代码
    const tree = buildTree(data);
    treeData.value = [tree];

    // 默认选中第一个叶子节点并设置 code 值
    const firstLeafNode = findFirstLeafNode(tree);
    if (firstLeafNode) {
      code.value = firstLeafNode.content || "";
    }
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
