<template>
  <div class="component-container">
    <div class="component-container__main">
      <el-cascader-panel
        ref="categoryRef"
        :options="categoryOptions"
        v-model="goodsInfo.categoryId"
        :props="{ emitPath: false }"
        @change="handleCategoryChange"
      />
      <div style="margin-top: 20px">
        <el-link type="info" :underline="false" v-show="pathLabels.length > 0"
          >您选择的商品分类:</el-link
        >
        <el-link
          type="danger"
          :underline="false"
          v-for="(item, index) in pathLabels"
          :key="index"
          style="margin-left: 5px"
        >
          {{ item }}
          <CaretRight
            v-show="index < pathLabels.length - 1"
            style="width: 1em; height: 1em; margin-left: 5px"
          />
        </el-link>
      </div>
    </div>
    <div class="component-container__footer">
      <el-button type="primary" @click="handleNext"
        >下一步，填写商品信息</el-button
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, nextTick, reactive, ref, toRefs } from 'vue';
import { ElCascaderPanel, ElMessage } from 'element-plus';
import { CaretRight } from '@element-plus/icons-vue';

// API 引用
import { listCategoryOptions } from '@/api/pms/category';
import { computed } from 'vue';
import { Option } from '@/types/common';

const emit = defineEmits(['next', 'update:modelValue']);
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

const state = reactive({
  categoryOptions: [] as Option[],
  pathLabels: [],
});

const { categoryOptions, pathLabels } = toRefs(state);

function loadData() {
  listCategoryOptions().then(({ data }) => {
    state.categoryOptions = data;
    if (goodsInfo.value.id) {
      nextTick(() => {
        handleCategoryChange();
      });
    }
  });
}
const categoryRef = ref(ElCascaderPanel);

function handleCategoryChange() {
  const checkNode = categoryRef.value.getCheckedNodes()[0];
  state.pathLabels = checkNode.pathLabels; // 商品分类选择层级提示
  goodsInfo.value.categoryId = checkNode.value;
}

function handleNext() {
  if (!goodsInfo.value.categoryId) {
    ElMessage.warning('请选择商品分类');
    return false;
  }
  emit('next');
}

onMounted(() => {
  loadData();
});
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
</style>
