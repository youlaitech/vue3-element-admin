import { defineMock } from "./base";

export default defineMock([
  {
    url: "tenants/options",
    method: ["GET"],
    body: {
      code: "00000",
      data: [
        {
          id: 1,
          name: "默认租户",
          code: "default",
          contactName: "管理员",
          contactPhone: "17621210366",
          contactEmail: "",
          domain: "default",
          logo: "",
          planId: 1,
          status: 1,
          remark: "",
          expireTime: null,
          isDefault: true,
        },
        {
          id: 2,
          name: "演示租户",
          code: "demo",
          contactName: "演示用户",
          contactPhone: "17621210366",
          contactEmail: "",
          domain: "demo",
          logo: "",
          planId: 2,
          status: 1,
          remark: "",
          expireTime: null,
          isDefault: false,
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
        code: "default",
        contactName: "管理员",
        contactPhone: "17621210366",
        contactEmail: "",
        domain: "default",
        logo: "",
        planId: 1,
        status: 1,
        remark: "",
        expireTime: null,
        isDefault: true,
      },
      msg: "一切ok",
    },
  },
  {
    url: "tenants",
    method: ["GET"],
    body: {
      code: "00000",
      data: {
        list: [
          {
            id: 1,
            name: "默认租户",
            code: "default",
            contactName: "管理员",
            contactPhone: "17621210366",
            contactEmail: "",
            domain: "default",
            logo: "",
            planId: 1,
            status: 1,
            remark: "",
            expireTime: null,
            createTime: "2026-03-01 10:00:00",
            updateTime: "2026-03-01 10:00:00",
          },
          {
            id: 2,
            name: "演示租户",
            code: "demo",
            contactName: "演示用户",
            contactPhone: "17621210366",
            contactEmail: "",
            domain: "demo",
            logo: "",
            planId: 2,
            status: 1,
            remark: "",
            expireTime: null,
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
    url: "tenants/:tenantId/form",
    method: ["GET"],
    body: ({ params }) => {
      const tenantId = Number(params.tenantId);
      const form =
        tenantId === 2
          ? {
              id: 2,
              name: "演示租户",
              code: "demo",
              domain: "demo",
              contactName: "演示用户",
              contactPhone: "17621210366",
              contactEmail: "",
              logo: "",
              planId: 2,
              status: 1,
              remark: "",
              expireTime: null,
            }
          : {
              id: 1,
              name: "默认租户",
              code: "default",
              domain: "default",
              contactName: "管理员",
              contactPhone: "17621210366",
              contactEmail: "",
              logo: "",
              planId: 1,
              status: 1,
              remark: "",
              expireTime: null,
            };

      return {
        code: "00000",
        data: form,
        msg: "一切ok",
      };
    },
  },
  {
    url: "tenants",
    method: ["POST"],
    body: {
      code: "00000",
      data: {
        tenantId: 3,
        tenantCode: "test",
        tenantName: "测试租户",
        adminUsername: "admin",
        adminInitialPassword: "123456",
        adminRoleCode: "TENANT_ADMIN",
      },
      msg: "一切ok",
    },
  },
  {
    url: "tenants/:tenantId",
    method: ["PUT"],
    body: {
      code: "00000",
      data: null,
      msg: "一切ok",
    },
  },
  {
    url: "tenants/:ids",
    method: ["DELETE"],
    body: {
      code: "00000",
      data: null,
      msg: "一切ok",
    },
  },
  {
    url: "tenants/:tenantId/status",
    method: ["PUT"],
    body: {
      code: "00000",
      data: null,
      msg: "一切ok",
    },
  },
  {
    url: "tenants/:tenantId/menuIds",
    method: ["GET"],
    body: {
      code: "00000",
      data: [1, 2, 3, 4, 5, 6],
      msg: "一切ok",
    },
  },
  {
    url: "tenants/:tenantId/menus",
    method: ["PUT"],
    body: {
      code: "00000",
      data: null,
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
          code: "default",
          contactName: "管理员",
          contactPhone: "17621210366",
          contactEmail: "",
          domain: "default",
          logo: "",
          planId: 1,
          status: 1,
          remark: "",
          expireTime: null,
          isDefault: true,
        },
        {
          id: 2,
          name: "演示租户",
          code: "demo",
          contactName: "演示用户",
          contactPhone: "17621210366",
          contactEmail: "",
          domain: "demo",
          logo: "",
          planId: 2,
          status: 1,
          remark: "",
          expireTime: null,
          isDefault: false,
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
