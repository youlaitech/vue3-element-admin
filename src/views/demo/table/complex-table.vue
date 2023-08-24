<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="listQuery.title"
        placeholder="Title"
        style="width: 200px"
        class="filter-item"
        @keyup.enter="handleFilter"
      />
      <el-select
        v-model="listQuery.importance"
        placeholder="Imp"
        clearable
        style="width: 90px"
        class="filter-item"
      >
        <el-option
          v-for="item in importanceOptions"
          :key="item"
          :label="item"
          :value="item"
        />
      </el-select>
      <el-select
        v-model="listQuery.type"
        placeholder="Type"
        clearable
        class="filter-item"
        style="width: 130px"
      >
        <el-option
          v-for="item in calendarTypeOptions"
          :key="item.key"
          :label="item.display_name + '(' + item.key + ')'"
          :value="item.key"
        />
      </el-select>
      <el-select
        v-model="listQuery.sort"
        style="width: 140px"
        class="filter-item"
        @change="handleFilter"
      >
        <el-option
          v-for="item in sortOptions"
          :key="item.key"
          :label="item.label"
          :value="item.key"
        />
      </el-select>
      <el-button
        class="filter-item"
        type="primary"
        :icon="Search"
        @click="handleFilter"
      >
        Search
      </el-button>

      <el-button
        class="filter-item"
        style="margin-left: 10px"
        type="primary"
        :icon="Edit"
        @click="handleCreate"
      >
        Add
      </el-button>

      <el-button
        :loading="downloadLoading"
        class="filter-item"
        type="primary"
        :icon="Download"
        @click="handleDownload"
      >
        Export
      </el-button>
      <el-checkbox
        v-model="showReviewer"
        class="filter-item"
        style="margin-left: 15px"
        @change="tableKey = tableKey + 1"
      >
        reviewer
      </el-checkbox>
    </div>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%"
      @sort-change="sortChange"
    >
      <el-table-column
        label="ID"
        prop="id"
        sortable="custom"
        align="center"
        width="80"
        :class-name="getSortClass('id')"
      >
        <template #default="{ row }">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column width="160px" align="center" label="Date">
        <template #default="{ row }">
          <span>{{ formatDate(row.timestamp) }}</span>
        </template>
      </el-table-column>

      <el-table-column label="Title" min-width="150px">
        <template #default="{ row }">
          <span class="link-type" @click="handleUpdate(row)">{{
            row.title
          }}</span>
          <el-tag>
            {{ calendarTypeKeyValue[row.type] }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="Author" width="110px" align="center">
        <template #default="{ row }">
          <span>{{ row.author }}</span>
        </template>
      </el-table-column>
      <el-table-column
        v-if="showReviewer"
        label="Reviewer"
        width="110px"
        align="center"
      >
        <template #default="{ row }">
          <span style="color: red">{{ row.reviewer }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Imp" width="80px">
        <template #default="{ row }">
          <svg-icon
            v-for="n in +row.importance ? +row.importance : 0"
            :key="n"
            icon-class="star"
            class="meta-item__icon"
          />
        </template>
      </el-table-column>
      <el-table-column label="Readings" align="center" width="95">
        <template #default="{ row }">
          <span
            v-if="row.pageviews"
            class="link-type"
            @click="handleFetchPv(row.id)"
            >{{ row.pageviews }}</span
          >
          <span v-else>0</span>
        </template>
      </el-table-column>

      <el-table-column label="Status" class-name="status-col" width="100">
        <template #default="{ row }">
          <el-tag :type="statusType(row.status)">
            {{ row.status }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column
        label="Actions"
        align="center"
        width="260"
        class-name="small-padding fixed-width"
      >
        <template #default="{ row, $index }">
          <el-button type="primary" size="default" @click="handleUpdate(row)">
            编辑
          </el-button>
          <el-button
            v-if="row.status != 'published'"
            size="default"
            type="success"
            @click="handleModifyStatus(row, 'published')"
          >
            发布
          </el-button>
          <el-button
            v-if="row.status != 'draft'"
            size="default"
            @click="handleModifyStatus(row, 'draft')"
          >
            草稿
          </el-button>

          <el-button
            size="default"
            type="danger"
            @click="handleDelete(row, $index)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      v-model:page="listQuery.page"
      v-model:limit="listQuery.limit"
      @pagination="getList"
    />

    <el-dialog v-model="dialogPvVisible" title="Reading statistics">
      <el-table
        :data="pvData"
        border
        fit
        highlight-current-row
        style="width: 100%"
      >
        <el-table-column prop="key" label="Channel" />
        <el-table-column prop="pv" label="Pv" />
      </el-table>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="dialogPvVisible = false">
            Confirm
          </el-button>
        </span>
      </template>
    </el-dialog>
    <el-dialog
      :title="textMap[dialogStatus]"
      v-model="dialogFormVisible"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :rules="rules"
        :model="formData"
        label-position="left"
        label-width="70px"
        style="width: 400px; margin-left: 50px"
      >
        <el-form-item label="Type" prop="type">
          <el-select
            v-model="formData.type"
            class="filter-item"
            placeholder="Please select"
          >
            <el-option
              v-for="item in calendarTypeOptions"
              :key="item.key"
              :label="item.display_name"
              :value="item.key"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="Date" prop="timestamp">
          <el-date-picker
            v-model="formData.timestamp"
            type="datetime"
            placeholder="Please pick a date"
          />
        </el-form-item>
        <el-form-item label="Title" prop="title">
          <el-input v-model="formData.title" />
        </el-form-item>
        <el-form-item label="Status">
          <el-select
            v-model="formData.status"
            class="filter-item"
            placeholder="Please select"
          >
            <el-option
              v-for="item in statusOptions"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="Imp">
          <el-rate
            v-model="formData.importance"
            :colors="['#99A9BF', '#F7BA2A', '#FF9900']"
            :max="3"
            style="margin-top: 8px"
          />
        </el-form-item>
        <el-form-item label="Remark">
          <el-input
            v-model="formData.remark"
            :autosize="{ minRows: 2, maxRows: 4 }"
            type="textarea"
            placeholder="Please input"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="resetForm(formRef)">Reset</el-button>
          <el-button @click="dialogFormVisible = false"> Cancel </el-button>
          <el-button
            type="primary"
            @click="
              dialogStatus === 'create'
                ? createData(formRef)
                : updateData(formRef)
            "
          >
            Confirm</el-button
          >
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { Edit, Search, Download } from "@element-plus/icons-vue";
import type { FormInstance, FormRules } from "element-plus";

import {
  fetchList,
  fetchPv,
  createArticle,
  updateArticle,
  deleteArticle,
  ArticleQuery,
  ArticleDetail,
  ArticleCreate,
  ArticleUpdate,
} from "@/api/article";

defineOptions({
  // eslint-disable-next-line
  name: "ComplexTable",
  inheritAttrs: false,
});

const importanceOptions = [1, 2, 3];
const sortOptions = [
  { label: "ID Ascending", key: "+id" },
  { label: "ID Descending", key: "-id" },
];
const statusOptions = ["published", "draft", "deleted"];
const statusType = (status: string) => {
  const statusMap = {
    published: "success",
    draft: "info",
    deleted: "danger",
  };
  return statusMap[status as keyof typeof statusMap];
};

const showReviewer = ref(false);
const downloadLoading = ref(false);
const tableKey = ref(0);
const listLoading = ref(true);
const list = ref<ArticleDetail[]>([]);
const total = ref(0);
const dialogPvVisible = ref(false);
const pvData = ref({});
const dialogFormVisible = ref(false);

const formRef = ref<FormInstance>();

interface Form {
  id?: number;
  type?: string;
  timestamp?: Date;
  title?: string;
  status?: string;
  importance?: number;
  remark?: string;
}

const formData = ref<Form>({});
const rules = reactive<FormRules>({
  type: [{ required: true, message: "type is required", trigger: "change" }],
  timestamp: [
    {
      type: "date",
      required: true,
      message: "timestamp is required",
      trigger: "change",
    },
  ],
  title: [{ required: true, message: "title is required", trigger: "blur" }],
});
const dialogStatus = ref<any>();
const textMap: any = {
  update: "Edit",
  create: "Create",
};

const listQuery = ref<ArticleQuery>({
  page: 1,
  limit: 10,
  importance: undefined,
  title: undefined,
  type: undefined,
  sort: "+id",
});

const calendarTypeOptions = [
  { key: "CN", display_name: "China" },
  { key: "US", display_name: "USA" },
  { key: "JP", display_name: "Japan" },
  { key: "EU", display_name: "Eurozone" },
];

// arr to obj, such as { CN : "China", US : "USA" }
const calendarTypeKeyValue = calendarTypeOptions.reduce((acc: any, cur) => {
  acc[cur.key] = cur.display_name;
  return acc;
}, {});

const getList = () => {
  listLoading.value = true;
  fetchList(listQuery.value).then((res) => {
    list.value = res.data.items as ArticleDetail[];
    total.value = res.data.total;
    listLoading.value = false;
  });
};

const handleFilter = () => {
  listQuery.value.page = 1;
  getList();
};

const handleCreate = () => {
  console.log("handleCreate");
  formData.value = {};
  dialogStatus.value = "create";
  dialogFormVisible.value = true;
};

const formatJson = (filterVal: string[]) => {
  return list.value.map((v: any) =>
    filterVal.map((j: any) => {
      if (j === "timestamp") {
        return formatDate(v[j]);
      } else {
        return v[j];
      }
    })
  );
};

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp);
  return date
    .toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    })
    .replace(/\//g, "-");
};

