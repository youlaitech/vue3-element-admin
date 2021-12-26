<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <el-form
        ref="queryForm"
        :model="queryParams"
        :inline="true"
        size="small"
    >
      <el-form-item prop="orderSn">
        <el-input v-model="queryParams.orderSn" placeholder="订单号"/>
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
              :label="key"
              :value="value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :icon="Search" @click="handleQuery">查询</el-button>
        <el-button :icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table
        ref="dataTable"
        v-loading="loading"
        :data="pageList"
        border
    >
      <el-table-column type="expand" width="100" label="订单商品">
        <template #default="scope">
          <el-table
              :data="scope.row.orderItems"
              size="small"
              border
          >
            <el-table-column label="序号" type="index" width="100"/>
            <el-table-column label="商品编号" align="center" prop="skuCode"/>
            <el-table-column label="商品规格" align="center" prop="skuName"/>
            <el-table-column label="图片" prop="skuPic">
              <template slot-scope="scope">
                <img :src="scope.row.skuPic" width="40">
              </template>
            </el-table-column>
            <el-table-column align="center" label="单价" prop="skuPrice">
              <template slot-scope="scope">{{ scope.row.skuPrice | moneyFormatter }}</template>
            </el-table-column>
            <el-table-column align="center" label="数量" prop="skuQuantity">
              <template slot-scope="scope">{{ scope.row.skuQuantity }}</template>
            </el-table-column>
          </el-table>
        </template>
      </el-table-column>

      <el-table-column align="center" prop="orderSn" label="订单编号"/>

      <el-table-column align="center" prop="memberId" label="会员ID"/>

      <el-table-column align="center" label="订单来源">
        <template #default="scope">
          <el-tag>{{ scope.row.sourceType | orderSourceFilter }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column align="center" label="订单状态">
        <template #default="scope">
          <el-tag>{{ scope.row.status | orderStatusFilter }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column align="center" prop="orderPrice" label="订单金额">
        <template #default="scope">
          {{ scope.row.totalAmount | moneyFormatter }}
        </template>
      </el-table-column>

      <el-table-column align="center" prop="payPrice" label="支付金额">
        <template #default="scope">
          {{ scope.row.payAmount | moneyFormatter }}
        </template>
      </el-table-column>

      <el-table-column align="center" label="支付方式">
        <template #default="scope">
          <el-tag>{{ scope.row.payType | payTypeFilter }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column align="center" prop="gmtCreate" label="创建时间"/>

      <el-table-column align="center" label="操作">
        <template #default="scope">
          <el-button size="mini" @click="viewDetail(scope.row)">查看</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页工具条 -->
    <pagination
        v-show="total>0"
        :total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="handleQuery"
    />


    <!-- 订单详情弹窗 -->
    <el-dialog
        v-model="dialog.visible"
        :title="dialog.title"
        width="800"
        top="5vh"
    >
      <section
          ref="print"
      >
        <el-form
            :data="orderDetail"
            label-position="left"
        >
          <el-form-item label="订单编号">
            <span>{{ orderDetail.order.orderSn }}</span>
          </el-form-item>
          <el-form-item label="订单状态">
            <el-tag>{{ orderDetail.order.status | orderStatusFilter }}</el-tag>
          </el-form-item>
          <el-form-item label="订单用户">
            <span>{{ orderDetail.member.nickname }}</span>
          </el-form-item>
          <el-form-item label="买家留言">
            <span>{{ orderDetail.order.message }}</span>
          </el-form-item>
          <el-form-item label="收货信息">
            <span>（收货人）{{ orderDetail.order.consignee }}</span>
            <span>（手机号）{{ orderDetail.order.mobile }}</span>
            <span>（地址）{{ orderDetail.order.address }}</span>
          </el-form-item>
          <el-form-item label="商品信息">
            <el-table :data="orderDetail.orderItems" border fit highlight-current-row>
              <el-table-column align="center" label="商品名称" prop="spuName"/>
              <el-table-column align="center" label="货品规格" prop="skuspecs"/>
              <el-table-column align="center" label="货品价格" prop="skuPrice"/>
              <el-table-column align="center" label="货品数量" prop="skuQuantity"/>
              <el-table-column align="center" label="货品图片" prop="skuPic">
                <template slot-scope="scope">
                  <img :src="scope.row.skuPic" width="40">
                </template>
              </el-table-column>
            </el-table>
          </el-form-item>
          <el-form-item label="费用信息">
            <span>
              (订单费用){{ orderDetail.order.orderPrice }}元 =
              (商品总价){{ orderDetail.order.skuPrice }}元 +
              (快递费用){{ orderDetail.order.freightPrice }}元 -
              (优惠减免){{ orderDetail.order.couponPrice }}元 -
              (积分减免){{ orderDetail.order.integralPrice }}元
            </span>
          </el-form-item>
          <el-form-item label="支付信息">
            <span>（支付渠道）{{ orderDetail.order.payChannel | payTypeFilter }}</span>
            <span>（支付时间）{{ orderDetail.order.gmtPay }}</span>
          </el-form-item>
          <el-form-item label="快递信息">
            <span>（物流渠道）{{ orderDetail.order.shipChannel }}</span>
            <span>（物流单号）{{ orderDetail.order.shipSn }}</span>
            <span>（发货时间）{{ orderDetail.order.gmtDelivery }}</span>
          </el-form-item>
          <el-form-item label="退款信息">
            <span>（退款金额）{{ orderDetail.order.refundAmount }}元</span>
            <span>（退款类型）{{ orderDetail.order.refundType }}</span>
            <span>（退款备注）{{ orderDetail.order.refundNote }}</span>
            <span>（退款时间）{{ orderDetail.order.gmtRefund }}</span>
          </el-form-item>
          <el-form-item label="收货信息">
            <span>（确认收货时间）{{ orderDetail.order.confirmTime }}</span>
          </el-form-item>
        </el-form>
      </section>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>


  </div>
</template>

<script setup lang="ts">

import {listOrdersWithPage, getOrderDetail} from '@/api/oms/order'
import {onMounted, reactive, ref, toRefs} from "vue"
import {ElForm, ElMessage, ElMessageBox} from "element-plus"
import {Search, Plus, Edit, Refresh, Delete} from '@element-plus/icons'

const dataForm = ref(ElForm)  // 属性名必须和元素的ref属性值一致

const orderSourceMap = {
  1: '微信小程序',
  2: 'APP',
  3: 'PC'
}

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
  901: '已完成'
}

const payTypeMap = {
  1: '支付宝',
  2: '微信',
  3: '会员余额'
}


const state = reactive({
  loading: false,
  ids: [],
  single: true,
  multiple: true,
  dateRange: [],
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    orderSn: undefined
  },
  pageList: [],
  total: 0,
  dialog: {
    title: '订单详情',
    visible: false
  },
  dialogVisible: false,
  orderDetail: {
    order: {},
    member: {},
    orderItems: []
  },
  orderSourceMap,
  orderStatusMap,
  payTypeMap
})

const {loading, single, multiple, queryParams, pageList, total, dialog, orderDetail} = toRefs(state)

function handleQuery() {
  state.loading = true
  listOrdersWithPage(state.queryParams).then(response => {
    const {data, total} = response as any
    state.pageList = data
    state.total = total
    state.loading = false
  })
}

function resetQuery() {
  state.queryParams = {
    pageNum: 1,
    pageSize: 10,
    orderSn: undefined
  }
  handleQuery()
}

function viewDetail(row: any) {
  state.dialog.visible = true
  getOrderDetail(row.id).then(response => {
    state.orderDetail = response.data
  })
}

function cancel() {
  state.dialog.visible = false
}

onMounted(() => {
  handleQuery()
})
</script>

<style scoped>

</style>
