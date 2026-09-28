// 引入样式
import "vxe-pc-ui/lib/style.css";
import "vxe-table/lib/style.css";
// 导入主题变量，也可以重写主题变量
import "vxe-pc-ui/styles/cssvar.scss";
import "vxe-table/styles/cssvar.scss";
// 导入默认的语言
import enUS from "vxe-pc-ui/lib/language/en-US";
import zhCN from "vxe-pc-ui/lib/language/zh-CN";
import VxeUIPluginExportXLSX from "@vxe-ui/plugin-export-xlsx";
import ExcelJS from "exceljs";
import { VxeUI } from "vxe-pc-ui";

import { useAppStore } from "@/stores/app";
import { DeviceEnum } from "@/enums";

export function configureVxeUI() {
  const appStore = useAppStore();
  const isMobile = appStore.device === DeviceEnum.MOBILE;

  // 导入导出xlsx插件 https://vxetable.cn/other4/#/table/plugin/exportXLSX
  VxeUI.use(VxeUIPluginExportXLSX, {
    ExcelJS,
  });

  // 注册语言
  VxeUI.setI18n("zh-CN", zhCN);
  VxeUI.setI18n("en-US", enUS);
  // 切换指定语言
  VxeUI.setLanguage("zh-CN");

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
      showHeaderOverflow: isMobile ? false : "tooltip",
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
        minWidth: isMobile ? "auto" : undefined,
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
      span: isMobile ? 24 : 6,
      validConfig: {
        theme: "normal",
      },
    },
    modal: {
      fullscreen: isMobile,
      remember: isMobile,
      width: isMobile ? "95%" : undefined,
      // minWidth: 500,
      // minHeight: 400,
      lockView: true,
      mask: true,
      // duration: 3000,
      // marginSize: 20,
      dblclickZoom: false,
      showTitleOverflow: true,
      transfer: true,
      draggable: false,
    },
  });
}
