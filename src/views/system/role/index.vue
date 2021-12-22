<template>
  <div class="app-container">
    <el-row :gutter="10">
      <el-col :span="10" :xs="24">
        <el-card class="box-card" shadow="always">
          <template #header>

            <svg-icon color="#333" icon-class="role"/>
            角色列表
          </template>
          <role ref="role" @roleClick="handleRoleClick"/>
        </el-card>
      </el-col>

      <el-col :span="6" :xs="24">
        <el-card class="box-card" shadow="always">
          <template #header>
            <svg-icon color="#333" icon-class="menu"/>
            <span style="margin:0 5px;">菜单分配</span>
            <el-tag type="success" v-if="state.role.id" size="small">
              <svg-icon color="green  " icon-class="role"/>
              {{ state.role.name }}
            </el-tag>
            <el-tag type="warning" v-else size="small">请选择角色</el-tag>
          </template>
          <menus ref="menu" @menuClick="handleMenuClick" :role="state.role"/>
        </el-card>
      </el-col>

      <el-col :span="8" :xs="24">
        <el-card class="box-card" shadow="always">
          <template #header>
            <svg-icon color="#333" icon-class="perm"/>
            <span style="margin:0 5px;">权限分配</span>

            <el-tag type="success" style="margin:0 5px 0 0;" v-if="state.role.id" size="small">
              <svg-icon color="green" icon-class="role"/>
              {{ state.role.name }}
            </el-tag>
            <el-tag type="warning" style="margin:0 5px  0 0;" v-else size="small"> 请选择角色</el-tag>

            <el-tag type="success" v-if="state.menu.id" size="small">
              <svg-icon color="red" icon-class="menu"/>
              {{ state.menu.name }}
            </el-tag>
            <el-tag type="warning" v-else size="small"> 请选择菜单</el-tag>
          </template>
          <perm ref="perm" :menu="state.menu" :role="state.role"/>
        </el-card>
      </el-col>

    </el-row>
  </div>
</template>

<script setup lang="ts">
import Role from './components/Role.vue'
import Menus from './components/Menu.vue'
import Perm from './components/Perm.vue'
import {reactive} from "vue";
import {ElMessage} from "element-plus";
import SvgIcon from '@/components/SvgIcon/index.vue';

const state = reactive({
  role: {
    id: undefined,
    name: '',
  },
  menu: {
    id: undefined,
    name: ''
  }
})

function handleRoleClick(roleRow: any) {
  if (roleRow) {
    state.role = {
      id: roleRow.id,
      name: roleRow.name
    }
  } else {
    state.role = {
      id: undefined,
      name: ''
    }
  }
}

function handleMenuClick(menuRow: any) {
  if (!state.role.id) {
    ElMessage.warning('请选择角色')
    return false
  }

  console.log('选择菜单',menuRow)

  if (menuRow) {
    state.menu = {
      id: menuRow.id,
      name: menuRow.label
    }
  } else {
    state.menu = {
      id: undefined,
      name: ''
    }
  }
}

</script>

<style scoped>

</style>
