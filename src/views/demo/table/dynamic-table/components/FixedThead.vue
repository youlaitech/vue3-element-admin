<template>
  <div class="app-container">
    <div class="filter-container">
      <el-checkbox-group v-model="checkboxVal">
        <el-checkbox label="apple"> apple </el-checkbox>
        <el-checkbox label="banana"> banana </el-checkbox>
        <el-checkbox label="orange"> orange </el-checkbox>
      </el-checkbox-group>
    </div>

    <el-table
      :key="key"
      :data="tableData"
      border
      fit
      highlight-current-row
      style="width: 100%"
    >
      <el-table-column prop="name" label="fruitName" width="180" />
      <el-table-column v-for="fruit in formThead" :key="fruit" :label="fruit">
        <template #default="scope">
          {{ scope.row[fruit] }}
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
const defaultFormThead = ["apple", "banana"];
const tableData = [
  {
    name: "fruit-1",
    apple: "apple-10",
    banana: "banana-10",
    orange: "orange-10",
  },
  {
    name: "fruit-2",
    apple: "apple-20",
    banana: "banana-20",
    orange: "orange-20",
  },
];

let key = 1; // table key
const formTheadOptions = ["apple", "banana", "orange"];
const checkboxVal = ref(defaultFormThead); // checkboxVal
const formThead = ref(defaultFormThead); // 默认表头 Default header

watch(checkboxVal, (valArr) => {
  formThead.value = formTheadOptions.filter((i) => valArr.indexOf(i) >= 0);
  key = key + 1; // 为了保证table 每次都会重渲 In order to ensure the table will be re-rendered each time
});
</script>
