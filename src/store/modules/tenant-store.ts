import { store } from "@/store";
import TenantAPI, { type TenantInfo } from "@/api/system/tenant";
import { STORAGE_KEYS } from "@/constants";

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
  function fetchTenantList() {
    return new Promise<TenantInfo[]>((resolve, reject) => {
      TenantAPI.getTenantList()
        .then((data) => {
          tenantList.value = data || [];
          resolve(data || []);
        })
        .catch((error) => {
          reject(error);
        });
    });
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
    // 1. 获取租户列表
    await fetchTenantList();

    // 2. 如果已有租户列表且未设置当前租户
    if (tenantList.value.length > 0 && !currentTenantId.value) {
      try {
        // 尝试从后端获取当前租户
        const currentTenantInfo = await TenantAPI.getCurrentTenant();
        if (currentTenantInfo) {
          setCurrentTenant(currentTenantInfo);
          return;
        }
      } catch (error) {
        console.debug("[Tenant] 获取当前租户失败，尝试自动选择:", error);
      }

      // 3. 如果只有一个租户，自动选中
      if (tenantList.value.length === 1) {
        setCurrentTenant(tenantList.value[0]);
        console.debug("[Tenant] 自动选中唯一租户:", tenantList.value[0].name);
      } else {
        console.debug("[Tenant] 多个租户可用，等待用户选择");
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
  function switchTenant(tenantId: number) {
    return new Promise<void>((resolve, reject) => {
      TenantAPI.switchTenant(tenantId)
        .then((tenantInfo) => {
          // 后端返回切换后的租户信息
          if (tenantInfo) {
            setCurrentTenant(tenantInfo);
          } else {
            // 如果后端未返回，从租户列表中找到对应的租户信息
            const tenant = tenantList.value.find((t) => t.id === tenantId);
            if (tenant) {
              setCurrentTenant(tenant);
            } else {
              // 如果列表中没有，重新获取租户信息
              TenantAPI.getCurrentTenant()
                .then((info) => {
                  if (info) {
                    setCurrentTenant(info);
                  }
                })
                .catch(console.error);
            }
          }
          resolve();
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  /**
   * 清除租户信息
   */
  function clearTenant() {
    currentTenantId.value = null;
    currentTenant.value = null;
    tenantList.value = [];
    localStorage.removeItem(STORAGE_KEYS.TENANT_ID);
    localStorage.removeItem(STORAGE_KEYS.TENANT_INFO);
  }

  // 恢复本地租户信息
  restoreTenant();

  return {
    currentTenantId,
    currentTenant,
    tenantList,
    loadTenant,
    fetchTenantList,
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
