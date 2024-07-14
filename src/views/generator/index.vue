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
              @click="handlePreview(scope.row.tableName)"
            >
              <i-ep-View />
              预览
            </el-button>
            <el-button
              type="primary"
              size="small"
              link
              @click="handlePreview(scope.row.tableName)"
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
      <el-row>
        <el-col :span="6">123</el-col>
        <el-col :span="18">
          <Codemirror
            v-model:value="code"
            :options="cmOptions"
            border
            ref="cmRef"
            height="400"
            width="600"
            @change="onChange"
            @input="onInput"
            @ready="onReady"
          />
        </el-col>
      </el-row>

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

const code = ref(
  `var i = 0;
for (; i < 9; i++) {
    console.log(i);
    // more statements
}
`
);
const cmRef = ref<CmComponentRef>();
const cmOptions: EditorConfiguration = {
  mode: "text/javascript",
};

const onChange = (val: string, cm: Editor) => {
  console.log(val);
  console.log(cm.getValue());
};

const onInput = (val: string) => {
  console.log(val);
};

const onReady = (cm: Editor) => {
  console.log(cm.focus());
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
const ids = ref<number[]>([]);
const total = ref(0);

const queryParams = reactive<TablePageQuery>({
  pageNum: 1,
  pageSize: 10,
});

const pageData = ref<TablePageVO[]>([]);

const formData = reactive<any>({});

const dialog = reactive({
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

function handlePreview(tableName: string) {
  DatabaseAPI.getPreviewData(tableName).then((data) => {
    dialog.title = `预览 ${tableName}`;
    handleOpenDialog();
  });
}

function handleCloseDialog() {
  dialog.visible = false;
}

function handleOpenDialog() {
  dialog.visible = true;
}

function handleSubmit() {}

/* onMounted(() => {
  handleQuery();
}); */
</script>

<style lang="scss" scoped></style>