const handleDownload = () => {
  downloadLoading.value = true;
  import("./Export2Excel").then((excel) => {
    const tHeader = ["timestamp", "title", "type", "importance", "status"];
    const filterVal = ["timestamp", "title", "type", "importance", "status"];
    const data = formatJson(filterVal);
    excel.export_json_to_excel({
      header: tHeader,
      data,
      filename: "table-list",
    });
    downloadLoading.value = false;
  });
};

const sortChange = (data: any) => {
  const { prop, order } = data;
  if (prop === "id") {
    if (order === "ascending") {
      listQuery.value.sort = "+id";
    } else {
      listQuery.value.sort = "-id";
    }
    handleFilter();
  }
};

const getSortClass = (key: string) => {
  const sort = listQuery.value.sort;
  if (sort === `+${key}`) {
    return "ascending";
  } else if (sort === `-${key}`) {
    return "descending";
  } else {
    return "";
  }
};

const handleUpdate = (row: any) => {
  formData.value = Object.assign({}, row);
  dialogStatus.value = "update";
  dialogFormVisible.value = true;
  console.log(formData.value);
  return;
};

const createData = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  await formEl.validate((valid) => {
    if (valid) {
      console.log("submit!");
      createArticle(formData.value as ArticleCreate).then((res) => {
        const article = res.data.article;
        list.value.push(article);
        dialogFormVisible.value = false;
        total.value += 1;
        ElNotification({
          title: "Success",
          message: `创建成功 id:${article.id}`,
          type: "success",
        });
      });
    } else {
      console.log("error submit!");
      return false;
    }
  });
};

