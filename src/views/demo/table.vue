<template>
  <div class="table-page">
    <div class="table-wrap">
      <el-table :data="tableData" border>
        <el-table-column
          v-for="oneCol in tableColList"
          :key="oneCol.prop"
          :prop="oneCol.prop"
          :label="oneCol.label"
          min-width="200"
          :fixed="oneCol.fixed"
        >
          <template #header>
            <div class="table-head">
              <div>{{ oneCol.label }}</div>
              <el-dropdown
                trigger="click"
                @command="(command: string) => handleCommand(command, oneCol)"
              >
                <i-ep-arrow-down class="action-more"></i-ep-arrow-down>
                <template #dropdown>
                  <el-dropdown-menu>
                    <!-- <el-dropdown-item>升序</el-dropdown-item>
                    <el-dropdown-item>降序</el-dropdown-item> -->
                    <el-dropdown-item :command="TableCommand.FIXED">
                      冻结
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { TableColumn } from "element-plus/es/components/table/src/table-column/defaults";

enum TableCommand {
  // 冻结
  FIXED = "fixed",
  // 升序
  ASC = "asc",
  // 降序
  DESC = "desc",
}
const tableData = [
  {
    date: "2016-05-03",
    name: "admin",
    address: "广东",
    id: 1,
    gender: "男",
    height: 176,
    school: "清华大学",
    hobby: "游泳",
  },
  {
    date: "2016-05-02",
    name: "admin",
    address: "江西",
    id: 2,
    gender: "男",
    height: 167,
    school: "清华大学",
    hobby: "游泳",
  },
  {
    date: "2016-05-04",
    name: "admin",
    address: "湖南",
    id: 3,
    gender: "男",
    height: 173,
    school: "清华大学",
    hobby: "游泳",
  },
  {
    date: "2016-05-01",
    name: "admin",
    address: "重庆",
    id: 4,
    gender: "女",
    height: 178,
    school: "清华大学",
    hobby: "游泳",
  },
];

interface ColumnProp {
  label: string;
  prop: string;
  order: null | boolean;
  fixed: null | string;
}
const tableColList = ref<ColumnProp[]>([
  {
    label: "ID",
    prop: "id",
    order: null,
    fixed: null,
  },
  {
    label: "姓名",
    prop: "name",
    order: null,
    fixed: null,
  },
  {
    label: "性别",
    prop: "gender",
    order: null,
    fixed: null,
  },
  {
    label: "日期",
    prop: "date",
    order: null,
    fixed: null,
  },
  {
    label: "地址",
    prop: "address",
    order: null,
    fixed: null,
  },
  {
    label: "身高",
    prop: "height",
    order: null,
    fixed: null,
  },
  {
    label: "学校",
    prop: "school",
    order: null,
    fixed: null,
  },
  {
    label: "爱好",
    prop: "hobby",
    order: null,
    fixed: null,
  },
]);
const handleCommand = (command: string, tableCol: ColumnProp) => {
  if (command === TableCommand.FIXED) {
    tableColList.value.forEach((item) => {
      if (item.prop === tableCol.prop) {
        item.fixed = "left";
      }
    });
  }
};
</script>
<style lang="scss" scoped>
.table-page {
  width: 100%;
  height: calc(100vh - 84px);
  padding: 10px;
  .table-wrap {
    background-color: #fff;
    height: 100%;
    padding: 20px;
    .el-table {
      width: 800px;
      .table-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        .action-more {
          cursor: pointer;
          &:hover {
            color: #409eff;
          }
        }
      }
    }
  }
}
</style>
