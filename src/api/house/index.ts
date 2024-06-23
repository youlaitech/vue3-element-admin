import request from "@/utils/request";
import { ChartHouseDataVO, ChartHouseDataList } from "./model";

class HouseAPI {
  /**
   * 获取房源数据
   *
   * @param dataType
   */
  static getHouseData(dataType: number) {
    return request<any, ChartHouseDataVO>({
      url: "/house/" + dataType,
      method: "get",
    });
  }
}

export default HouseAPI;
