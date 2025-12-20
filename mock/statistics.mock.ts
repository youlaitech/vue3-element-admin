import { defineMock } from "./base";

export default defineMock([
  {
    url: "statistics/visits/trend",
    method: ["GET"],
    body: {
      code: "00000",
      data: {
        dates: [
          "2024-06-30",
          "2024-07-01",
          "2024-07-02",
          "2024-07-03",
          "2024-07-04",
          "2024-07-05",
          "2024-07-06",
          "2024-07-07",
        ],
        pvList: [1751, 5168, 4882, 5301, 4721, 4885, 1901, 1003],
        uvList: null,
        ipList: [207, 566, 565, 631, 579, 496, 222, 152],
      },
      msg: "一切ok",
    },
  },
  {
    url: "statistics/visits/overview",
    method: ["GET"],
    body: {
      code: "00000",
      data: {
        todayUvCount: 169,
        totalUvCount: 19985,
        uvGrowthRate: -0.57,
        todayPvCount: 1629,
        totalPvCount: 286086,
        pvGrowthRate: -0.65,
      },
      msg: "一切ok",
    },
  },
]);
