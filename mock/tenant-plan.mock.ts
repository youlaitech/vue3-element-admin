import { defineMock } from "./base";

export default defineMock([
  {
    url: "tenant-plans",
    method: ["GET"],
    body: {
      code: "00000",
      data: {
        list: [
          {
            id: 1,
            name: "基础版",
            code: "BASIC",
            status: 1,
            sort: 1,
            remark: "",
            createTime: "2026-03-01 10:00:00",
            updateTime: "2026-03-01 10:00:00",
          },
          {
            id: 2,
            name: "专业版",
            code: "PRO",
            status: 1,
            sort: 2,
            remark: "",
            createTime: "2026-03-02 10:00:00",
            updateTime: "2026-03-02 10:00:00",
          },
        ],
        total: 2,
      },
      msg: "一切ok",
    },
  },
  {
    url: "tenant-plans/options",
    method: ["GET"],
    body: {
      code: "00000",
      data: [
        { value: 1, label: "基础版" },
        { value: 2, label: "专业版" },
      ],
      msg: "一切ok",
    },
  },
  {
    url: "tenant-plans/:planId/form",
    method: ["GET"],
    body: ({ params }) => {
      const planId = Number(params.planId);
      const form =
        planId === 2
          ? {
              id: 2,
              name: "专业版",
              code: "PRO",
              status: 1,
              sort: 2,
              remark: "",
            }
          : {
              id: 1,
              name: "基础版",
              code: "BASIC",
              status: 1,
              sort: 1,
              remark: "",
            };

      return {
        code: "00000",
        data: form,
        msg: "一切ok",
      };
    },
  },
  {
    url: "tenant-plans",
    method: ["POST"],
    body: {
      code: "00000",
      data: null,
      msg: "一切ok",
    },
  },
  {
    url: "tenant-plans/:planId",
    method: ["PUT"],
    body: {
      code: "00000",
      data: null,
      msg: "一切ok",
    },
  },
  {
    url: "tenant-plans/:ids",
    method: ["DELETE"],
    body: {
      code: "00000",
      data: null,
      msg: "一切ok",
    },
  },
  {
    url: "tenant-plans/:planId/menuIds",
    method: ["GET"],
    body: {
      code: "00000",
      data: [1, 2, 3, 4, 5, 6],
      msg: "一切ok",
    },
  },
  {
    url: "tenant-plans/:planId/menus",
    method: ["PUT"],
    body: {
      code: "00000",
      data: null,
      msg: "一切ok",
    },
  },
]);
