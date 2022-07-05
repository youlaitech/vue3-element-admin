<!--优惠券管理-->
<script lang="ts">
export default {
  name: 'coupon'
};
</script>

<script setup lang="ts">
import { onMounted, reactive, ref, toRefs } from 'vue';
import { ElForm, ElMessage, ElMessageBox } from 'element-plus';
import { Search, Plus, Edit, Refresh, Delete } from '@element-plus/icons-vue';
import {
  lisCoupontPages,
  getCouponFormData,
  updateCoupon,
  addCoupon,
  deleteCoupons
} from '@/api/sms/coupon';
import { Dialog } from '@/types/common';
import {
  CouponItem,
  CouponQueryParam,
  CouponFormData
} from '@/types/api/sms/coupon';

const queryFormRef = ref(ElForm);
const dataFormRef = ref(ElForm);

const state = reactive({
  loading: true,
  ids: [],
  single: true,
  multiple: true,
  queryParams: { pageNum: 1, pageSize: 10 } as CouponQueryParam,
  couponList: [] as CouponItem[],
  total: 0,
  dialog: {
    title: '',
    visible: false
  } as Dialog,
  formData: {
    type: 1,
    platform: 0,
    validityPeriodType: 1,
    perLimit: 1,
    useType: 0 //使用类型(默认全场通用)
  } as CouponFormData,
  rules: {
    title: [{ required: true, message: '请输入优惠券名称', trigger: 'blur' }],
    beginTime: [{ required: true, message: '请填写开始时间', trigger: 'blur' }],
    endTime: [{ required: true, message: '请填写结束时间', trigger: 'blur' }],
    picUrl: [{ required: true, message: '请上传优惠券图片', trigger: 'blur' }]
  },
  validityPeriod: '' as any,
  totalCountChecked: false,
  perLimitChecked: false
});

const {
  loading,
  multiple,
  queryParams,
  couponList,
  total,
  dialog,
  formData,
  rules,
  validityPeriod,
  totalCountChecked,
  perLimitChecked
} = toRefs(state);

/**
 * 查询
 */
function handleQuery() {
  state.loading = true;
  lisCoupontPages(queryParams.value).then(({ data }) => {
    couponList.value = data.list;
    total.value = data.total;
    loading.value = false;
  });
}
/**
 * 查询重置
 */
function resetQuery() {
  queryFormRef.value.resetFields();
  handleQuery();
}

function handleSelectionChange(selection: any) {
  state.ids = selection.map((item: any) => item.id);
  state.single = selection.length !== 1;
  state.multiple = !selection.length;
}

function handleAdd() {
  dialog.value = {
    title: '添加优惠券',
    visible: true
  };
}

function handleUpdate(row: any) {
  dialog.value = {
    title: '修改优惠券',
    visible: true
  };
  const id = row.id;
  getCouponFormData(id).then(({ data }) => {
    formData.value = data;
    perLimitChecked.value = data.perLimit == -1;
    totalCountChecked.value = data.issueCount == -1;
    // 有效期转换
    if (data.validityPeriodType == 2) {
      validityPeriod.value = [data.validityBeginTime, data.validityEndTime];
    }
  });
}

function submitForm() {
  console.log('validityPeriod', validityPeriod.value[0]);
  dataFormRef.value.validate((valid: any) => {
    if (valid) {
      // 有效期转换
      if (formData.value.validityPeriodType == 2 && validityPeriod.value) {
        formData.value.validityBeginTime = validityPeriod.value[0];
        formData.value.validityEndTime = validityPeriod.value[1];
      }

      const couponId = formData.value.id;
      if (couponId) {
        updateCoupon(couponId, formData.value).then(() => {
          ElMessage.success('修改优惠券成功');
          cancel();
          handleQuery();
        });
      } else {
        addCoupon(formData.value).then(() => {
          ElMessage.success('新增优惠券成功');
          cancel();
          handleQuery();
        });
      }
    }
  });
}

const handleTotalCountChange = (val: any) => {
  formData.value.issueCount = -1;
};

const hanclePerLimitChange = (val: any) => {
  formData.value.perLimit = -1;
};

/**
 * 表单取消
 */
function cancel() {
  state.formData.id = undefined;
  dataFormRef.value.resetFields();
  state.dialog.visible = false;
}

/**
 * 删除优惠券
 */
function handleDelete(row: any) {
  const ids = [row.id || state.ids].join(',');
  ElMessageBox.confirm('确认删除已选中的数据项?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      deleteCoupons(ids).then(() => {
        ElMessage.success('删除成功');
        handleQuery();
      });
    })
    .catch(() => ElMessage.info('已取消删除'));
}

onMounted(() => {
  handleQuery();
});
</script>

