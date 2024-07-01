import { defineMock } from "./base";

export default defineMock([
  {
    url: "stats/visit-trend",
    method: ["GET"],
    body: {
      code: "00000",
      data: {
        dates: [
          "2024-06-24",
          "2024-06-25",
          "2024-06-26",
          "2024-06-27",
          "2024-06-28",
          "2024-06-29",
          "2024-06-30",
          "2024-07-01",
        ],
        pvList: [1100, 2000, 2400, 3000, 4794, 1779, 1751, 4698],
        uvList: null,
        ipList: [110, 200, 220, 300, 567, 246, 207, 501],
      },
      msg: "一切ok",
    },
  },
]);
