<template>
  <div class="app-container">
    <el-row :gutter="10">
      <el-col :span="10" :xs="24">
        <el-card class="box-card" shadow="always">
          <template #header>
            <svg-icon color="#333" icon-class="role" />
            角色列表
          </template>
          <Role ref="role" @roleClick="handleRoleClick" />
        </el-card>
      </el-col>

      <el-col :span="6" :xs="24">
        <el-card class="box-card" shadow="always">
          <template #header>
            <svg-icon color="#333" icon-class="menu" />
            <span style="margin: 0 5px">菜单分配</span>
            <el-tag type="success" v-if="role.id">
              <svg-icon color="green" icon-class="role" />
              {{ role.name }}
            </el-tag>
            <el-tag type="warning" v-else size="small">请选择角色</el-tag>
          </template>
          <Menus ref="menu" @menuClick="handleMenuClick" :role="role" />
        </el-card>
      </el-col>

      <el-col :span="8" :xs="24">
        <el-card class="box-card" shadow="always">
          <template #header>
            <svg-icon icon-class="perm" />
            <span style="margin: 0 5px">权限分配</span>

            <el-tag type="success" style="margin: 0 5px 0 0" v-if="role.id">
              <svg-icon color="green" icon-class="role" />
              {{ role.name }}
            </el-tag>
            <el-tag
              type="warning"
              style="margin: 0 5px 0 0"
              v-else
              size="small"
            >
              请选择角色</el-tag
            >

            <el-tag type="success" v-if="menu.id" size="small">
              <svg-icon icon-class="menu" />
              {{ menu.name }}
            </el-tag>
            <el-tag type="warning" v-else size="small"> 请选择菜单</el-tag>
          </template>
          <perm ref="perm" :menu="menu" :role="role" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { reactive, toRefs } from 'vue';
import { ElMessage } from 'element-plus';
import SvgIcon from '@/components/SvgIcon/index.vue';

import Role from './components/Role.vue';
import Menus from './components/Menu.vue';
import Perm from './components/Perm.vue';

const state = reactive({
  role: {
    id: undefined,
    name: ''
  },
  menu: {
    id: undefined,
    name: ''
  }
});

const { role, menu } = toRefs(state);

function handleRoleClick(roleRow: any) {
  if (roleRow) {
    state.role = {
      id: roleRow.id,
      name: roleRow.name
    };
  } else {
    state.role = {
      id: undefined,
      name: ''
    };
  }
}

function handleMenuClick(menuRow: any) {
  if (!state.role.id) {
    ElMessage.warning('请选择角色');
    return false;
  }
  if (menuRow) {
    state.menu = {
      id: menuRow.value,
      name: menuRow.label
    };
  } else {
    state.menu = {
      id: undefined,
      name: ''
    };
  }
}
</script>

<style scoped></style>
