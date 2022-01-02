<template>
  <div class="app-container">
    <el-form :inline="true" ref="queryForm">
      <el-form-item>
        <el-button type="primary" @click="handleAdd">发布商品</el-button>
        <el-button type="success" @click="handleUpdate" :disabled="single">编辑商品</el-button>
        <el-button type="danger" @click="handleDelete" :disabled="multiple">删除</el-button>
      </el-form-item>
      <el-form-item>
        <el-input v-model="queryParams.name" placeholder="商品名称" clearable></el-input>
      </el-form-item>
      <el-form-item>
        <el-cascader
            v-model="queryParams.categoryId"
            placeholder="商品分类"
            :props="cascaderProps"
            :options="categoryOptions"
            clearable
            style="width: 300px"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :icon="Search" @click="handleQuery">查询</el-button>
        <el-button  :icon="Refresh" @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table
        v-loading="loading"
        id="dataTable"
        ref="multipleTable"
        :data="pageList"
        @selection-change="handleSelectionChange"
        @row-click="handleRowClick"
        border>
      <el-table-column type="selection" min-width="5%" center/>
      <el-table-column type="expand" width="120" label="库存信息">

        <template #default="props">
          <el-table
              :data="props.row.skuList"
              size="small"
              border>
            <el-table-column align="center" label="商品编码" prop="sn"/>
            <el-table-column align="center" label="商品规格" prop="name"/>
            <el-table-column label="图片" prop="picUrl">
              <template #default="scope">
                <img :src="scope.row.picUrl" width="40">
              </template>
            </el-table-column>
            <el-table-column align="center" label="现价" prop="price">
              <template #default="scope">{{  moneyFormatter(scope.row.price) }}</template>
            </el-table-column>
            <el-table-column align="center" label="库存" prop="stock"/>
          </el-table>
        </template>

      </el-table-column>
      <el-table-column label="商品名称" prop="name" min-width="140"/>
      <el-table-column label="商品图片">
        <template #default="row">
          <img :src="row.picUrl" width="40">
        </template>
      </el-table-column>
      <el-table-column label="商品类目" prop="categoryName" min-width="100"/>
      <el-table-column label="商品品牌" prop="brandName" min-width="100"/>
      <el-table-column align="center" label="零售价" prop="originalPrice">
        <template #default="scope">{{ moneyFormatter(scope.row.price) }}</template>
      </el-table-column>
      <el-table-column align="center" label="促销价" prop="price">
        <template #default="scope">{{ moneyFormatter(scope.row.price) }}</template>
      </el-table-column>
      <el-table-column label="销量" prop="sales" min-width="100"/>
      <el-table-column label="单位" prop="unit" min-width="100"/>
      <el-table-column label="描述" prop="description" min-width="100"/>
      <el-table-column label="详情" prop="detail">
        <template #default="scope">
          <el-dialog v-model="dialogVisible" title="商品详情">
            <div class="goods-detail-box" v-html="goodDetail"/>
          </el-dialog>
          <el-button type="primary" size="mini" @click="handleGoodsView(scope.row.detail)">查看</el-button>
        </template>
      </el-table-column>
      <el-table-column label="操作" min-width="120">
        <template #default="scope">
          <el-button
              size="mini"
              @click="handleUpdate(scope.row)">编辑
          </el-button>
          <el-button
              size="mini"
              type="danger"
              @click="handleDelete(scope.row)">删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
        v-show="pagination.total>0"
        :total="pagination.total"
        :page.sync="pagination.page"
        :limit.sync="pagination.limit"
        @pagination="handleQuery">
    </el-pagination>
  </div>
</template>

<script setup lang="ts">
import {Search, Refresh} from '@element-plus/icons'
import {page, removeGoods} from '@/api/pms/goods'
import {listCascadeCategories} from '@/api/pms/category'
import {reactive, ref,onMounted, toRefs} from 'vue'
import {ElMessage, ElMessageBox, ElTree} from 'element-plus'
import { getCurrentInstance } from 'vue'

import {moneyFormatter} from '@/utils/filter'

const {proxy}: any = getCurrentInstance();

const state = reactive({
  // 遮罩层
  loading: true,
  // 选中数组
  ids: [],
  // 非单个禁用
  single: true,
  // 非多个禁用
  multiple: true,
  pagination: {
    page: 1,
    limit: 10,
    total: 0
  },
  queryParams: {
    name: undefined,
    categoryId: undefined,
    page:1,
    limit:10,
    total: 0
  },
  pageList: [],
  categoryOptions: [],
  goodDetail: undefined,
  dialogVisible: false,
  cascaderProps:{emitPath:false,expandTrigger:'hover'}
})


function loadData() {
  loadCategoryOptions()
  handleQuery()
}

function loadCategoryOptions() {
  listCascadeCategories({}).then(response => {
    state.categoryOptions = ref(response.data)
  })
}

 function handleQuery() {
   state.queryParams.page = state.pagination.page
   state.queryParams.limit = state.pagination.limit
  page(state.queryParams).then(response => {
    const {data, total} = response
    state.pageList = data
    state.pagination.total = total ? total : 0
    state.loading = false
  })
}

function handleReset() {
  state.pagination = {
    page: 1,
    limit: 10,
    total: 0
  }
  state.queryParams = {
    name: undefined,
    categoryId: undefined,
    queryMode: 'page'
  }
  handleQuery()
}

function handleGoodsView(detail: any) {
  state.goodDetail = detail
  state.dialogVisible = true
}

function handleAdd() {
  proxy.$router.push({path: 'goods-detail'})
}

function handleUpdate(row: any) {
  proxy.$router.push({path: 'goods-detail', query: {goodsId: row.id}})
}

function handleDelete(row: any) {
  const ids = row.id || state.ids.join(',')
  ElMessageBox.confirm('是否确认删除选中的数据项?', "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(function () {
    return removeGoods(ids)
  }).then(() => {
    ElMessage.success("删除成功")
    handleQuery()
  }).catch(() =>
      ElMessage.info("已取消删除")
  )
}

function handleRowClick(row: any) {
  proxy.$refs.multipleTable.toggleRowSelection(row);
}

function handleSelectionChange(selection: any) {
  state.ids = selection.map((item: { id: any }) => item.id)
  state.single = selection.length != 1
  state.multiple = !selection.length
}

function formatAlbum(val: any) {
  const album = JSON.parse(val);
  if (album && album.length > 0) {
    return album[0]
  }
  return
}

const {
  // 遮罩层
  loading,
  // 选中数组
  ids,
  // 非单个禁用
  single,
  // 非多个禁用
  multiple,
  pagination,
  queryParams,
  pageList,
  categoryOptions,
  goodDetail,
  dialogVisible,
  cascaderProps
} = toRefs(state);

onMounted(()=>{
  loadData()
})
</script>

<style scoped>

</style>
