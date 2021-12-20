<template>
  <div class="app-container">
    <el-row :gutter="10">
      <el-col :span="10" :xs="24">
        <el-card class="box-card" shadow="always">
          <template #header>
            <svg-icon color="#333" icon-class="menu"/>
            菜单列表
          </template>
          <menu-table @menuClick="handleMenuClick"/>
        </el-card>
      </el-col>
      <el-col :span="14" :xs="24">
        <el-card class="box-card" shadow="always">
          <template #header>
            <svg-icon color="#333" icon-class="perm"/>
            <span style="margin:0 5px;">权限列表</span>
            <el-tag type="success" v-if="state.menuId" size="small">{{ state.menuName }}</el-tag>
            <el-tag type="warning" v-else size="small">请点击左侧菜单列表选择</el-tag>
          </template>
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

function handleMenuClick (menuRow: any){
  if (menuRow) {
    state.menuId = menuRow.id
    state.menuName = menuRow.name
  } else {
    state.menuId = undefined
    state.menuName = ''
  }
}

</script>

<style scoped>

</style>