<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <el-form ref="queryFormRef" :model="queryParams" :inline="true">
      <el-form-item>
        <el-button type="success" :icon="Plus" @click="handleAdd"
          >新增</el-button
        >
        <el-button
          type="danger"
          :icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          >删除</el-button
        >
      </el-form-item>

      <el-form-item prop="keywords">
        <el-input
          v-model="queryParams.keywords"
          placeholder="优惠券名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :icon="Search" @click="handleQuery"
          >搜索</el-button
        >
        <el-button :icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table
      v-loading="loading"
      :data="couponList"
      @selection-change="handleSelectionChange"
      border
    >
      <el-table-column type="selection" min-width="5" align="center" />
      <el-table-column type="index" label="序号" width="80" align="center" />
      <el-table-column prop="name" min-width="100" label="优惠券名称" />
      <el-table-column prop="code" min-width="100" label="优惠券码" />
      <el-table-column prop="platformLabel" min-width="100" label="使用平台" />
      <el-table-column prop="typeLabel" min-width="100" label="类型" />
      <el-table-column
        prop="faceValueLabel"
        min-width="100"
        label="面值/折扣"
      />
      <el-table-column
        prop="minPointLabel"
        min-width="100"
        label="使用门槛(元)"
      />
      <el-table-column
        prop="validityPeriodLabel"
        min-width="200"
        label="有效期"
      />
      <el-table-column prop="remark" label="使用说明" />

      <el-table-column label="操作" align="center" width="150">
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

    <!-- 表单弹窗 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="1000px">
      <el-form
        ref="dataFormRef"
        :model="formData"
        :rules="rules"
        label-width="150px"
      >
        <el-form-item label="优惠券名称" prop="name">
          <el-input v-model="formData.name" />
        </el-form-item>

        <el-form-item label="适用类型" prop="useType">
          <el-radio-group v-model="formData.useType">
            <el-radio :label="0">全场通用</el-radio>
            <el-radio :label="1">指定商品分类</el-radio>
            <el-radio :label="2">指定商品</el-radio>
          </el-radio-group>

          <!--指定商品分类-->
          <el-tag
            v-for="item in formData.spuCategoryList"
            :key="item.categoryId"
            closable
          >
            {{ item.categoryName }}
          </el-tag>

          <!--指定商品列表-->
          <el-tag v-for="item in formData.spuList" :key="item.spuId" closable>
            {{ item.spuName }}
          </el-tag>
        </el-form-item>

        <el-form-item label="优惠券类型" prop="type">
          <el-radio-group v-model="formData.type">
            <el-radio :label="1">满减券</el-radio>
            <el-radio :label="2">直减券</el-radio>
            <el-radio :label="3">折扣券</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item
          label="优惠券面值(元)"
          v-if="formData.type == 2 || formData.type == 3"
          prop="faceValue"
        >
          <el-input v-model="formData.faceValue" />
        </el-form-item>

        <el-form-item
          label="优惠券折扣"
          v-if="formData.type == 3"
          prop="discount"
        >
          <el-input v-model="formData.discount" />
        </el-form-item>

        <el-form-item label="最低消费金额(元)" prop="minPoint">
          <el-input v-model="formData.minPoint" />
        </el-form-item>

        <el-form-item label="有效期类型" prop="validType">
          <el-radio-group v-model="formData.validityPeriodType">
            <el-radio :label="1">自领取之日起有效天数</el-radio>
            <el-radio :label="2">有效起止时间</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item
          label="有效天数"
          v-if="formData.validityPeriodType == 1"
          prop="validDays"
        >
          <el-input v-model="formData.validityDays" />
        </el-form-item>
        <el-form-item label="有效期" v-if="formData.validityPeriodType == 2">
          <el-date-picker
            v-model="validityPeriod"
            type="daterange"
            range-separator="~"
            start-placeholder="起始时间"
            end-placeholder="截止时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>

        <el-form-item label="发放数量" prop="totalCount">
          <el-input v-model="formData.issueCount" />
          <el-checkbox
            v-model="totalCountChecked"
            label="无限制"
            @change="handleTotalCountChange"
          />
        </el-form-item>
        <el-form-item label="每人限领张数" prop="perLimit">
          <el-checkbox
            v-model="perLimitChecked"
            @change="hanclePerLimitChange"
            label="不限次数"
          />
          <div style="width: 100%">
            <el-input
              v-model="formData.perLimit"
              :readonly="perLimitChecked"
              style="width: 200px"
            >
              <template #prepend>限</template>
              <template #append>次</template>
            </el-input>
          </div>
        </el-form-item>

        <el-form-item label="使用说明" prop="remark">
          <el-input type="textarea" v-model="formData.remark" />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>