const updateData = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  await formEl.validate((valid, fields) => {
    if (valid) {
      updateArticle(formData.value as ArticleUpdate).then((res) => {
        console.log("updateArticle", res);
        const article = res.data.article;
        const index = list.value.findIndex((item) => item.id === article.id);
        list.value.splice(index, 1, article);
        dialogFormVisible.value = false;
        ElNotification({
          title: "Success",
          message: `修改成功 id:${article.id}`,
          type: "success",
        });
      });
      return true;
    } else {
      console.log("error submit!", fields);
      return false;
    }
  });
};

const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.resetFields();
};

const handleFetchPv = (id: number) => {
  console.log("handleFetchPv", id);
  fetchPv(id).then((res) => {
    console.log("fetchPv", res);
    pvData.value = res.data.pvData;
    dialogPvVisible.value = true;
  });
};

const handleModifyStatus = (row: any, status: string) => {
  console.log("handleModifyStatus", row, status);
  const id = row.id;
  updateArticle({ id, status }).then((res) => {
    console.log("updateArticle", res);
    const updateArticle = res.data.article;
    const index = list.value.findIndex((item) => item.id === id);
    list.value.splice(index, 1, updateArticle);
  });
};

const handleDelete = (row: any, index: number) => {
  deleteArticle(row.id).then((res) => {
    list.value.splice(index, 1);
    total.value -= 1;
    ElNotification({
      title: "Success",
      message: `删除成功 id:${row.id}`,
      type: "success",
    });
  });
};

onMounted(async () => {
  getList();
});
</script>

<style lang="scss" scoped>
.filter-container {
  padding-bottom: 10px;

  .filter-item {
    margin-right: 10px;
    margin-bottom: 10px;
  }
}
</style>
