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
              <i-ep-View />
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
            <el-tree :data="[{ value: 'Controller', label: 'Controller' }]" />
          </el-col>
          <el-col :span="18">
            <div>
              <Codemirror
                v-model:value="code"
                :options="cmOptions"
                border
                ref="cmRef"
                height="100%"
                width="100%"
              />
            </div>
          </el-col>
        </el-row>
      </div>
      <div v-else-if="dialog.type === 'config'">
        <el-tabs type="border-card">
          <el-tab-pane label="User">基础信息</el-tab-pane>
          <el-tab-pane label="Config">字段配置</el-tab-pane>
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

const code = ref();
const cmRef = ref<CmComponentRef>();
const cmOptions: EditorConfiguration = {
  mode: "text/javascript",
};

onMounted(() => {
  setTimeout(() => {
    cmRef.value?.refresh();
  }, 1000);

  setTimeout(() => {
    cmRef.value?.resize(300, 200);
  }, 2000);

  setTimeout(() => {
    cmRef.value?.cminstance.isClean();
  }, 3000);
});

onUnmounted(() => {
  handleQuery();
  cmRef.value?.destroy();
});

import DatabaseAPI, {
  TablePageVO,
  TableColumnVO,
  TablePageQuery,
  GeneratorPreviewVO,
} from "@/api/database";

const queryFormRef = ref(ElForm);

const loading = ref(false);
const total = ref(0);

const queryParams = reactive<TablePageQuery>({
  pageNum: 1,
  pageSize: 10,
});

const pageData = ref<TablePageVO[]>([]);

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

/** 打开弹窗 */
function handleOpenDialog(type: string, tableName: string) {
  dialog.visible = true;
  dialog.type = type;
  if (type === "preview") {
    DatabaseAPI.getPreviewData(tableName).then((data) => {
      dialog.title = `预览 ${tableName}`;
      code.value = data[0].content;
    });
  } else if (type === "config") {
    DatabaseAPI.getTableColumns(tableName).then((data) => {
      dialog.title = `配置 ${tableName}`;
    });
  }
}

function handleSubmit() {}

onMounted(() => {
  handleQuery();
});
</script>

<style lang="scss" scoped></style>
