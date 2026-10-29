import { defineMock } from "./base";

/** 数据表列表 */
const tableList = [
  {
    tableName: "sys_user",
    tableComment: "用户表",
    engine: "InnoDB",
    tableCollation: "utf8mb4_general_ci",
    createTime: "2023-06-01 10:00:00",
    isConfigured: 1,
  },
  {
    tableName: "sys_role",
    tableComment: "角色表",
    engine: "InnoDB",
    tableCollation: "utf8mb4_general_ci",
    createTime: "2023-06-01 10:05:00",
    isConfigured: 1,
  },
  {
    tableName: "sys_menu",
    tableComment: "菜单表",
    engine: "InnoDB",
    tableCollation: "utf8mb4_general_ci",
    createTime: "2023-06-01 10:10:00",
    isConfigured: 0,
  },
  {
    tableName: "sys_dept",
    tableComment: "部门表",
    engine: "InnoDB",
    tableCollation: "utf8mb4_general_ci",
    createTime: "2023-06-01 10:15:00",
    isConfigured: 0,
  },
];

/**
 * 下划线命名转驼峰首字母大写，如 sys_user → SysUser
 */
function toPascalCase(name: string): string {
  return name
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

/** 默认字段配置 */
const defaultFieldConfigs = [
  {
    columnName: "id",
    columnType: "bigint",
    fieldName: "id",
    fieldType: "Long",
    fieldComment: "主键",
    isPrimaryKey: 1,
    isShowInList: 1,
    isShowInForm: 0,
    isShowInQuery: 0,
    isRequired: 0,
    formType: 10,
    queryType: 0,
    maxLength: 20,
    fieldSort: 1,
    dictType: "",
  },
  {
    columnName: "username",
    columnType: "varchar(50)",
    fieldName: "username",
    fieldType: "String",
    fieldComment: "用户名",
    isShowInList: 1,
    isShowInForm: 1,
    isShowInQuery: 1,
    isRequired: 1,
    formType: 1,
    queryType: 2,
    maxLength: 50,
    fieldSort: 2,
    dictType: "",
  },
  {
    columnName: "nickname",
    columnType: "varchar(50)",
    fieldName: "nickname",
    fieldType: "String",
    fieldComment: "昵称",
    isShowInList: 1,
    isShowInForm: 1,
    isShowInQuery: 0,
    isRequired: 0,
    formType: 1,
    queryType: 0,
    maxLength: 50,
    fieldSort: 3,
    dictType: "",
  },
  {
    columnName: "gender",
    columnType: "tinyint",
    fieldName: "gender",
    fieldType: "Integer",
    fieldComment: "性别",
    isShowInList: 1,
    isShowInForm: 1,
    isShowInQuery: 0,
    isRequired: 0,
    formType: 2,
    queryType: 0,
    maxLength: 3,
    fieldSort: 4,
    dictType: "gender",
  },
  {
    columnName: "email",
    columnType: "varchar(100)",
    fieldName: "email",
    fieldType: "String",
    fieldComment: "邮箱",
    isShowInList: 0,
    isShowInForm: 1,
    isShowInQuery: 0,
    isRequired: 0,
    formType: 1,
    queryType: 0,
    maxLength: 100,
    fieldSort: 5,
    dictType: "",
  },
  {
    columnName: "status",
    columnType: "tinyint",
    fieldName: "status",
    fieldType: "Integer",
    fieldComment: "状态",
    isShowInList: 1,
    isShowInForm: 1,
    isShowInQuery: 1,
    isRequired: 1,
    formType: 6,
    queryType: 1,
    maxLength: 3,
    fieldSort: 6,
    dictType: "",
  },
  {
    columnName: "create_time",
    columnType: "datetime",
    fieldName: "createTime",
    fieldType: "LocalDateTime",
    fieldComment: "创建时间",
    isShowInList: 1,
    isShowInForm: 0,
    isShowInQuery: 1,
    isRequired: 0,
    formType: 9,
    queryType: 4,
    maxLength: 0,
    fieldSort: 7,
    dictType: "",
  },
];

/** 生成配置数据源（内存态，POST 保存、DELETE 重置） */
const genConfigMap: Record<string, any> = {
  sys_user: {
    id: "1",
    tableName: "sys_user",
    businessName: "user",
    moduleName: "system",
    packageName: "com.youlai.system",
    entityName: "SysUser",
    author: "youlai",
    parentMenuId: "1",
    backendAppName: "youlai-admin",
    frontendAppName: "vue3-element-admin",
    removeTablePrefix: "sys_",
    pageType: "classic",
    fieldConfigs: defaultFieldConfigs,
  },
  sys_role: {
    id: "2",
    tableName: "sys_role",
    businessName: "role",
    moduleName: "system",
    packageName: "com.youlai.system",
    entityName: "SysRole",
    author: "youlai",
    parentMenuId: "1",
    backendAppName: "youlai-admin",
    frontendAppName: "vue3-element-admin",
    removeTablePrefix: "sys_",
    pageType: "classic",
    fieldConfigs: defaultFieldConfigs,
  },
};

/**
 * 未配置表的默认生成配置（无 id，进入抽屉后从基础配置步骤开始）
 */
function buildDefaultConfig(tableName: string) {
  return {
    tableName,
    businessName: tableName.replace(/^sys_/, ""),
    moduleName: "system",
    packageName: "com.youlai.system",
    entityName: toPascalCase(tableName.replace(/^sys_/, "")),
    author: "youlai",
    parentMenuId: "1",
    backendAppName: "youlai-admin",
    frontendAppName: "vue3-element-admin",
    removeTablePrefix: "sys_",
    pageType: "classic",
    fieldConfigs: defaultFieldConfigs,
  };
}

/**
 * 构造代码生成预览文件列表
 */
function buildPreviewFiles(tableName: string, tableComment: string) {
  const bizName = tableName.replace(/^sys_/, "");
  const entityName = toPascalCase(bizName);
  return [
    {
      path: "src/api/system/",
      fileName: `${bizName}.ts`,
      content: `import request from "@/utils/request";\n\n/** ${tableComment}相关接口 */\nexport const ${bizName}Api = {\n  getPage(params: unknown) {\n    return request({ url: "/api/v1/${tableName}s", method: "get", params });\n  },\n};\n`,
      scope: "frontend",
      language: "ts",
    },
    {
      path: "src/views/system/",
      fileName: `${bizName}.vue`,
      content: `<template>\n  <div class="page-container">${tableComment}管理</div>\n</template>\n\n<script setup lang="ts">\ndefineOptions({ name: "${entityName}" });\n</script>\n`,
      scope: "frontend",
      language: "vue",
    },
    {
      path: "src/main/java/com/youlai/system/controller/",
      fileName: `${entityName}Controller.java`,
      content: `package com.youlai.system.controller;\n\nimport org.springframework.web.bind.annotation.RestController;\n\n/**\n * ${tableComment}控制器\n */\n@RestController\npublic class ${entityName}Controller {\n}\n`,
      scope: "backend",
      language: "java",
    },
    {
      path: "src/main/resources/mapper/",
      fileName: `${entityName}Mapper.xml`,
      content: `<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"\n  "http://mybatis.org/dtd/mybatis-3-mapper.dtd">\n<mapper namespace="com.youlai.system.mapper.${entityName}Mapper">\n</mapper>\n`,
      scope: "backend",
      language: "xml",
    },
  ];
}

export default defineMock([
  // 数据表分页列表
  {
    url: "codegen/table",
    method: ["GET"],
    body({ query }) {
      const { keywords, pageNum = "1", pageSize = "10" } = query;
      const filtered = tableList.filter((item) => {
        if (keywords && !`${item.tableName}${item.tableComment}`.includes(keywords)) {
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

  // 获取代码生成配置
  {
    url: "codegen/:tableName/config",
    method: ["GET"],
    body({ params }) {
      return {
        code: "00000",
        data: genConfigMap[params.tableName] ?? buildDefaultConfig(params.tableName),
        msg: "一切ok",
      };
    },
  },

  // 保存代码生成配置
  {
    url: "codegen/:tableName/config",
    method: ["POST"],
    body({ params, body }) {
      genConfigMap[params.tableName] = { id: "1", ...body };
      const table = tableList.find((item) => item.tableName === params.tableName);
      if (table) {
        table.isConfigured = 1;
      }
      return {
        code: "00000",
        data: null,
        msg: "保存成功",
      };
    },
  },

  // 重置代码生成配置
  {
    url: "codegen/:tableName/config",
    method: ["DELETE"],
    body({ params }) {
      delete genConfigMap[params.tableName];
      const table = tableList.find((item) => item.tableName === params.tableName);
      if (table) {
        table.isConfigured = 0;
      }
      return {
        code: "00000",
        data: null,
        msg: "重置成功",
      };
    },
  },

  // 获取代码生成预览数据
  {
    url: "codegen/:tableName/preview",
    method: ["GET"],
    body({ params }) {
      const table = tableList.find((item) => item.tableName === params.tableName);
      return {
        code: "00000",
        data: buildPreviewFiles(params.tableName, table?.tableComment || params.tableName),
        msg: "一切ok",
      };
    },
  },

  // 下载代码生成 ZIP 文件
  {
    url: "codegen/:tableName/download",
    method: ["GET"],
    headers: {
      "Content-Disposition": "attachment; filename=codegen.zip",
    },
  },
]);
