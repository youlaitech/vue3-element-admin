import { defineMock } from "./base";

/** 配置数据源（内存态，支持增删改） */
const configList: Array<Record<string, any>> = [
  {
    id: "1",
    configName: "用户管理-账号初始密码",
    configKey: "sys.user.initPassword",
    configValue: "123456",
    remark: "新增用户、导入用户时的默认密码",
  },
];

export default defineMock([
  // 配置分页列表
  {
    url: "configs",
    method: ["GET"],
    body({ query }) {
      const { keywords, pageNum = "1", pageSize = "10" } = query;
      const filtered = configList.filter((item) => {
        if (keywords && !`${item.configName}${item.configKey}`.includes(keywords)) {
          return false;
        }
        return true;
      });
      const page = Number(pageNum);
      const size = Number(pageSize);
      const start = (page - 1) * size;
      return {
        code: "00000",
        data: {
          list: filtered.slice(start, start + size),
          total: filtered.length,
        },
        msg: "一切ok",
      };
    },
  },

  // 获取配置表单数据
  {
    url: "configs/:id/form",
    method: ["GET"],
    body({ params }) {
      const data = configList.find((item) => item.id === params.id);
      return {
        code: "00000",
        data: data ?? null,
        msg: "一切ok",
      };
    },
  },

  // 新增配置
  {
    url: "configs",
    method: ["POST"],
    body({ body }) {
      configList.unshift({ id: String(configList.length + 1), ...body });
      return {
        code: "00000",
        data: null,
        msg: "新增成功",
      };
    },
  },

  // 修改配置
  {
    url: "configs/:id",
    method: ["PUT"],
    body({ params, body }) {
      const index = configList.findIndex((item) => item.id === params.id);
      if (index !== -1) {
        configList[index] = { ...configList[index], ...body };
      }
      return {
        code: "00000",
        data: null,
        msg: "修改成功",
      };
    },
  },

  // 删除配置
  {
    url: "configs/:id",
    method: ["DELETE"],
    body({ params }) {
      const index = configList.findIndex((item) => item.id === params.id);
      if (index !== -1) {
        configList.splice(index, 1);
      }
      return {
        code: "00000",
        data: null,
        msg: "删除成功",
      };
    },
  },

  // 刷新配置缓存
  {
    url: "configs/refresh",
    method: ["PUT"],
    body: {
      code: "00000",
      data: null,
      msg: "刷新成功",
    },
  },
]);
