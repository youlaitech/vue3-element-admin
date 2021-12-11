<template>
  <div class="app-container">
    <el-row :gutter="10">
      <el-col :span="12" :xs="24">
        <el-card class="box-card">
          <div class="clearfix" slot="header">
            <b>字典列表</b>
          </div>
          <!-- 字典列表子组件 -->
          <dict @dictClick="handleDictClick"/>
        </el-card>
      </el-col>

      <el-col :span="12" :xs="24">
        <el-card class="box-card">
          <div class="clearfix" slot="header">
            <b  v-if=" state.dictCode" style="margin-right: 5px">字典</b>
            <el-tag type="success" v-if=" state.dictCode" ><b>{{ state.dictName }}</b></el-tag>
            <b  v-if=" state.dictCode" style="margin-left: 5px">数据项</b>
            <el-tag type="warning"  v-if=" !state.dictCode">未选择字典</el-tag>
          </div>
          <!-- 字典项组件 -->
          <dict-item :dictName="state.dictName" :dictCode='state.dictCode'/>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import Dict from './components/Dict.vue'
import DictItem from './components/DictItem.vue'

import {reactive} from 'vue'

const state = reactive({
  dictCode: '',
  dictName: ''  // 字典名称，用于字典项组件回显
})

const handleDictClick = (dictRow: any) => {
  state.dictName = dictRow.name
  state.dictCode = dictRow.code
}

</script>

<style scoped>

</style>
