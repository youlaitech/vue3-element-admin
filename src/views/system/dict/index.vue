<script setup lang="ts">
import SvgIcon from '@/components/SvgIcon/index.vue';
import DictType from './components/DictType.vue';
import DictItem from './components/DictItem.vue';

import { reactive, toRefs } from 'vue';

const state = reactive({
  typeCode: '',
  typeName: '',
});

const { typeCode, typeName } = toRefs(state);

const handleDictTypeClick = (row: any) => {
  if (row) {
    state.typeName = row.name;
    state.typeCode = row.code;
  } else {
    state.typeName = '';
    state.typeCode = '';
  }
};
</script>

<template>
  <div class="app-container">
    <el-row :gutter="10">
      <el-col :span="12" :xs="24">
        <el-card class="box-card">
          <template #header>
            <svg-icon icon-class="dict" />
            字典类型
          </template>
          <dict-type @dictClick="handleDictTypeClick" />
        </el-card>
      </el-col>

      <el-col :span="12" :xs="24">
        <el-card class="box-card">
          <template #header>
            <svg-icon icon-class="dict_item" />
            <span style="margin: 0 5px">字典数据项</span>
            <el-tag type="success" v-if="typeCode" size="small">{{
              typeName
            }}</el-tag>
            <el-tag type="warning" v-else size="small">未选择字典</el-tag>
          </template>
          <!-- 字典项组件 -->
          <dict-item :typeName="typeName" :typeCode="typeCode" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>
