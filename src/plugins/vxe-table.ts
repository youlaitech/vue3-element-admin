import type { App } from "vue";
import VxeUIPluginExportXLSX from "@vxe-ui/plugin-export-xlsx";
import ExcelJS from "exceljs";
import VxeUIBase, { VxeUI } from "vxe-pc-ui";
import VxeUITable from "vxe-table"; // https://vxetable.cn/#/start/install
import i18n from "@/lang";

// 全局默认参数
VxeUI.setConfig({
  // 全局尺寸
  size: "medium",
  // 全局 zIndex 起始值，默认是 999，如果项目的的 z-index 样式值过大时就需要跟随设置更大，避免被遮挡
  zIndex: 9999,
  // 版本号，对于某些带数据缓存的功能有用到，上升版本号可以用于重置数据
  version: 0,
  // 全局 loading 提示内容，如果为 null 则不显示文本
  loading: {
    showText: false,
    text: "",
  },
  table: {
    minHeight: 46,
    showHeader: true,
    showOverflow: "tooltip",
    showHeaderOverflow: "tooltip",
    autoResize: true,
    // stripe: false,
    border: "inner",
    // round: false,
    emptyText: "暂无数据",
    rowConfig: {
      isHover: true,
      isCurrent: true,
      // 行数据的唯一主键字段名
      keyField: "_VXE_ID",
    },
    columnConfig: {
      resizable: false,
    },
    align: "center",
    headerAlign: "center",
    validConfig: {
      theme: "normal",
    },
  },
  pager: {
    // size: "medium",
    // 配套的样式
    perfect: false,
    pageSize: 10,
    pagerCount: 7,
    pageSizes: [10, 20, 50],
    layouts: [
      "Total",
      "PrevJump",
      "PrevPage",
      "Number",
      "NextPage",
      "NextJump",
      "Sizes",
      "FullJump",
    ],
  },
  form: {
    validConfig: {
      theme: "normal",
    },
  },
  modal: {
    minWidth: 500,
    minHeight: 100,
    lockView: true,
    mask: true,
    // duration: 3000,
    // marginSize: 20,
    dblclickZoom: false,
    showTitleOverflow: true,
    transfer: true,
    draggable: false,
  },
  // 对组件内置的提示语进行国际化翻译
  i18n: (key, args) => i18n.global.t(key, args),
  // 可选，对参数中的列头、校验提示..等进行自动翻译（只对支持国际化的有效）
  translate(key, args) {
    // 例如，只翻译 "vxetable." 开头的键值
    if (key && key.startsWith("vxetable.")) {
      return i18n.global.t(key, args);
    }
    return key;
  },
});

// 导入导出xlsx插件 https://vxetable.cn/other4/#/table/plugin/exportXLSX
VxeUI.use(VxeUIPluginExportXLSX, {
  ExcelJS,
});

export function setupVxeUI(app: App) {
  // Vxe Table 组件完整引入
  app.use(VxeUIBase).use(VxeUITable);
}
