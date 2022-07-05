<template>
  <div class="app-container">
    <el-steps
      :active="active"
      process-status="finish"
      finish-status="success"
      simple
    >
      <el-step title="选择商品分类" />
      <el-step title="填写商品信息" />
      <el-step title="设置商品属性" />
      <el-step title="设置商品库存" />
    </el-steps>

    <GoodsCategory
      v-show="active == 0"
      v-model="goodsInfo"
      v-if="loaded == true"
      @prev="prev"
      @next="next"
    />
    <GoodsInfo
      v-show="active == 1"
      v-model="goodsInfo"
      v-if="loaded == true"
      @prev="prev"
      @next="next"
    />
    <GoodsAttribute
      v-show="active == 2"
      v-model="goodsInfo"
      v-if="loaded == true"
      @prev="prev"
      @next="next"
    />
    <GoodsStock
      v-show="active == 3"
      v-model="goodsInfo"
      v-if="loaded == true"
      @prev="prev"
      @next="next"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, toRefs } from 'vue';

import GoodsCategory from './components/GoodsCategory.vue';
import GoodsInfo from './components/GoodsInfo.vue';
import GoodsAttribute from './components/GoodsAttribute.vue';
import GoodsStock from './components/GoodsStock.vue';

import { getSpuDetail } from '@/api/pms/goods';
import { useRoute } from 'vue-router';
import { GoodsDetail } from '@/types/api/pms/goods';

const route = useRoute();

const state = reactive({
  loaded: false,
  active: 0,
  goodsInfo: {
    album: [],
    attrList: [],
    specList: [],
    skuList: [],
  } as GoodsDetail,
});

const { loaded, active, goodsInfo } = toRefs(state);

function loadData() {
  const goodsId = route.query.goodsId as string;

  if (goodsId) {
    getSpuDetail(goodsId).then((response) => {
      state.goodsInfo = response.data;
      state.goodsInfo.originPrice = (state.goodsInfo.originPrice as any) / 100;
      state.goodsInfo.price = (state.goodsInfo.price as any) / 100;
      state.loaded = true;
    });
  } else {
    state.loaded = true;
  }
}

function prev() {
  if (state.active-- <= 0) {
    state.active = 0;
  }
}
function next() {
  if (state.active++ >= 3) {
    state.active = 0;
  }
}

onMounted(() => {
  loadData();
});
</script>

<style lang="scss" scoped>
.app-container {
  width: 1200px;
  margin: 50px auto;
  border: 1px solid #eee;
}
</style>
