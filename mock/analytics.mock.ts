import { defineMock } from "./base";

export default defineMock([
  {
    url: "analytics/visits/summary",
    method: ["GET"],
    body: {
      code: "00000",
      data: {
        todayUv: 169,
        yesterdayUv: 176,
        totalUv: 19985,
        todayPv: 1629,
        yesterdayPv: 1712,
        totalPv: 286086,
        uvGrowthRate: -0.0398,
        pvGrowthRate: -0.0485,
      },
      msg: "一切ok",
    },
  },
  {
    url: "analytics/visits/trend",
    method: ["GET"],
    body: {
      code: "00000",
      data: {
        startDate: "2024-06-30",
        endDate: "2024-07-07",
        points: [
          { date: "2024-06-30", pv: 1751, uv: 207 },
          { date: "2024-07-01", pv: 5168, uv: 566 },
          { date: "2024-07-02", pv: 4882, uv: 565 },
          { date: "2024-07-03", pv: 5301, uv: 631 },
          { date: "2024-07-04", pv: 4721, uv: 579 },
          { date: "2024-07-05", pv: 4885, uv: 496 },
          { date: "2024-07-06", pv: 1901, uv: 222 },
          { date: "2024-07-07", pv: 1003, uv: 152 },
        ],
      },
      msg: "一切ok",
    },
  },
  {
    url: "analytics/users/summary",
    method: ["GET"],
    body: {
      code: "00000",
      data: { total: 128 },
      msg: "一切ok",
    },
  },
]);
