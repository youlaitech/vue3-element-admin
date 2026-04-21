import GeneratorAPI from "@/api/codegen";
import type { GenConfigForm } from "@/api/codegen";
import DictAPI from "@/api/system/dict";
import MenuAPI from "@/api/system/menu";
import { QueryTypeEnum } from "@/enums/codegen";

export function useGenConfig() {
  const genConfigFormData = ref<GenConfigForm>({
    fieldConfigs: [],
    pageType: "classic",
  });

  const genConfigFormRules = {
    tableName: [{ required: true, message: "请输入表名", trigger: "blur" }],
    businessName: [{ required: true, message: "请输入业务名", trigger: "blur" }],
    packageName: [{ required: true, message: "请输入主包名", trigger: "blur" }],
    moduleName: [{ required: true, message: "请输入模块名", trigger: "blur" }],
    entityName: [{ required: true, message: "请输入实体名", trigger: "blur" }],
  };

  const menuOptions = ref<OptionItem[]>([]);
  const dictOptions = ref<OptionItem[]>([]);

  /** 自动根据表前缀推导实体名 */
  watch(
    () => genConfigFormData.value.removeTablePrefix,
    (prefix) => {
      const table = genConfigFormData.value.tableName;
      if (!table) return;
      const p = prefix || "";
      const base = table.startsWith(p) ? table.slice(p.length) : table;
      const camel = base
        .split("_")
        .filter(Boolean)
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
        .join("");
      genConfigFormData.value.entityName = camel;
    }
  );

  // Date 类型字段默认用范围查询，比较符合直觉
  watch(
    () => genConfigFormData.value.fieldConfigs,
    (newVal) => {
      if (!newVal) return;
      newVal.forEach((fieldConfig) => {
        if (
          fieldConfig.fieldType?.includes("Date") &&
          fieldConfig.isShowInQuery === 1 &&
          fieldConfig.queryType == null
        ) {
          fieldConfig.queryType = QueryTypeEnum.BETWEEN.value as number;
        }
      });
    },
    { deep: true, immediate: true }
  );

  /** 加载配置：并行获取菜单、字典、生成配置 */
  async function loadConfig(tableName: string) {
    const [menuList, dictList, config] = await Promise.all([
      MenuAPI.getOptions(true),
      DictAPI.getList(),
      GeneratorAPI.getGenConfig(tableName),
    ]);
    menuOptions.value = menuList;
    dictOptions.value = dictList;
    genConfigFormData.value = config;
    return config;
  }

  /** 保存配置 */
  async function saveConfig(tableName: string) {
    await GeneratorAPI.saveGenConfig(tableName, genConfigFormData.value);
  }

  /** 校验基础配置必填项 */
  function validateBasic(): boolean {
    const { tableName, packageName, businessName, moduleName, entityName } =
      genConfigFormData.value;
    if (!tableName || !packageName || !businessName || !moduleName || !entityName) {
      ElMessage.error("表名、业务名、包名、模块名、实体名不能为空");
      return false;
    }
    return true;
  }

  /** 批量设置字段属性 */
  function bulkSet(key: "isShowInQuery" | "isShowInList" | "isShowInForm", value: 0 | 1) {
    const list = genConfigFormData.value?.fieldConfigs || [];
    list.forEach((row) => {
      row[key] = value;
    });
  }

  return {
    genConfigFormData,
    genConfigFormRules,
    menuOptions,
    dictOptions,
    loadConfig,
    saveConfig,
    validateBasic,
    bulkSet,
  };
}
