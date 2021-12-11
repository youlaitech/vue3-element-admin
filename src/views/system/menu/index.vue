<template>
  <div class="app-container">
    <el-row :gutter="10">
      <el-col :span="10" :xs="24">
        <el-card class="box-card" shadow="always">
          <template #header>
            <svg-icon color="#000" icon-class="menu"/> 菜单列表
          </template>
          <menu-table @menuClick="handleMenuClick"/>
        </el-card>
      </el-col>
      <el-col :span="14" :xs="24">
        <el-card class="box-card" shadow="always">
          <div slot="header">
            <b v-if=" state.dictCode" style="margin-right: 5px">菜单</b>
            <el-tag type="success" v-if=" state.dictCode"><b>{{ state.dictName }}</b></el-tag>
            <b v-if=" state.dictCode" style="margin-left: 5px">数据权限</b>
            <el-tag type="warning" v-if=" !state.dictCode">未选择菜单</el-tag>
          </div>
          <perm-table :menuId="state.menuId" :menuName="state.menuName"/>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import SvgIcon from '@/components/SvgIcon/index.vue';
import MenuTable from './components/Menu.vue'
import PermTable from './components/Perm.vue'

import {reactive} from 'vue'

const state = reactive({
  menuId: undefined,
  menuName: ''
})

const handleMenuClick = (menuRow: any) => {
  state.menuId = menuRow.id
  state.menuName = menuRow.name
}

</script>

<style scoped>

</style>