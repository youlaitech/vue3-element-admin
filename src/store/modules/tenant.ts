import { store } from "@/store";
import TenantAPI from "@/api/system/tenant";
import type { TenantInfo } from "@/types/api";
import { STORAGE_KEYS } from "@/constants";
import AuthAPI from "@/api/auth";
import { AuthStorage } from "@/utils/auth";

/**
 * 租户 Store
 */
export const useTenantStore = defineStore("tenant", () => {
  // 当前租户ID
  const currentTenantId = ref<number | null>(null);
  // 当前租户信息
  const currentTenant = ref<TenantInfo | null>(null);
  // 用户可访问的租户列表
  const tenantList = ref<TenantInfo[]>([]);

  /**
   * 恢复租户信息
   * 从 localStorage 恢复上次使用的租户
   */
  function restoreTenant() {
    const savedTenantId = localStorage.getItem(STORAGE_KEYS.TENANT_ID);
    const savedTenantInfo = localStorage.getItem(STORAGE_KEYS.TENANT_INFO);

    if (savedTenantId) {
      currentTenantId.value = Number(savedTenantId);
    }

    if (savedTenantInfo) {
      try {
        currentTenant.value = JSON.parse(savedTenantInfo);
      } catch (e) {
        console.error("解析租户信息失败", e);
      }
    }
  }

  /**
   * 获取用户租户列表
   */
  async function fetchTenantList(): Promise<TenantInfo[]> {
    const data = await TenantAPI.getTenantList();
    tenantList.value = data || [];
    return data || [];
  }

  /**
   * 加载租户
   *
   * 执行流程：
   * 1. 获取用户可访问的租户列表
   * 2. 尝试获取后端当前租户
   * 3. 如果只有一个租户，自动选中
   * 4. 否则等待用户手动选择
   *
   * @remarks
   * 此方法由路由守卫调用，仅在启用多租户时执行
   */
  async function loadTenant() {
    restoreTenant();

    // 1. 获取租户列表
    await fetchTenantList();

    // 2. 校验本地恢复的租户是否仍然可用（避免 tenantId 不在列表导致无默认选中）
    if (
      currentTenantId.value != null &&
      tenantList.value.length > 0 &&
      !tenantList.value.some((t) => t.id === currentTenantId.value)
    ) {
      console.debug("[Tenant] 本地租户已不可用，清除并重新选择:", currentTenantId.value);
      clearLocalTenant();
    }

    // 3. 如果已有租户列表，则保证一定有一个默认租户被选中
    if (tenantList.value.length > 0) {
      // 3.1 优先后端当前租户
      if (currentTenantId.value == null) {
        const currentTenantInfo = await safeGetCurrentTenant();
        if (currentTenantInfo) {
          setCurrentTenant(currentTenantInfo);
          return;
        }
      }

      // 3.2 本地已有 tenantId，但 currentTenant 为空时，从列表补全 tenantInfo（保持展示名称一致）
      if (currentTenantId.value != null && !currentTenant.value) {
        const matched = tenantList.value.find((t) => t.id === currentTenantId.value);
        if (matched) {
          setCurrentTenant(matched);
          return;
        }
      }

      // 3.3 兜底：默认选中第一个（即使有多个租户，也保证 TenantSwitcher 有默认选中）
      if (currentTenantId.value == null) {
        setCurrentTenant(tenantList.value[0]);
        console.debug("[Tenant] 默认选中第一个租户:", tenantList.value[0].name);
      }
    }
  }

  /**
   * 设置当前租户
   *
   * @param tenant 租户信息
   */
  function setCurrentTenant(tenant: TenantInfo) {
    currentTenantId.value = tenant.id;
    currentTenant.value = tenant;

    // 保存到 localStorage
    localStorage.setItem(STORAGE_KEYS.TENANT_ID, String(tenant.id));
    localStorage.setItem(STORAGE_KEYS.TENANT_INFO, JSON.stringify(tenant));
  }

  /**
   * 切换租户
   *
   * @param tenantId 目标租户ID
   */
  async function switchTenant(tenantId: number): Promise<void> {
    await refreshTokenIfSupported(tenantId);

    const tenantInfo = await TenantAPI.switchTenant(tenantId);
    if (tenantInfo) {
      setCurrentTenant(tenantInfo);
      return;
    }

    const matched = tenantList.value.find((t) => t.id === tenantId);
    if (matched) {
      setCurrentTenant(matched);
      return;
    }

    const fallback = await safeGetCurrentTenant();
    if (fallback) {
      setCurrentTenant(fallback);
      return;
    }

    throw new Error("切换租户后无法获取租户信息");
  }

  /**
   * 清除租户信息
   */
  function clearTenant() {
    currentTenantId.value = null;
    currentTenant.value = null;
    tenantList.value = [];
    clearLocalTenant();
  }

  function clearLocalTenant() {
    localStorage.removeItem(STORAGE_KEYS.TENANT_ID);
    localStorage.removeItem(STORAGE_KEYS.TENANT_INFO);
  }

  async function safeGetCurrentTenant(): Promise<TenantInfo | null> {
    try {
      return await TenantAPI.getCurrentTenant();
    } catch (error) {
      console.debug("[Tenant] 获取当前租户失败，尝试本地/默认选择:", error);
      return null;
    }
  }

  async function refreshTokenIfSupported(tenantId: number): Promise<void> {
    try {
      const token = await AuthAPI.switchTenant(tenantId);
      if (token?.accessToken && token?.refreshToken) {
        AuthStorage.setTokens(token.accessToken, token.refreshToken, AuthStorage.getRememberMe());
      }
    } catch {
      // 忽略：非平台用户或后端未启用该接口时，回退到旧接口
    }
  }

  /**
   * 设置租户列表
   */
  function setTenantList(list: TenantInfo[]) {
    tenantList.value = list || [];
  }

  // 恢复本地租户信息
  restoreTenant();

  return {
    currentTenantId,
    currentTenant,
    tenantList,
    loadTenant,
    fetchTenantList,
    setTenantList,
    setCurrentTenant,
    switchTenant,
    clearTenant,
  };
});

/**
 * 在组件外部使用 TenantStore 的钩子函数
 */
export function useTenantStoreHook() {
  return useTenantStore(store);
}
