<!-- 文件上传组件示例 -->
<template>
  <div class="app-container">
    <el-link
      href="https://gitee.com/youlaiorg/vue3-element-admin/blob/master/src/views/demo/auto-opreation-column.vue"
      type="primary"
      target="_blank"
      class="mb-10"
    >
      示例源码 请点击>>>>
    </el-link>

    <div>
      <h3>自适应表格操作列</h3>
      <div class="text-14px color-#999">
        该组件适用于含有操作列的表格。在某些情况下，按钮可能需要根据数据状态或其他条件动态展示，无法预设固定宽度。操作列组件能根据按钮数量自适应宽度，不需要再手动设置宽度。
      </div>
      <div class="mt-30px">
        <el-checkbox v-model="checked1" label="查看" size="large" />
        <el-checkbox v-model="checked2" label="超过了六个字会怎么样" size="large" />
        <el-checkbox v-model="checked3" label="新增" size="large" />
        <el-checkbox v-model="checked4" label="返回很多个字" size="large" />
        <el-checkbox v-model="checked5" label="编辑" size="large" />
      </div>

      <el-table :data="tableData" style="width: 100%" border>
        <el-table-column prop="date" label="Date" />
        <el-table-column prop="name" label="Name" />
        <el-table-column prop="state" label="State" />
        <el-table-column prop="city" label="City" />
        <el-table-column prop="address" label="Address" />
        <el-table-column prop="zip" label="Zip" />
        <OperationColumn :list-data-length="tableData.length">
          <template #default="{ row }">
            <el-button v-if="checked1" link type="primary" size="small">查看</el-button>
            <el-button v-if="checked2" link type="primary" size="small">
              超过了六个字会怎么样
            </el-button>
            <el-button v-if="checked3" link type="primary" size="small">新增</el-button>
            <el-button v-if="checked4" link type="primary" size="small">返回很多个字</el-button>
            <el-button v-if="checked5" link type="primary" size="small">编辑</el-button>
            <el-button v-if="row.tag === 'Home'" link type="primary" size="small">默认</el-button>
          </template>
        </OperationColumn>
      </el-table>
    </div>
  </div>
</template>

<script lang="ts" setup>
import OperationColumn from "@/components/OperationColumn/index.vue";

const checked1 = ref(true);
const checked2 = ref(false);
const checked3 = ref(false);
const checked4 = ref(false);
const checked5 = ref(false);

const tableData = ref<any>([]);
setTimeout(() => {
  tableData.value = [
    {
      date: "2016-05-03",
      name: "Tom",
      state: "California",
      city: "Los Angeles",
      address: "No. 189, Grove St, Los Angeles",
      zip: "CA 90036",
      tag: "Home",
    },
    {
      date: "2016-05-02",
      name: "Tom",
      state: "California",
      city: "Los Angeles",
      address: "No. 189, Grove St, Los Angeles",
      zip: "CA 90036",
      tag: "Office",
    },
    {
      date: "2016-05-04",
      name: "Tom",
      state: "California",
      city: "Los Angeles",
      address: "No. 189, Grove St, Los Angeles",
      zip: "CA 90036",
      tag: "Home",
    },
    {
      date: "2016-05-01",
      name: "Tom",
      state: "California",
      city: "Los Angeles",
      address: "No. 189, Grove St, Los Angeles",
      zip: "CA 90036",
      tag: "Office",
    },
  ];
}, 300);
</script>
