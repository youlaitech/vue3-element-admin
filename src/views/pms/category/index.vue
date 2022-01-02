<template>
  <div class="app-container">
    <el-row :gutter="10">
      <el-col :span="14" :xs="24">
        <el-card class="box-card" shadow="always">
          <template #header>
            <svg-icon color="#333" icon-class="menu"/>
            商品分类
          </template>
          <category ref="categoryRef" @categoryClick="handleCategoryClick"/>
        </el-card>
      </el-col>

      <el-col :span="10" :xs="24">
        <el-card class="box-card" shadow="always">
          <template #header>
            <svg-icon color="#333" icon-class="menu"/>
            商品属性
          </template>
          <!-- 商品规格 -->
          <attribute ref="specificationRef" :attributeType="1"/>
          <!-- 商品属性 -->
          <attribute ref="attributeRef" :attributeType="2"/>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">

import Category from './components/Category.vue'
import Attribute from './components/Attribute.vue'

import {reactive} from "vue";

const state = reactive({
  categoryId: undefined,
  categoryName: ''
})

function handleCategoryClick(categoryRow: any) {
  if (categoryRow) {
    state.categoryId = categoryRow.id
    state.categoryName = categoryRow.name
  } else {
    state.categoryId = undefined
    state.categoryName =''
  }
}
</script>

<style scoped>

</style>
