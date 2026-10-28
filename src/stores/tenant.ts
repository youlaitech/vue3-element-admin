import { store } from "@/stores";
import TenantAPI from "@/api/system/tenant";
import type { TenantInfo } from "@/api/system/tenant";
import { STORAGE_KEYS } from "@/constants";
import AuthAPI from "@/api/auth";
import { AuthStorage } from "@/utils/auth";
import { isAxiosError } from "axios";

/**
 * 识别当前部署未提供的租户接口。
 */
function isUnsupportedEndpoint(error: unknown): boolean {
  return isAxiosError(error) && [404, 405, 501].includes(error.response?.status ?? 0);
}

/**
 * 管理租户选项与租户功能状态。
 */
export const useTenantStore = defineStore("tenant", () => {
  const currentTenantId = ref<number | null>(null);
  const currentTenant = ref<TenantInfo | null>(null);
  const tenantList = ref<TenantInfo[]>([]);

  /**
   * 从本地缓存恢复租户 ID 与展示信息。
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
   * 恢复租户选择，缺失或失效时选择默认租户。
   */
  async function loadTenant() {
    restoreTenant();

    await fetchTenantList();

    // 缓存中的租户已不可访问时重新选择。
    if (
      currentTenantId.value != null &&
      tenantList.value.length > 0 &&
      !tenantList.value.some((t) => t.id === currentTenantId.value)
    ) {
      console.debug("[Tenant] 本地租户已不可用，清除并重新选择:", currentTenantId.value);
      clearLocalTenant();
    }

    if (tenantList.value.length > 0) {
      // 没有本地选择时，优先使用后端当前租户。
      if (currentTenantId.value == null) {
        const currentTenantInfo = await safeGetCurrentTenant();
        if (currentTenantInfo) {
          setCurrentTenant(currentTenantInfo);
          return;
        }
      }

      // 本地仅保存 ID 时，从可访问列表补全展示信息。
      if (currentTenantId.value != null && !currentTenant.value) {
        const matched = tenantList.value.find((t) => t.id === currentTenantId.value);
        if (matched) {
          setCurrentTenant(matched);
          return;
        }
      }

      // 本地和后端均未选择时，使用首个可访问租户。
      if (currentTenantId.value == null) {
        setCurrentTenant(tenantList.value[0]);
        console.debug("[Tenant] 默认选中第一个租户:", tenantList.value[0].name);
      }
    }
  }

  /**
   * 更新当前租户并保存本地选择。
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
   * @param tenantId 目标租户 ID
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

  /**
   * 清除本地保存的租户信息
   */
  function clearLocalTenant() {
    localStorage.removeItem(STORAGE_KEYS.TENANT_ID);
    localStorage.removeItem(STORAGE_KEYS.TENANT_INFO);
  }

  /**
   * 可选接口未实现时返回空，其他故障继续抛出。
   */
  async function safeGetCurrentTenant(): Promise<TenantInfo | null> {
    try {
      return await TenantAPI.getCurrentTenant();
    } catch (error) {
      if (!isUnsupportedEndpoint(error)) throw error;
      return null;
    }
  }

  /**
   * 切换租户后重新签发令牌
   */
  async function refreshTokenIfSupported(tenantId: number): Promise<void> {
    try {
      const token = await AuthAPI.switchTenant(tenantId);
      if (token?.accessToken && token?.refreshToken) {
        AuthStorage.setTokens(token.accessToken, token.refreshToken, AuthStorage.getRememberMe());
      }
    } catch (error) {
      // 只有接口明确未实现时回退；权限、网络和服务异常继续交给调用方。
      if (!isUnsupportedEndpoint(error)) throw error;
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
