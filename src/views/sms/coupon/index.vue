<!--优惠券-->
<script lang="ts">
export default {
  name: 'coupon',
};
</script>

<script setup lang="ts">
import { onMounted, reactive, ref, toRefs } from 'vue';
import { ElForm, ElMessage, ElMessageBox, ElCascaderPanel } from 'element-plus';
import { Search, Plus, Edit, Refresh, Delete } from '@element-plus/icons-vue';
import {
  lisCouponPages,
  getCouponFormData,
  updateCoupon,
  addCoupon,
  deleteCoupons,
} from '@/api/sms/coupon';

import { listCategoryOptions } from '@/api/pms/category';
import { listSpuPages } from '@/api/pms/goods';
import { Dialog, Option } from '@/types/common';
import {
  CouponItem,
  CouponQueryParam,
  CouponFormData,
} from '@/types/api/sms/coupon';
import { GoodsItem, GoodsQueryParam } from '@/types/api/pms/goods';

const queryFormRef = ref(ElForm);
const dataFormRef = ref(ElForm);
const spuCategoryRef = ref(ElCascaderPanel);

const state = reactive({
  loading: true,
  ids: [],
  single: true,
  multiple: true,
  queryParams: { pageNum: 1, pageSize: 10 } as CouponQueryParam,
  couponList: [] as CouponItem[],
  total: 0,
  dialog: {
    visible: false,
  } as Dialog,
  //指定商品分类选择Dialog
  spuCategoryChooseDialog: {
    visible: false,
  } as Dialog,
  // 指定商品选择ialog
  spuChooseDialog: {
    visible: false,
  } as Dialog,
  formData: {
    type: 1,
    platform: 0,
    validityPeriodType: 1,
    perLimit: 1,
    applicationScope: 0,
  } as CouponFormData,
  rules: {
    type: [{ required: true, message: '请输入优惠券名称', trigger: 'blur' }],
    name: [{ required: true, message: '请选择优惠券类型', trigger: 'blur' }],
  },
  validityPeriod: '' as any,
  perLimitChecked: false,
  spuCategoryOptions: [] as Option[],
  spuCategoryProps: {
    multiple: true,
    emitPath: false,
  },
  spuList: [] as GoodsItem[],
  spuTotal: 0,
  spuQueryParams: { pageNum: 1, pageSize: 10 } as GoodsQueryParam,
  checkedSpuIds: [],
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
  perLimitChecked,
  spuCategoryOptions,
  spuCategoryProps,
  spuList,
  spuTotal,
  checkedSpuIds,
} = toRefs(state);

/**
 * 查询
 */
function handleQuery() {
  state.loading = true;
  lisCouponPages(queryParams.value).then(({ data }) => {
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

/**
 * 加载商品分类
 */
async function loadSpuCategoryOptions() {
  listCategoryOptions().then(({ data }) => {
    spuCategoryOptions.value = data;
  });
}

async function loadSpuList() {
  const queryParams = { pageNum: 1, pageSize: 10 } as GoodsQueryParam;
  listSpuPages(queryParams).then(({ data }) => {
    spuList.value = data.list;
  });
}

function handleAdd() {
  dialog.value = {
    title: '新增优惠券',
    visible: true,
  };

  loadSpuCategoryOptions();
  loadSpuList();
}

async function handleUpdate(row: any) {
  dialog.value = {
    title: '编辑优惠券',
    visible: true,
  };
  const id = row.id;

  await loadSpuCategoryOptions();
  await loadSpuList();

  getCouponFormData(id).then(({ data }) => {
    formData.value = data;
    perLimitChecked.value = data.perLimit == -1;
    // 有效期转换
    if (data.validityPeriodType == 1) {
      validityPeriod.value = [data.validityBeginTime, data.validityEndTime];
    }

    // 金额转换分→元
    if (formData.value.faceValue) {
      formData.value.faceValue /= 100;
    }
    if (formData.value.minPoint) {
      formData.value.minPoint /= 100;
    }
  });
}

function submitForm() {
  dataFormRef.value.validate((valid: any) => {
    if (valid) {
      const applicationScope = formData.value.applicationScope;
      console.log('applicationScope', applicationScope);
      if (applicationScope == 1) {
        // 指定商品分类
        formData.value.spuCategoryIds =
          spuCategoryRef.value.getCheckedNodes()[0].data.value;
      }

      // 有效期转换
      if (formData.value.validityPeriodType == 1 && validityPeriod.value) {
        formData.value.validityBeginTime = validityPeriod.value[0];
        formData.value.validityEndTime = validityPeriod.value[1];
      }
      // 金额转换元→分
      if (formData.value.faceValue) {
        formData.value.faceValue *= 100;
      }
      if (formData.value.faceValue) {
        formData.value.minPoint *= 100;
      }

      const couponId = formData.value.id;
      if (couponId) {
        updateCoupon(couponId, formData.value).then(() => {
          ElMessage.success('编辑优惠券成功');
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

/**
 * 取消
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
    type: 'warning',
  })
    .then(() => {
      deleteCoupons(ids).then(() => {
        ElMessage.success('删除成功');
        handleQuery();
      });
    })
    .catch(() => ElMessage.info('已取消删除'));
}

function handleSpuQuery() {
  listSpuPages(queryParams.value).then(({ data }) => {
    spuList.value = data.list;
    spuTotal.value = data.total;
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
      <el-table-column prop="typeLabel" min-width="100" label="优惠券类型" />
      <el-table-column prop="faceValueLabel" min-width="100" label="面值" />
      <el-table-column prop="minPointLabel" min-width="100" label="使用门槛" />
      <el-table-column
        prop="validityPeriodLabel"
        min-width="200"
        label="有效期"
      />

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

    <!-- 分页 -->
    <pagination
      v-if="total > 0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="handleQuery"
    />

    <!-- 表单Dialog -->
    <el-dialog
      :title="dialog.title"
      v-model="dialog.visible"
      width="1000px;"
      top="5vh"
    >
      <el-form
        ref="dataFormRef"
        :model="formData"
        :rules="rules"
        label-width="150px"
      >
        <el-form-item label="优惠券类型" prop="type">
          <el-radio-group v-model="formData.type">
            <el-radio :label="1">满减券</el-radio>
            <el-radio :label="2">直减券</el-radio>
            <el-radio :label="3">折扣券</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="优惠券名称" prop="name">
          <el-input v-model="formData.name" />
        </el-form-item>

        <el-form-item label="优惠券面值" prop="faceValueType">
          <el-radio-group
            v-model="formData.faceValueType"
            style="
              display: flex;
              flex-direction: column;
              justify-content: space-between;
            "
          >
            <div>
              <el-radio :label="1">现金</el-radio>
              <el-input
                v-model="formData.faceValue"
                :disabled="formData.faceValueType !== 1"
                placeholder="0.5-1000的数字"
                style="width: 180px"
              >
                <template #append>元</template>
              </el-input>
            </div>
            <div>
              <el-radio :label="2">折扣</el-radio>
              <el-input
                v-model="formData.discount"
                :disabled="formData.faceValueType !== 2"
                placeholder="1-9.9的数字"
                style="width: 180px"
              >
                <template #append>折</template>
              </el-input>
            </div>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="使用门槛" prop="minPoint">
          <el-input
            v-model="formData.minPoint"
            placeholder="0为无限制"
            style="width: 300px"
          >
            <template #prepend>满</template>
            <template #append>元</template>
          </el-input>
        </el-form-item>

        <el-form-item label="有效时间" prop="validType">
          <el-radio-group
            v-model="formData.validityPeriodType"
            style="display: flex; flex-direction: column"
          >
            <div>
              <el-radio :label="1">日期范围</el-radio>
              <el-date-picker
                v-model="validityPeriod"
                type="daterange"
                range-separator="~"
                start-placeholder="开始日期"
                end-placeholder="结束时间"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                :disabled="formData.validityPeriodType !== 1"
              />
            </div>
            <div style="width: 100%">
              <el-radio :label="2">固定天数</el-radio>
              <el-input
                v-model="formData.validityDays"
                style="width: 150px"
                :disabled="formData.validityPeriodType !== 2"
              >
                <template #append>天</template>
              </el-input>
            </div>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="发行量" prop="circulation">
          <el-input
            v-model="formData.circulation"
            placeholder="-1为无限制"
            style="width: 200px"
          >
            <template #prepend>共</template>
            <template #append>张</template>
          </el-input>
        </el-form-item>
        <el-form-item label="每人限领张数" prop="perLimit">
          <el-input
            v-model="formData.perLimit"
            style="width: 200px"
            placeholder="-1为不限制"
          >
            <template #prepend>限</template>
            <template #append>张</template>
          </el-input>
        </el-form-item>

        <el-form-item label="备注信息" prop="remark">
          <el-input type="textarea" v-model="formData.remark" />
        </el-form-item>

        <el-form-item label="商品范围" prop="useType">
          <el-radio-group
            v-model="formData.applicationScope"
            style="width: 100%"
          >
            <el-radio :label="0">全场通用</el-radio>
            <el-radio :label="1">指定商品分类</el-radio>
            <el-radio :label="2">指定商品</el-radio>
          </el-radio-group>

          <div class="application-container">
            <!-- 指定商品分类 -->
            <el-cascader
              ref="spuCategoryRef"
              v-if="formData.applicationScope == 1"
              v-model="formData.spuCategoryIds"
              :options="spuCategoryOptions"
              :props="spuCategoryProps"
              :show-all-levels="true"
              style="width: 450px"
            />

            <el-transfer
              class="application-container__transfer"
              v-model="formData.spuIds"
              v-if="formData.applicationScope == 2"
              filterable
              filter-placeholder="商品名称/编码"
              :data="spuList"
              :titles="['商品列表', '已选择商品']"
              :props="{
                key: 'id',
                label: 'name',
              }"
            >
              <template #left-footer>
                <pagination
                  :total="spuTotal"
                  v-model:page="queryParams.pageNum"
                  v-model:limit="queryParams.pageSize"
                  @pagination="handleSpuQuery"
                  layout="prev, pager, next,"
                />
              </template>
            </el-transfer>
          </div>
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

<style lang="scss">
.application-container {
  margin-top: 20px;

  &__transfer {
    .pagination-container {
      padding: 0 !important;
    }
  }
}
</style>
