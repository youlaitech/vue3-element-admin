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
              <div class="label-wrap" @click="handleClickHead(oneCol)">
                <div>{{ oneCol.label }}</div>
                <template v-if="oneCol.order">
                  <i-ep-sort-up v-if="oneCol.order === 'asc'"></i-ep-sort-up>
                  <i-ep-sort-down v-else></i-ep-sort-down>
                </template>
              </div>

              <el-dropdown
                trigger="click"
                @command="(command: string) => handleCommand(command, oneCol)"
              >
                <i-ep-arrow-down class="action-more"></i-ep-arrow-down>
                <template #dropdown>
                  <el-dropdown-menu>
                    <template v-if="oneCol.prop === 'id'">
                      <el-dropdown-item :command="TableCommand.ASC">
                        升序
                      </el-dropdown-item>
                      <el-dropdown-item :command="TableCommand.DESC">
                        降序
                      </el-dropdown-item>
                    </template>
                    <el-dropdown-item :command="TableCommand.FIXED">
                      {{ oneCol.fixed ? "解冻" : "冻结" }}
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
import { cloneDeep } from "lodash-es";

enum TableCommand {
  // 冻结
  FIXED = "fixed",
  // 升序
  ASC = "asc",
  // 降序
  DESC = "desc",
}

let tableData = ref<any[]>([]);
const orginData = [
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
    id: 3,
    gender: "男",
    height: 167,
    school: "清华大学",
    hobby: "游泳",
  },
  {
    date: "2016-05-04",
    name: "admin",
    address: "湖南",
    id: 4,
    gender: "男",
    height: 173,
    school: "清华大学",
    hobby: "游泳",
  },
  {
    date: "2016-05-01",
    name: "admin",
    address: "重庆",
    id: 2,
    gender: "女",
    height: 178,
    school: "清华大学",
    hobby: "游泳",
  },
];
onMounted(() => {
  tableData.value = orginData.map((item) => item);
});
interface ColumnProp {
  label: string;
  prop: string;
  order: null | string;
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
        // 冻结/解冻
        item.fixed = item.fixed ? null : "left";
      }
    });
  }
  // 升序
  if (command === TableCommand.ASC) {
    tableColList.value.forEach((item) => {
      if (item.prop === tableCol.prop) {
        item.order = "asc";
        sortTableData(item);
      }
    });
  }
  // 降序
  if (command === TableCommand.DESC) {
    tableColList.value.forEach((item) => {
      if (item.prop === tableCol.prop) {
        item.order = "desc";
        sortTableData(item);
      }
    });
  }
};
// 点击表头循环排序
const handleClickHead = (oneCol: ColumnProp) => {
  // 排序顺序
  const sortArr = [null, "asc", "desc"];
  const { order } = oneCol;
  const findIndex = sortArr.findIndex((el) => el === order);
  let currentIndex = findIndex + 1;
  if (currentIndex > 2) {
    currentIndex = 0;
  }
  // 排序只能排一列
  tableColList.value.forEach((item) => {
    if (item.prop === oneCol.prop) {
      item.order = sortArr[currentIndex];
    } else {
      item.order = null;
    }
  });
  sortTableData(oneCol);
};
const sortTableData = (sortCol: ColumnProp) => {
  // 升序
  if (sortCol.order === TableCommand.ASC) {
    const compare = (p: string) => (m: any, n: any) => m[p] - n[p];
    tableData.value = cloneDeep(orginData).sort(compare(sortCol.prop));
  }
  // 降序
  if (sortCol.order === TableCommand.DESC) {
    const compare = (p: string) => (m: any, n: any) => n[p] - m[p];
    tableData.value = cloneDeep(orginData).sort(compare(sortCol.prop));
  }
  // 不排序
  if (!sortCol.order) {
    tableData.value = cloneDeep(orginData).map((item: any) => item);
  }
};
</script>
<style lang="scss" scoped>
.table-page {
  width: 100%;
  height: calc(100vh - 84px);
  padding: 10px;

  .table-wrap {
    height: 100%;
    padding: 20px;
    background-color: #fff;

    .el-table {
      width: 800px;

      .table-head {
        display: flex;
        align-items: center;
        justify-content: space-between;

        .label-wrap {
          display: flex;
          flex: 1;
          align-items: center;
          cursor: pointer;

          svg {
            margin-left: 5px;
          }
        }

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
