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
      tableColumns.value = data;
    });
  }
}

function handleSubmit() {}

onMounted(() => {
  handleQuery();
});
</script>

<style lang="scss" scoped></style>
