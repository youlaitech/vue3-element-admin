<template>
  <el-dropdown v-if="showTenantSelector" trigger="click" @command="handleSwitchTenant">
    <div class="tenant-selector">
      <el-icon><OfficeBuilding /></el-icon>
      <span class="tenant-name">{{ currentTenantName }}</span>
      <el-icon class="el-icon--right"><ArrowDown /></el-icon>
    </div>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item
          v-for="tenant in tenantList"
          :key="tenant.id"
          :command="tenant.id"
          :disabled="tenant.id === currentTenantId"
        >
          <div class="tenant-item">
            <span>{{ tenant.name }}</span>
            <el-icon v-if="tenant.id === currentTenantId" class="check-icon">
              <Check />
            </el-icon>
          </div>
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { ElMessage } from "element-plus";
import { OfficeBuilding, ArrowDown, Check } from "@element-plus/icons-vue";
import { useTenantStoreHook } from "@/store/modules/tenant-store";

/**
 * 租户切换器组件
 *
 * 功能：
 * - 显示当前租户名称
 * - 下拉列表展示所有可访问的租户
 * - 点击切换租户
 * - 切换后刷新页面以重新加载数据
 *
 * 使用条件：
 * - 需要在 .env 中设置 VITE_APP_TENANT_ENABLED=true
 * - 后端需要启用多租户功能
 * - 用户至少属于一个租户
 */

// 多租户开关
const TENANT_ENABLED = import.meta.env.VITE_APP_TENANT_ENABLED === "true";

const tenantStore = useTenantStoreHook();

// 当前租户ID
const currentTenantId = computed(() => tenantStore.currentTenantId);

// 当前租户名称
const currentTenantName = computed(() => {
  return tenantStore.currentTenant?.name || "未选择租户";
});

// 租户列表
const tenantList = computed(() => tenantStore.tenantList);

// 是否显示租户切换器（多租户开关启用 且 有租户列表）
const showTenantSelector = computed(() => {
  return TENANT_ENABLED && tenantList.value.length > 0;
});

/**
 * 切换租户
 */
const handleSwitchTenant = async (tenantId: number) => {
  if (tenantId === currentTenantId.value) {
    return;
  }

  try {
    await tenantStore.switchTenant(tenantId);
    ElMessage.success("切换租户成功");

    // 刷新页面以重新加载数据（确保所有数据都基于新租户）
    setTimeout(() => {
      window.location.reload();
    }, 500);
  } catch (error: any) {
    ElMessage.error(error?.msg || "切换租户失败");
  }
};
</script>

<style scoped lang="scss">
.tenant-selector {
  display: flex;
  align-items: center;
  height: 50px;
  padding: 0 15px;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.3s;

  &:hover {
    background-color: var(--el-fill-color-light);
  }

  .tenant-name {
    margin: 0 8px;
    font-size: 14px;
    font-weight: 500;
  }
}

.tenant-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-width: 150px;

  .check-icon {
    margin-left: 10px;
    color: var(--el-color-primary);
  }
}
</style>
