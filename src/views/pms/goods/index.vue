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
            :props="{emitPath:false}"
            :options="categoryOptions"
            expand-trigger="hover"
            clearable
            style="width: 300px"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">查询</el-button>
        <el-button icon="el-icon-refresh" @click="handleReset">重置</el-button>
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
              <template #default="scope">{{ scope.row.price | moneyFormatter }}</template>
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
        <template #default="scope">{{ scope.row.originPrice | moneyFormatter }}</template>
      </el-table-column>
      <el-table-column align="center" label="促销价" prop="price">
        <template #default="scope">{{ scope.row.price | moneyFormatter }}</template>
      </el-table-column>
      <el-table-column label="销量" prop="sales" min-width="100"/>
      <el-table-column label="单位" prop="unit" min-width="100"/>
      <el-table-column label="描述" prop="description" min-width="100"/>
      <el-table-column label="详情" prop="detail">
        <template #default="scope">
          <el-dialog :visible.sync="dialogVisible" title="商品详情">
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
    <pagination
        v-show="data.pagination.total>0"
        :total="data.pagination.total"
        :page.sync="data.pagination.page"
        :limit.sync="data.pagination.limit"
        @pagination="handleQuery"/>
  </div>
</template>

<script setup lang="ts">
import {page, removeGoods} from '@/api/pms/goods'
import {cascadeList} from '@/api/pms/category'
import {reactive, ref,onBeforeMount, unref, watchEffect, getCurrentInstance, toRefs} from 'vue'
import {ElMessage, ElMessageBox, ElTree} from 'element-plus'

const data = reactive({
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
  },
  pageList: [],
  categoryOptions: [],
  goodDetail: undefined,
  dialogVisible: false
})

onBeforeMount(()=>{
  loadData()
})
function loadData() {
  loadCategoryOptions()
  handleQuery()
}

function loadCategoryOptions() {
  cascadeList().then(response => {
    data.categoryOptions = ref(response.data)
  })
}

function handleQuery() {
  data.queryParams.page = data.pagination.page
  data.queryParams.limit = data.pagination.limit
  console.log(data.pagination)
  page(data.queryParams).then(response => {
    console.log(response)
    const {data, total} = response
    console.log(total)
    console.log(data.pagination)
    data.pageList = data
    data.pagination.total = total ? total : 0
    data.loading = false
  })
}

function handleReset() {
  data.pagination = {
    page: 1,
    limit: 10,
    total: 0
  }
  data.queryParams = {
    name: undefined,
    categoryId: undefined,
    queryMode: 'page'
  }
  handleQuery()
}

function handleGoodsView(detail: any) {
  data.goodDetail = detail
  data.dialogVisible = true
}

function handleAdd() {
  this.$router.push({path: 'goods-detail'})
}

function handleUpdate(row: any) {
  this.$router.push({path: 'goods-detail', query: {goodsId: row.id}})
}

function handleDelete(row: any) {
  const ids = row.id || data.ids.join(',')
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
  this.$refs.multipleTable.toggleRowSelection(row);
}

function handleSelectionChange(selection: any) {
  data.ids = selection.map((item: { id: any }) => item.id)
  data.single = selection.length != 1
  data.multiple = !selection.length
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
  dialogVisible
} = toRefs(data);
</script>

<style scoped>

</style>
