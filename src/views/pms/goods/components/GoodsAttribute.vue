<template>
  <div class="component-container">
    <div class="component-container__main">
      <el-card class="box-card">
        <template #header>
          <span>商品属性</span>
          <el-button
            style="float: right"
            type="success"
            :icon="Plus"
            size="small"
            @click="handleAdd"
          >
            添加属性
          </el-button>
        </template>
        <el-form
          ref="dataFormRef"
          :model="goodsInfo"
          :rules="rules"
          size="small"
          :inline="true"
        >
          <el-table
            :data="goodsInfo.attrList"
            size="small"
            highlight-current-row
            border
          >
            <el-table-column property="name" label="属性名称">
              <template #default="scope">
                <el-form-item
                  :prop="'attrList[' + scope.$index + '].name'"
                  :rules="rules.name"
                >
                  <el-input v-model="scope.row.name" />
                </el-form-item>
              </template>
            </el-table-column>

            <el-table-column property="value" label="属性值">
              <template #default="scope">
                <el-form-item
                  :prop="'attrList[' + scope.$index + '].value'"
                  :rules="rules.value"
                >
                  <el-input v-model="scope.row.value" />
                </el-form-item>
              </template>
            </el-table-column>

            <el-table-column label="操作" width="150">
              <template #default="scope">
                <el-form-item>
                  <el-button
                    v-if="scope.$index > 0"
                    type="danger"
                    :icon="Minus"
                    size="small"
                    circle
                    plain
                    @click.stop="handleRemove(scope.$index)"
                  />
                </el-form-item>
              </template>
            </el-table-column>
          </el-table>
        </el-form>
      </el-card>
    </div>
    <div class="component-container__footer">
      <el-button @click="handlePrev">上一步，填写商品信息</el-button>
      <el-button type="primary" @click="handleNext"
        >下一步，设置商品库存</el-button
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, toRefs, watch } from 'vue';
import { listAttributes } from '@/api/pms/attribute';
import { ElForm } from 'element-plus';
import { Plus, Minus } from '@element-plus/icons-vue';

const emit = defineEmits(['prev', 'next', 'update:modelValue']);
const dataFormRef = ref(ElForm);

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => {},
  },
});

const goodsInfo: any = computed({
  get: () => props.modelValue,
  set: (value) => {
    emit('update:modelValue', value);
  },
});

watch(
  () => goodsInfo.value.categoryId,
  (newVal) => {
    // 商品编辑不加载分类下的属性
    const goodsId = goodsInfo.value.id;
    if (goodsId) {
      return false;
    }
    // 商品新增加载默认分类下的属性
    if (newVal) {
      // type=2 商品分类下的属性
      listAttributes({ categoryId: newVal, type: 2 }).then((response) => {
        const attrList = response.data;
        if (attrList && attrList.length > 0) {
          goodsInfo.value.attrList = attrList;
        } else {
          goodsInfo.value.attrList = [{}];
        }
      });
    } else {
      goodsInfo.value.attrList = [{}];
    }
  },
  {
    immediate: true,
    deep: true,
  }
);

const state = reactive({
  rules: {
    name: [{ required: true, message: '请填写属性名称', trigger: 'blur' }],
    value: [{ required: true, message: '请填写属性值', trigger: 'blur' }],
  },
});

const { rules } = toRefs(state);

function handleAdd() {
  goodsInfo.value.attrList.push({});
}

function handleRemove(index: number) {
  goodsInfo.value.attrList.splice(index, 1);
}

function handlePrev() {
  emit('prev');
}

function handleNext() {
  dataFormRef.value.validate((valid: any) => {
    if (valid) {
      emit('next');
    }
  });
}
</script>

<style lang="scss" scoped>
.component-container {
  &__main {
    margin: 20px auto;
  }

  &__footer {
    position: fixed;
    bottom: 20px;
    right: 20px;
  }
}

.el-form-item--mini.el-form-item {
  margin-top: 18px;
}
</style>
