<template>
  <div class="app-container">
    <el-row :gutter="10">
      <el-col :span="10" :xs="24">
        <el-card class="box-card" shadow="always">
          <template #header>
            <svg-icon icon-class="menu" />
            菜单列表
          </template>
          <menu-table @menuClick="handleMenuClick" />
        </el-card>
      </el-col>
      <el-col :span="14" :xs="24">
        <el-card class="box-card" shadow="always">
          <template #header>
            <svg-icon icon-class="perm" />
            <span style="margin: 0 5px">权限列表</span>
            <el-tag type="success" v-if="menu.id" size="small">{{
              menu.name
            }}</el-tag>
            <el-link :underline="false" type="warning" v-else size="small"
              ><el-icon><WarningFilled /></el-icon>请选中左侧菜单</el-link
            >
          </template>
          <perm-table :menu="menu" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import SvgIcon from '@/components/SvgIcon/index.vue';
import MenuTable from './components/Menu.vue';
import PermTable from './components/Perm.vue';

import { reactive, toRefs } from 'vue';
import { WarningFilled } from '@element-plus/icons-vue';
import { MenuItem } from '@/types/api/system/menu';
const state = reactive({
  menu: {} as MenuItem,
});

const { menu } = toRefs(state);

function handleMenuClick(menuRow: MenuItem) {
  if (menuRow) {
    menu.value.id = menuRow.id;
    menu.value.type = menuRow.type;
    menu.value.name = menuRow.name;
  } else {
    menu.value.id = undefined;
    menu.value.type = undefined;
    menu.value.name = '';
  }
}
</script>

<style scoped></style>
