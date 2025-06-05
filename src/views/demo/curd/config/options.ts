/** 公共下载数据，减少重复请求次数 */
import DeptAPI from "@/api/system/dept.api";
import RoleAPI from "@/api/system/role.api";

interface OptionType {
  label: string;
  value: any;
  [key: string]: any; // 允许其他属性
}

// 明确指定类型为 OptionType[]
export const deptArr = ref<OptionType[]>([]);
export const roleArr = ref<OptionType[]>([]);
export const stateArr = ref<OptionType[]>([
  { label: "启用", value: 1 },
  { label: "禁用", value: 0 },
]);

// 初始化逻辑，在 onMounted 钩子中调用
export const initOptions = async () => {
  try {
    // 使用Promise.all并行请求
    const [dept, roles] = await Promise.all([DeptAPI.getOptions(), RoleAPI.getOptions()]);
    // 获取部门选项并赋值
    deptArr.value = dept;
    // 获取角色选项并赋值
    roleArr.value = roles;
  } catch (error) {
    console.error("初始化选项失败:", error);
  }
};
