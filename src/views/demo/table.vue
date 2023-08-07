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
                  <i-ep-sort-up v-if="oneCol.order === 'asc'" />
                  <i-ep-sort-down v-else />
                </template>
              </div>

              <el-dropdown
                trigger="click"
                @command="(command: string) => handleCommand(command, oneCol)"
              >
                <i-ep-arrow-down class="action-more" />
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
    <h3>解析excel</h3>
    <el-upload
      :disabled="state.fileList.length !== 0"
      class="upload"
      drag
      accept=".xls,.xlsx"
      :show-file-list="false"
      action=""
      :http-request="handleUploadFile"
    >
      <i-ep-upload-filled class="icon" />
      <div class="el-upload__text">拖拽excel到这里</div>
    </el-upload>
    <div v-loading="loading" class="excel-table-wrap">
      <el-table
        v-if="state.tableExcelHead.length && state.excelTableData.length"
        :data="state.excelTableData"
        stripe
        border
        style="width: 100%"
        size="small"
      >
        <el-table-column
          v-for="(item, index) in state.tableExcelHead"
          :key="index"
          :prop="item"
          :label="item"
          width="150"
        >
          <template #default="scope">
            <span class="overflow-ellipsis">{{ scope.row[item] }}</span>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>
<script lang="ts" setup>
import * as XLSX from "xlsx/xlsx.mjs";
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
const loading = ref(false);
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
    height: 176,
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
const state = reactive({
  fileList: [],
  excelData: [],
  tableHead: [],
  sheetList: [] as any[],
  allSheetObj: {} as any,
  tableExcelHead: [] as string[],
  activeSheet: "",
  fileName: "",
  excelTableData: [],
});
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
const handleUploadFile = (data: any) => {
  const { file } = data;
  const { size, name } = file;
  state.fileName = name;
  // 获取最后一个.的位置
  const index = name.lastIndexOf(".");
  // 获取文件类型
  const ext = name.substring(index + 1);
  const accept = ["xlsx", "xls"];
  if (!accept.includes(ext)) {
    ElMessage({
      type: "error",
      message: "请选择xls或者xlsx文件",
    });
    return;
  }

  loading.value = true;
  readFile(file, "");
};
const currentSheetName = computed(() => {
  const find = state.sheetList.find(
    (item) => item.sheetId === state.activeSheet
  );
  return find?.name || "";
});

const getFile = () => {
  const sheetName = `${currentSheetName.value}`;
  let workbook = XLSX.utils.book_new();

  workbook = {
    ...workbook,
    SheetNames: [sheetName],
    Sheets: {},
  };
  workbook.Sheets[sheetName] = state.allSheetObj[sheetName];
  const wopts = {
    bookType: "xlsx", // 要生成的文件类型
    bookSST: false, // 是否生成Shared String Table，官方解释是，如果开启生成速度会下降，但在低版本IOS设备上有更好的兼容性
    type: "binary", // 二进制格式
  };
  const wbout = XLSX.write(workbook, wopts);
  const transform = (s: any) => {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);

    // eslint-disable-next-line no-bitwise
    for (let i = 0; i !== s.length; ++i) view[i] = s.charCodeAt(i) & 0xff;
    return buf;
  };
  // 字符串转ArrayBuffer
  const blob = new Blob([transform(wbout)], {
    type: "application/octet-stream",
  });
  const file = new window.File([blob], state.fileName, { type: "xlsx" });
};
const readFile = (file: any, callback: any) => {
  const rABS = true; // true: readAsBinaryString ; false: readAsArrayBuffer
  const reader = new FileReader();
  reader.onload = function (e) {
    let data = e.target?.result as any;
    if (!rABS) data = new Uint8Array(data);
    const readData = XLSX.read(data, {
      type: rABS ? "binary" : "array",
      cellText: false,
      cellDates: true,
    });
    const { Sheets, Workbook } = readData;
    state.sheetList = Workbook.Sheets;
    state.activeSheet = state.sheetList[0].sheetId;
    state.allSheetObj = Sheets;
    const result = XLSX.utils.sheet_to_json(
      state.allSheetObj[currentSheetName.value],
      { raw: false, dateNF: "YYYY-MM-DD HH:mm:ss" }
    );
    const allData = XLSX.utils.sheet_to_json(
      state.allSheetObj[currentSheetName.value],
      { header: 1 }
    );
    state.tableExcelHead = allData.length > 0 ? allData[0] : Array(10).fill("");
    state.excelTableData = result;

    // getFile();
    // 获取表头key
    if (callback) callback(readData);
  };
  if (rABS) {
    reader.readAsBinaryString(file);
  } else {
    reader.readAsArrayBuffer(file);
  }
  loading.value = false;
};
</script>
<style lang="scss" scoped>
.table-page {
  width: 100%;
  height: calc(100vh - 84px);
  padding: 10px;
  overflow-y: auto;

  .table-wrap {
    // height: 100%;
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

  .upload {
    box-sizing: border-box;
    height: 230px;
    margin-top: 16px;
    margin-bottom: 20px;
    background-color: #e3f2fd;
    border: 2px dashed #90caf9;
    border-radius: 2px;

    :deep(.el-upload-dragger) {
      padding: 0;
      background-color: #e3f2fd;
      border: none;

      .icon {
        font-size: 110px;
        color: #90caf9;
      }
    }
  }

  .excel-table-wrap {
    width: 100%;
    min-height: 300px;
  }
}
</style>
