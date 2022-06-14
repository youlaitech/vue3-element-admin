<!-- setup 无法设置组件名称，组件名称keepAlive必须 -->
<script lang="ts">
export default {
  name: 'category',
};
</script>

<script setup lang="ts">
import Category from './components/Category.vue';
import Attribute from './components/Attribute.vue';
import SvgIcon from '@/components/SvgIcon/index.vue';

import { reactive, toRefs } from 'vue';

const state = reactive({
  category: {
    id: undefined,
    name: '',
    childrenLen: 0,
  },
});

const { category } = toRefs(state);

function handleCategoryClick(categoryRow: any) {
  if (categoryRow) {
    state.category = {
      id: categoryRow.id,
      name: categoryRow.name,
      childrenLen: categoryRow.children.length,
    };
  } else {
    state.category = {
      id: undefined,
      name: '',
      childrenLen: 0,
    };
  }
}
</script>

<template>
  <div class="app-container">
    <el-row :gutter="10">
      <el-col :span="14" :xs="24">
        <el-card class="box-card" shadow="always">
          <template #header>
            <svg-icon icon-class="menu" />
            商品分类
          </template>
          <Category ref="categoryRef" @categoryClick="handleCategoryClick" />
        </el-card>
      </el-col>

      <el-col :span="10" :xs="24">
        <el-card class="box-card" shadow="always">
          <template #header>
            <svg-icon icon-class="menu" />
            {{ category.name }} 规格属性
          </template>
          <!-- 商品规格 -->
          <Attribute
            ref="specificationRef"
            :attributeType="1"
            :category="category"
          />
          <!-- 商品属性 -->
          <Attribute
            ref="attributeRef"
            :attributeType="2"
            :category="category"
          />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped></style>
