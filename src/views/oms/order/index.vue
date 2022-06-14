<script lang="ts">
export default {
  name: 'order',
};
</script>

<script setup lang="ts">
import { onMounted, reactive, ref, toRefs } from 'vue';
import { ElForm } from 'element-plus';
import { Order, OrderQueryParam } from '@/types/api/oms/order';
import { Dialog } from '@/types/common';

import { listOrderPages, getOrderDetail } from '@/api/oms/order';
import { Search, Refresh } from '@element-plus/icons-vue';

const queryFormRef = ref(ElForm);

const orderSourceMap = {
  1: '微信小程序',
  2: 'APP',
  3: 'PC',
};

const orderStatusMap = {
  101: '待付款',
  102: '用户取消',
  103: '系统取消',
  201: '已付款',
  202: '申请退款',
  203: '已退款',
  301: '待发货',
  401: '已发货',
  501: '用户收货',
  502: '系统收货',
  901: '已完成',
};

const payTypeMap = {
  1: '支付宝',
  2: '微信',
  3: '会员余额',
};

const state = reactive({
  loading: false,
  ids: [],
  single: true,
  multiple: true,
  dateRange: [] as any,
  queryParams: {
    pageNum: 1,
    pageSize: 10,
  } as OrderQueryParam,
  orderList: [] as Order[],
  total: 0,
  dialog: {
    title: '订单详情',
    visible: false,
  } as Dialog,
  dialogVisible: false,
  orderDetail: {
    order: {
      refundAmount: undefined,
      refundType: undefined,
      refundNote: undefined,
      gmtRefund: undefined,
      confirmTime: undefined,
      gmtDelivery: undefined,
      shipSn: undefined,
      shipChannel: undefined,
      gmtPay: undefined,
      integralPrice: undefined,
      payChannel: undefined,
      skuPrice: undefined,
      couponPrice: undefined,
      freightPrice: undefined,
      orderPrice: undefined,
    },
    member: {},
    orderItems: [],
  },
  orderSourceMap,
  orderStatusMap,
  payTypeMap,
});

const { loading, queryParams, orderList, total, dateRange } = toRefs(state);

function handleQuery() {
  state.loading = true;
  listOrderPages(state.queryParams).then(({ data }) => {
    state.orderList = data.list;
    state.total = data.total;
    state.loading = false;
  });
}

function resetQuery() {
  queryFormRef.value.resetFields();
  handleQuery();
}

function viewDetail(row: any) {
  state.dialog.visible = true;
  getOrderDetail(row.id).then((response: any) => {
    state.orderDetail = response.data;
  });
}

onMounted(() => {
  handleQuery();
});
</script>

<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <el-form ref="queryFormRef" :model="queryParams" :inline="true">
      <el-form-item prop="orderSn">
        <el-input v-model="queryParams.orderSn" placeholder="订单号" />
      </el-form-item>

      <el-form-item>
        <el-date-picker
          v-model="dateRange"
          style="width: 240px"
          value-format="yyyy-MM-dd"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        />
      </el-form-item>

      <el-form-item>
        <el-select
          v-model="queryParams.status"
          class="filter-item"
          placeholder="订单状态"
        >
          <el-option
            v-for="(key, value) in orderStatusMap"
            :key="key"
            :label="key"
            :value="value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :icon="Search" @click="handleQuery"
          >查询</el-button
        >
        <el-button :icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table ref="dataTable" v-loading="loading" :data="orderList" border>
      <el-table-column type="expand" width="100" label="订单商品">
        <template #default="scope">
          <el-table :data="scope.row.orderItems" border>
            <el-table-column label="序号" type="index" width="100" />
            <el-table-column label="商品编号" align="center" prop="skuSn" />
            <el-table-column label="商品规格" align="center" prop="skuName" />
            <el-table-column label="图片" prop="picUrl">
              <template #default="scope">
                <img :src="scope.row.picUrl" width="40" />
              </template>
            </el-table-column>
            <el-table-column align="center" label="单价" prop="price">
              <template #default="scope">{{ scope.row.price }}</template>
            </el-table-column>
            <el-table-column align="center" label="数量" prop="count">
              <template #default="scope">{{ scope.row.count }}</template>
            </el-table-column>
          </el-table>
        </template>
      </el-table-column>

      <el-table-column align="center" prop="orderSn" label="订单编号" />

      <el-table-column align="center" prop="memberId" label="会员ID" />

      <el-table-column align="center" label="订单来源">
        <template #default="scope">
          <el-tag>{{ scope.row.sourceType }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column align="center" label="订单状态">
        <template #default="scope">
          <el-tag>{{ scope.row.status }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column align="center" prop="orderPrice" label="订单金额">
        <template #default="scope">
          {{ scope.row.totalAmount }}
        </template>
      </el-table-column>

      <el-table-column align="center" prop="payPrice" label="支付金额">
        <template #default="scope">
          {{ scope.row.payAmount }}
        </template>
      </el-table-column>

      <el-table-column align="center" label="支付方式">
        <template #default="scope">
          <el-tag>{{ scope.row.payType }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column align="center" prop="gmtCreate" label="创建时间" />

      <el-table-column align="center" label="操作">
        <template #default="scope">
          <el-button @click="viewDetail(scope.row)">查看</el-button>
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
  </div>
</template>

<style scoped></style>
