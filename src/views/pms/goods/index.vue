<!-- setup 无法设置组件名称，组件名称keepAlive必须 -->
<script lang="ts">
export default {
  name: 'goods',
};
</script>

<script setup lang="ts">
import { reactive, ref, onMounted, toRefs } from 'vue';
import { ElTable, ElMessage, ElMessageBox } from 'element-plus';
import { useRouter } from 'vue-router';

import {
  Search,
  Position,
  Edit,
  Refresh,
  Delete,
  View,
} from '@element-plus/icons-vue';
import { listSpuPages, deleteSpu } from '@/api/pms/goods';
import { listCategoryOptions } from '@/api/pms/category';
import { GoodsItem, GoodsQueryParam } from '@/types/api/pms/goods';
import { moneyFormatter } from '@/utils/filter';
import { Option } from '@/types/common';

const dataTableRef = ref(ElTable);
const router = useRouter();

const state = reactive({
  // 遮罩层
  loading: true,
  // 选中数组
  ids: [],
  // 非单个禁用
  single: true,
  // 非多个禁用
  multiple: true,
  total: 0,
  queryParams: {
    pageNum: 1,
    pageSize: 10,
  } as GoodsQueryParam,
  goodsList: [] as GoodsItem[],
  categoryOptions: [] as Option[],
  goodDetail: undefined,
  dialogVisible: false,
});

const {
  loading,
  multiple,
  queryParams,
  goodsList,
  categoryOptions,
  goodDetail,
  total,
  dialogVisible,
} = toRefs(state);

function handleQuery() {
  state.loading = true;
  listSpuPages(state.queryParams).then(({ data }) => {
    state.goodsList = data.list;
    state.total = data.total;
    state.loading = false;
  });
}

function resetQuery() {
  state.queryParams = {
    pageNum: 1,
    pageSize: 10,
    name: undefined,
    categoryId: undefined,
  };
  handleQuery();
}

function handleGoodsView(detail: any) {
  state.goodDetail = detail;
  state.dialogVisible = true;
}

function handleAdd() {
  router.push({ path: 'goods-detail' });
}

function handleUpdate(row: any) {
  router.push({
    path: 'goods-detail',
    query: { goodsId: row.id, categoryId: row.categoryId },
  });
}

function handleDelete(row: any) {
  const ids = row.id || state.ids.join(',');
  ElMessageBox.confirm('是否确认删除选中的数据项?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(function () {
      return deleteSpu(ids);
    })
    .then(() => {
      ElMessage.success('删除成功');
      handleQuery();
    });
}

function handleRowClick(row: any) {
  dataTableRef.value.toggleRowSelection(row);
}

function handleSelectionChange(selection: any) {
  state.ids = selection.map((item: { id: any }) => item.id);
  state.single = selection.length != 1;
  state.multiple = !selection.length;
}

onMounted(() => {
  listCategoryOptions().then(({ data }) => {
    categoryOptions.value = data;
  });
  handleQuery();
});
</script>

<template>
  <div class="app-container">
    <el-form ref="queryForm" :inline="true">
      <el-form-item>
        <el-button type="success" :icon="Position" @click="handleAdd"
          >发布商品</el-button
        >
        <el-button
          type="danger"
          :icon="Delete"
          @click="handleDelete"
          :disabled="multiple"
          >删除</el-button
        >
      </el-form-item>
      <el-form-item>
        <el-input
          v-model="queryParams.name"
          placeholder="商品名称"
          clearable
        ></el-input>
      </el-form-item>
      <el-form-item>
        <el-cascader
          v-model="queryParams.categoryId"
          placeholder="商品分类"
          :props="{ emitPath: false }"
          :options="categoryOptions"
          clearable
          style="width: 300px"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :icon="Search" @click="handleQuery"
          >查询</el-button
        >
        <el-button :icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table
      ref="dataTableRef"
      v-loading="loading"
      :data="goodsList"
      @selection-change="handleSelectionChange"
      @row-click="handleRowClick"
      border
    >
      <el-table-column type="selection" min-width="5%" center />
      <el-table-column type="expand" width="120" label="库存信息">
        <template #default="props">
          <el-table :data="props.row.skuList" border>
            <el-table-column align="center" label="商品编码" prop="skuSn" />
            <el-table-column align="center" label="商品规格" prop="name" />
            <el-table-column label="图片" prop="picUrl">
              <template #default="scope">
                <img :src="scope.row.picUrl" width="40" />
              </template>
            </el-table-column>
            <el-table-column align="center" label="现价" prop="price">
              <template #default="scope">{{
                moneyFormatter(scope.row.price)
              }}</template>
            </el-table-column>
            <el-table-column align="center" label="库存" prop="stockNum" />
          </el-table>
        </template>
      </el-table-column>
      <el-table-column label="商品名称" prop="name" min-width="140" />
      <el-table-column label="商品图片">
        <template #default="scope">
          <el-popover placement="right" :width="400" trigger="hover">
            <img :src="scope.row.picUrl" width="400" height="400" />
            <template #reference>
              <img
                :src="scope.row.picUrl"
                style="max-height: 60px; max-width: 60px"
              />
            </template>
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column label="商品类目" prop="categoryName" min-width="100" />
      <el-table-column label="商品品牌" prop="brandName" min-width="100" />
      <el-table-column align="center" label="零售价" prop="originalPrice">
        <template #default="scope">{{
          moneyFormatter(scope.row.originPrice)
        }}</template>
      </el-table-column>
      <el-table-column align="center" label="促销价" prop="price">
        <template #default="scope">{{
          moneyFormatter(scope.row.price)
        }}</template>
      </el-table-column>
      <el-table-column label="销量" prop="sales" min-width="100" />
      <el-table-column label="单位" prop="unit" min-width="100" />
      <el-table-column
        label="描述"
        prop="description"
        width="300"
        :show-overflow-tooltip="true"
      />
      <el-table-column label="详情" prop="detail">
        <template #default="scope">
          <el-button
            type="primary"
            :icon="View"
            circle
            plain
            @click.stop="handleGoodsView(scope.row.detail)"
          />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120">
        <template #default="scope">
          <el-button
            type="primary"
            :icon="Edit"
            circle
            plain
            @click.stop="handleUpdate(scope.row)"
          />
          <el-button
            type="danger"
            :icon="Delete"
            circle
            plain
            @click.stop="handleDelete(scope.row)"
          />
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页工具条 -->
    <pagination
      v-if="total > 0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="handleQuery"
    />
    <el-dialog v-model="dialogVisible" title="商品详情">
      <div class="goods-detail-box" v-html="goodDetail" />
    </el-dialog>
  </div>
</template>

<style scoped></style>
