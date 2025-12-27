import { defineMock } from "./base";

export default defineMock([
  {
    url: "tenants",
    method: ["GET"],
    body: {
      code: "00000",
      data: [
        {
          id: 1,
          name: "默认租户",
          domain: "default",
        },
        {
          id: 2,
          name: "演示租户",
          domain: "demo",
        },
      ],
      msg: "一切ok",
    },
  },
  {
    url: "tenants/current",
    method: ["GET"],
    body: {
      code: "00000",
      data: {
        id: 1,
        name: "默认租户",
        domain: "default",
      },
      msg: "一切ok",
    },
  },
  {
    url: "tenants/:tenantId/switch",
    method: ["POST"],
    body({ params }) {
      const tenantId = Number(params.tenantId);

      const allTenants = [
        {
          id: 1,
          name: "默认租户",
          domain: "default",
        },
        {
          id: 2,
          name: "演示租户",
          domain: "demo",
        },
      ];

      const tenant = allTenants.find((t) => t.id === tenantId) || null;

      return {
        code: tenant ? "00000" : "A0400",
        data: tenant,
        msg: tenant ? "切换租户成功" : "租户不存在",
      };
    },
  },
]);
