/**
 * VxeTable 全局配置
 *
 * @description
 * VxeTable 是一个基于 Vue 的 PC 端表格组件
 * @see https://vxetable.cn/v4.6/#/table/start/install
 */

import VXETable from "vxe-table";

/**
 * 配置 VxeTable 全局参数
 */
export function configureVxeTable() {
  VXETable.setConfig({
    size: "medium",
    zIndex: 9999,
    version: 0,
    loadingText: null,
    table: {
      showHeader: true,
      showOverflow: "tooltip",
      showHeaderOverflow: "tooltip",
      autoResize: true,
      border: "inner",
      emptyText: "暂无数据",
      rowConfig: {
        isHover: true,
        isCurrent: true,
        keyField: "_VXE_ID",
      },
      columnConfig: {
        resizable: false,
      },
      align: "center",
      headerAlign: "center",
    },
    pager: {
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
    modal: {
      minWidth: 500,
      minHeight: 400,
      lockView: true,
      mask: true,
      dblclickZoom: false,
      showTitleOverflow: true,
      transfer: true,
      draggable: false,
    },
  });
}
