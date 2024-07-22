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
              @click="handleOpenDialog('config', scope.row.tableName)"
            >
              <i-ep-Edit />
              配置
            </el-button>
            <el-button
              type="primary"
              size="small"
              link
              @click="handleOpenDialog('preview', scope.row.tableName)"
            >
              <i-ep-MagicStick />
              生成
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
      @close="handleCloseDialog"
      size="80%"
    >
      <div v-if="dialog.type === 'preview'">
        <el-row>
          <el-col :span="6">
            <el-scrollbar max-height="80vh">
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
            <el-scrollbar max-height="80vh">
              <div class="absolute-rt z-36 right-5 top-2">
                <el-link @click="handleCopyCode" type="primary">
                  <el-icon><CopyDocument /></el-icon>
                  复制
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
      <div v-else-if="dialog.type === 'config'">
        <el-tabs type="border-card">
          <el-tab-pane label="基础信息">
            <el-form :label-width="100">
              <el-row>
                <el-col :span="12">
                  <el-form-item label="表名称">
                    <el-input v-model="dialog.title" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="表描述">
                    <el-input v-model="dialog.title" />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row>
                <el-col :span="12">
                  <el-form-item label="包路径">
                    <el-input v-model="dialog.title" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="实体类名称">
                    <el-input v-model="dialog.title" />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row>
                <el-col :span="12">
                  <el-form-item label="实体类名称">
                    <el-input v-model="dialog.title" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="上级菜单">
                    <el-input v-model="dialog.title" />
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
          </el-tab-pane>
          <el-tab-pane label="字段配置">
            <el-table
              v-loading="loading"
              highlight--currentrow
              :data="tableColumns"
            >
              <el-table-column label="名称" width="200">
                <template #default="scope">
                  <el-form-item>
                    {{ scope.row.columnName }}
                  </el-form-item>
                </template>
              </el-table-column>
              <el-table-column label="类型" width="200">
                <template #default="scope">
                  <el-form-item>
                    {{ scope.row.dataType }}
                  </el-form-item>
                </template>
              </el-table-column>
              <el-table-column label="描述">
                <template #default="scope">
                  <el-form-item
                    :prop="'tableColumns.' + scope.$index + '.columnComment'"
                  >
                    <el-input v-model="scope.row.columnComment" />
                  </el-form-item>
                </template>
              </el-table-column>
              <el-table-column label="列表" width="70">
                <template #default="scope">
                  <el-form-item>
                    <el-checkbox v-model="scope.row.showList" />
                  </el-form-item>
                </template>
              </el-table-column>

              <el-table-column label="表单" width="70">
                <template #default="scope">
                  <el-form-item>
                    <el-checkbox v-model="scope.row.showForm" />
                  </el-form-item>
                </template>
              </el-table-column>

              <el-table-column label="查询" width="70">
                <template #default="scope">
                  <el-form-item>
                    <el-checkbox v-model="scope.row.showQuerys" />
                  </el-form-item>
                </template>
              </el-table-column>

              <el-table-column label="表单类型">
                <template #default="scope">
                  <el-form-item>
                    <el-select
                      v-model="scope.row.htmlType"
                      placeholder="请选择"
                    >
                      <el-option label="输入框" value="input" />
                      <el-option label="下拉框" value="select" />
                      <el-option label="日期选择" value="date" />
                    </el-select>
                  </el-form-item>
                </template>
              </el-table-column>

              <el-table-column label="查询方式">
                <template #default="scope">
                  <el-form-item>
                    <el-select
                      v-model="scope.row.queryType"
                      placeholder="请选择"
                    >
                      <el-option label="等于" value="eq" />
                      <el-option label="模糊" value="like" />
                      <el-option label="范围" value="range" />
                    </el-select>
                  </el-form-item>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
        </el-tabs>
      </div>

      <template #footer>
        <el-button @click="handleCloseDialog">取 消</el-button>
        <el-button type="primary" @click="handleSubmit">确 定</el-button>
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
import type { Editor, EditorConfiguration } from "codemirror";
const { copy, copied } = useClipboard();

const code = ref();
const cmRef = ref<CmComponentRef>();
const cmOptions: EditorConfiguration = {
  mode: "text/javascript",
};

import DatabaseAPI, {
  TablePageVO,
  TableColumnVO,
  TablePageQuery,
  GeneratorPreviewVO,
} from "@/api/generator";

const queryFormRef = ref(ElForm);

const loading = ref(false);
const total = ref(0);

const queryParams = reactive<TablePageQuery>({
  pageNum: 1,
  pageSize: 10,
});

const pageData = ref<TablePageVO[]>([]);

const tableColumns = ref<TableColumnVO[]>([]);

const dialog = reactive({
  type: "",
  visible: false,
  title: "",
});

/** 查询 */
function handleQuery() {
  loading.value = true;
  DatabaseAPI.getTablePage(queryParams)
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

function handleCloseDialog() {
  dialog.visible = false;
}

interface TreeNode {
  label: string;
  content?: string;
  children?: TreeNode[];
}

const treeData = ref<TreeNode[]>([]);

/** 打开弹窗 */
function handleOpenDialog(type: string, tableName: string) {
  dialog.visible = true;
  dialog.type = type;
  if (type === "preview") {
    treeData.value = [];
    DatabaseAPI.getPreviewData(tableName).then((data) => {
      dialog.title = `预览 ${tableName}`;

      // 组装树形结构完善代码
      const tree = buildTree(data);
      treeData.value = [tree];

      // 默认选中第一个叶子节点并设置 code 值
      const firstLeafNode = findFirstLeafNode(tree);
      if (firstLeafNode) {
        code.value = firstLeafNode.content || "";
      }
    });
  } else if (type === "config") {
    DatabaseAPI.getTableColumns(tableName).then((data) => {
      dialog.title = `配置 ${tableName}`;
      tableColumns.value = data;
    });
  }
}

/**
 * 递归构建树形结构
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
    const specialPaths = [
      "src\\main",
      "youlai-boot",
      "vue3-element-admin",
      "java",
      "com\\youlai\\system",
    ];

    // 检查路径中的特殊部分并合并它们
    const mergedParts: string[] = [];
    let buffer: string[] = [];

    console.log("parts", parts);

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

function handleSubmit() {}

onMounted(() => {
  handleQuery();
  cmRef.value?.destroy();
});
</script>
