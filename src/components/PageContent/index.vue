<template>
  <el-card shadow="never" class="table-container">
    <template #header>
      <!-- 表格左上方工具栏 -->
      <template v-for="item in contentConfig.toolbar" :key="item">
        <template v-if="typeof item === 'string'">
          <!-- 刷新 -->
          <template v-if="item === 'refresh'">
            <el-button
              type="info"
              icon="refresh"
              @click="handleToolbar(item)"
            />
          </template>
          <!-- 新增 -->
          <template v-else-if="item === 'add'">
            <el-button
              v-hasPerm="[`${contentConfig.pageName}:${item}`]"
              type="success"
              icon="plus"
              @click="handleToolbar(item)"
            >
              新增
            </el-button>
          </template>
          <!-- 删除 -->
          <template v-else-if="item === 'delete'">
            <el-button
              v-hasPerm="[`${contentConfig.pageName}:${item}`]"
              type="danger"
              icon="delete"
              :disabled="removeIds.length === 0"
              @click="handleToolbar(item)"
            >
              删除
            </el-button>
          </template>
          <!-- 导出 -->
          <template v-else-if="item === 'export'">
            <el-button
              v-hasPerm="[`${contentConfig.pageName}:${item}`]"
              type="primary"
              icon="download"
              @click="handleToolbar(item)"
            >
              导出
            </el-button>
          </template>
        </template>
        <!-- 其他 -->
        <template v-else-if="typeof item === 'object'">
          <template v-if="item.auth">
            <el-button
              v-hasPerm="[`${contentConfig.pageName}:${item.auth}`]"
              :icon="item.icon"
              type="default"
              @click="handleToolbar(item.name)"
            >
              {{ item.text }}
            </el-button>
          </template>
          <template v-else>
            <el-button
              :icon="item.icon"
              type="default"
              @click="handleToolbar(item.name)"
            >
              {{ item.text }}
            </el-button>
          </template>
        </template>
      </template>
    </template>
    <!-- 列表 -->
    <el-table
      v-loading="loading"
      :data="pageData"
      :border="true"
      :highlight-current-row="true"
      @selection-change="handleSelectionChange"
    >
      <template v-for="col in contentConfig.cols" :key="col.prop">
        <!-- 列操作栏 -->
        <template v-if="col.templet === 'tool'">
          <el-table-column v-bind="col">
            <template #default="scope">
              <template v-for="item in col.operat" :key="item">
                <template v-if="typeof item === 'string'">
                  <!-- 编辑/删除 -->
                  <template v-if="item === 'edit' || item === 'delete'">
                    <el-button
                      v-hasPerm="[`${contentConfig.pageName}:${item}`]"
                      :type="item === 'edit' ? 'primary' : 'danger'"
                      :icon="item"
                      size="small"
                      link
                      @click="
                        handleOperat({
                          name: item,
                          row: scope.row,
                          column: scope.column,
                          $index: scope.$index,
                        })
                      "
                    >
                      {{ item === "edit" ? "编辑" : "删除" }}
                    </el-button>
                  </template>
                </template>
                <!-- 其他 -->
                <template v-else-if="typeof item === 'object'">
                  <template v-if="item.auth">
                    <el-button
                      v-hasPerm="[`${contentConfig.pageName}:${item.auth}`]"
                      :icon="item.icon"
                      type="primary"
                      size="small"
                      link
                      @click="
                        handleOperat({
                          name: item.name,
                          row: scope.row,
                          column: scope.column,
                          $index: scope.$index,
                        })
                      "
                    >
                      {{ item.text }}
                    </el-button>
                  </template>
                  <template v-else>
                    <el-button
                      :icon="item.icon"
                      type="primary"
                      size="small"
                      link
                      @click="
                        handleOperat({
                          name: item.name,
                          row: scope.row,
                          column: scope.column,
                          $index: scope.$index,
                        })
                      "
                    >
                      {{ item.text }}
                    </el-button>
                  </template>
                </template>
              </template>
            </template>
          </el-table-column>
        </template>
        <!-- 自定义 -->
        <template v-else-if="col.templet === 'custom'">
          <el-table-column v-bind="col">
            <template #default="scope">
              <slot
                :name="col.slotName ?? col.prop"
                :prop="col.prop"
                v-bind="scope"
              ></slot>
            </template>
          </el-table-column>
        </template>
        <!-- 其他 -->
        <template v-else>
          <el-table-column v-bind="col" />
        </template>
      </template>
    </el-table>
    <!-- 分页 -->
    <pagination
      v-if="total > 0"
      v-model:total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="handlePagination"
    />
  </el-card>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";

// 定义接收的属性
interface IOperatData {
  name: string;
  row: any;
  column: any;
  $index: number;
}
const props = defineProps<{
  contentConfig: {
    // 页面名称(参与组成权限标识,如sys:user:xxx)
    pageName: string;
    // 列表的网络请求函数(需返回promise)
    indexAction: (data: any) => Promise<any>;
    // 删除的网络请求函数(需返回promise)
    deleteAction: (data: any) => Promise<any>;
    // 主键名(默认为id)
    pk?: string;
    // 表格工具栏(默认支持refresh,add,delete,export,也可自定义)
    toolbar: any[];
    // table组件列属性(额外的属性templet,operat)
    cols: any[];
  };
}>();
// 定义自定义事件
const emit = defineEmits<{
  addClick: [];
  exportClick: [];
  toolbarClick: [name: string];
  editClick: [row: any];
  operatClick: [data: IOperatData];
}>();
// 暴露的属性和方法
defineExpose({ fetchPageData });

// 主键
const pk = props.contentConfig.pk ?? "id";
// 加载状态
const loading = ref(false);
// 删除ID集合 用于批量删除
const removeIds = ref([]);
// 数据总数
const total = ref(0);
// 列表数据
const pageData = ref([]);
// 每页条数
const pageSize = 10;
// 搜索参数
const queryParams = reactive<any>({
  pageNum: 1,
  pageSize: pageSize,
});
// 上一次搜索条件
let lastFormData = {};
// 获取分页数据
function fetchPageData(formData: any = {}, isRestart = false) {
  loading.value = true;
  lastFormData = formData;
  if (isRestart) {
    queryParams.pageNum = 1;
    queryParams.pageSize = pageSize;
  }
  props.contentConfig
    .indexAction({ ...queryParams, ...formData })
    .then(({ data }) => {
      total.value = data.total;
      pageData.value = data.list;
    })
    .finally(() => {
      loading.value = false;
    });
}
fetchPageData();

// 行选中
function handleSelectionChange(selection: any) {
  removeIds.value = selection.map((item: any) => item[pk]);
}
// 刷新
function handleRefresh() {
  fetchPageData({}, true);
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
  }).then(function () {
    props.contentConfig.deleteAction(ids).then(() => {
      ElMessage.success("删除成功");
      handleRefresh();
    });
  });
}
// 分页
function handlePagination() {
  fetchPageData(lastFormData);
}
// 操作栏
function handleToolbar(name: string) {
  switch (name) {
    case "refresh":
      handleRefresh();
      break;
    case "add":
      emit("addClick");
      break;
    case "delete":
      handleDelete();
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
function handleOperat(data: IOperatData) {
  switch (data.name) {
    case "edit":
      emit("editClick", data.row);
      break;
    case "delete":
      handleDelete(data.row[pk]);
      break;
    default:
      emit("operatClick", data);
      break;
  }
}
</script>

<style lang="scss" scoped></style>
