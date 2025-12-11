import { store } from "@/store";
import TenantAPI, { type TenantInfo } from "@/api/system/tenant-api";

// 前端多租户开关；默认开启，若后端未启用多租户可在 .env 设置 VITE_APP_TENANT_ENABLED=false
const TENANT_ENABLED = import.meta.env.VITE_APP_TENANT_ENABLED !== "false";

const TENANT_ID_KEY = "current_tenant_id";
const TENANT_INFO_KEY = "current_tenant_info";

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
   * 初始化租户信息
   * 从 localStorage 恢复上次使用的租户
   */
  function initTenant() {
    const savedTenantId = localStorage.getItem(TENANT_ID_KEY);
    const savedTenantInfo = localStorage.getItem(TENANT_INFO_KEY);

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
   * 登录后初始化租户：获取列表并尽量确定当前租户
   * - 忽略错误，以便单租户模式不受影响
   */
  // 登录后准备租户上下文：先取租户列表，再用后端返回的当前租户；若单租户则自动选中
  async function prepareTenantContextAfterLogin() {
    if (!TENANT_ENABLED) {
      return;
    }

    try {
      await fetchTenantList();

      if (tenantList.value.length > 0 && !currentTenantId.value) {
        try {
          const currentTenantInfo = await TenantAPI.getCurrentTenant();
          if (currentTenantInfo) {
            setCurrentTenant(currentTenantInfo);
          } else if (tenantList.value.length === 1) {
            setCurrentTenant(tenantList.value[0]);
          }
        } catch (error) {
          if (tenantList.value.length === 1) {
            setCurrentTenant(tenantList.value[0]);
          }
          console.debug("获取当前租户信息失败（可能是单租户模式）:", error);
        }
      }
    } catch (error) {
      console.debug("获取租户列表失败（可能是单租户模式）:", error);
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
    localStorage.setItem(TENANT_ID_KEY, String(tenant.id));
    localStorage.setItem(TENANT_INFO_KEY, JSON.stringify(tenant));
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
    localStorage.removeItem(TENANT_ID_KEY);
    localStorage.removeItem(TENANT_INFO_KEY);
  }

  // 初始化
  initTenant();

  return {
    currentTenantId,
    currentTenant,
    tenantList,
    prepareTenantContextAfterLogin,
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
