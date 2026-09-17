import { cloneDeep } from "lodash-es";
import type { FieldConfig, GenConfigForm } from "@/api/codegen";
import type { OptionItem } from "@/api/common";
import { FormTypeEnum, QueryTypeEnum } from "@/enums/codegen";

/** 单处改动 */
export interface AiChangeItem {
  /** 改动项名称 */
  label: string;
  /** 改动前展示值 */
  from: string;
  /** 改动后展示值 */
  to: string;
}

/** 单个字段的改动 */
export interface AiFieldChange {
  /** 列名 */
  columnName: string;
  /** 改动明细 */
  changes: AiChangeItem[];
}

/** 改动明细行，供差异表格逐行展示 */
export interface AiChangeRow extends AiChangeItem {
  /** 列名 */
  columnName: string;
  /** 该字段的改动总数，只在首行展示 */
  fieldChangeCount: number;
  /** 是否为该字段的首行，字段名只在首行出现 */
  first: boolean;
}

/** AI 填充前后差异 */
export interface AiFillDiff {
  /** 业务名改动 */
  businessName?: AiChangeItem;
  /** 字段改动列表 */
  fields: AiFieldChange[];
  /** 涉及字段数 */
  fieldCount: number;
  /** 改动总数 */
  changeCount: number;
}

/** 参与比对的字段属性，顺序与字段配置表格一致 */
const FIELD_ITEMS: { key: keyof FieldConfig; label: string; format: (value: unknown) => string }[] =
  [
    { key: "fieldComment", label: "字段描述", format: text },
    { key: "isShowInQuery", label: "查询条件", format: switchText },
    { key: "queryType", label: "查询方式", format: (value) => enumLabel(QueryTypeEnum, value) },
    { key: "isShowInList", label: "列表显示", format: switchText },
    { key: "isShowInForm", label: "表单显示", format: switchText },
    { key: "formType", label: "表单类型", format: (value) => enumLabel(FormTypeEnum, value) },
    { key: "dictType", label: "字典类型", format: text },
    { key: "isRequired", label: "必填", format: switchText },
  ];

/** 空值显示为「空」，避免差异明细里出现空白 */
function text(value: unknown): string {
  return value == null || value === "" ? "空" : String(value);
}

/** 0/1 开关值转文本 */
function switchText(value: unknown): string {
  return value === 1 ? "是" : "否";
}

/** 枚举值转中文名，匹配不到时保留原值 */
function enumLabel(options: Record<string, OptionItem>, value: unknown): string {
  if (value == null) return "-";
  const hit = Object.values(options).find((item) => item.value === value);
  return hit?.label ?? String(value);
}

/** 对比两份配置，只保留发生变化的部分 */
export function diffGenConfig(before: GenConfigForm, after: GenConfigForm): AiFillDiff {
  const diff: AiFillDiff = { fields: [], fieldCount: 0, changeCount: 0 };

  if ((before.businessName ?? "") !== (after.businessName ?? "")) {
    diff.businessName = {
      label: "业务名",
      from: text(before.businessName),
      to: text(after.businessName),
    };
    diff.changeCount++;
  }

  const beforeFields = new Map(
    (before.fieldConfigs ?? []).map((field) => [field.columnName, field])
  );
  (after.fieldConfigs ?? []).forEach((field) => {
    const origin = beforeFields.get(field.columnName);
    if (!origin) return;
    const changes: AiChangeItem[] = [];
    FIELD_ITEMS.forEach(({ key, label, format }) => {
      const from = format(origin[key]);
      const to = format(field[key]);
      if (from !== to) changes.push({ label, from, to });
    });
    if (changes.length) {
      diff.fields.push({ columnName: field.columnName ?? "", changes });
      diff.fieldCount++;
      diff.changeCount += changes.length;
    }
  });

  return diff;
}

/** AI 填充差异：填充前留快照，填充后算差异，支持撤销 */
export function useAiFillDiff() {
  const aiDiff = ref<AiFillDiff | null>(null);
  let snapshot: GenConfigForm | null = null;

  /** 字段改动映射，供字段表格按列名标记 */
  const fieldChanges = computed<Record<string, AiChangeItem[]>>(() => {
    const map: Record<string, AiChangeItem[]> = {};
    (aiDiff.value?.fields ?? []).forEach((field) => {
      map[field.columnName] = field.changes;
    });
    return map;
  });

  /** 改动明细拍平成表格行，同一字段的多条改动带上合并标记 */
  const changeRows = computed<AiChangeRow[]>(() =>
    (aiDiff.value?.fields ?? []).flatMap((field) =>
      field.changes.map((item, index) => ({
        columnName: field.columnName,
        fieldChangeCount: field.changes.length,
        first: index === 0,
        ...item,
      }))
    )
  );

  /** 丢弃差异与快照 */
  function clear() {
    snapshot = null;
    aiDiff.value = null;
  }

  /** 记录填充前的配置 */
  function snapshotConfig(config: GenConfigForm) {
    snapshot = cloneDeep(config);
    aiDiff.value = null;
  }

  /** 计算与填充前的差异 */
  function resolveDiff(filled: GenConfigForm): AiFillDiff {
    const diff = snapshot
      ? diffGenConfig(snapshot, filled)
      : { fields: [], fieldCount: 0, changeCount: 0 };
    aiDiff.value = diff;
    return diff;
  }

  /** 恢复填充前的配置并清空差异 */
  function undo(): GenConfigForm | null {
    if (!snapshot) return null;
    const config = cloneDeep(snapshot);
    clear();
    return config;
  }

  return { aiDiff, fieldChanges, changeRows, clear, snapshotConfig, resolveDiff, undo };
}
