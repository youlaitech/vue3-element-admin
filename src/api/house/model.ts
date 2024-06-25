/**
 * 最近30天数据
 */
export interface ChartHouseDataVO {
  /**
   * 0：新房销售计数
   * 1：新房销售面积
   * 2：二手房销售计数
   * 3：二手房销售面积
   * 4：新房存量计数
   * 5：新房存量面积
   */
  xaxis: string[];
  yaxis: YaxisInit;
  zaxis: YaxisInit;
  sevenDayAverage: number;
  fifteenDayAverage: number;
  thirtyDayAverage: number;
  series: ChartHouseDataSeries[];
}

export interface ChartHouseDataList<T> {
  /** 数据列表 */
  list: T;
}

export interface YaxisInit {
  max: number;
  min: number;
  interval: number;
}

export interface ChartHouseDataSeries {
  chartName: string;
  chartType: string;
  chatData: number[];
}
