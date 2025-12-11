<template>
  <el-dropdown trigger="click" @command="handleTenantSwitch">
    <div class="tenant-select">
      <el-icon class="tenant-select__icon"><OfficeBuilding /></el-icon>
      <span class="tenant-select__name">{{ currentTenantName }}</span>
      <el-icon class="tenant-select__arrow"><ArrowDown /></el-icon>
    </div>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item
          v-for="tenant in tenantList"
          :key="tenant.id"
          :command="tenant.id"
          :class="{ 'is-active': tenant.id === currentTenantId }"
        >
          <div class="tenant-item">
            <span class="tenant-item__name">{{ tenant.name }}</span>
            <el-icon v-if="tenant.id === currentTenantId" class="tenant-item__check">
              <Check />
            </el-icon>
          </div>
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useTenantStoreHook } from "@/store/modules/tenant-store";
import { ElMessage } from "element-plus";
import { OfficeBuilding, ArrowDown, Check } from "@element-plus/icons-vue";

const tenantStore = useTenantStoreHook();

// 当前租户名称
const currentTenantName = computed(() => {
  return tenantStore.currentTenant?.name || "未选择租户";
});

// 当前租户ID
const currentTenantId = computed(() => tenantStore.currentTenantId);

// 租户列表
const tenantList = computed(() => tenantStore.tenantList);

/**
 * 切换租户
 */
async function handleTenantSwitch(tenantId: number) {
  if (tenantId === currentTenantId.value) {
    return;
  }

  try {
    await tenantStore.switchTenant(tenantId);
    ElMessage.success("切换租户成功");
    // 刷新页面以重新加载菜单和权限
    window.location.reload();
  } catch (error: any) {
    ElMessage.error(error.message || "切换租户失败");
  }
}

// 初始化：获取租户列表
onMounted(() => {
  tenantStore.fetchTenantList().catch((error) => {
    console.error("获取租户列表失败:", error);
  });
});
</script>

<style lang="scss" scoped>
.tenant-select {
  display: flex;
  align-items: center;
  padding: 0 12px;
  cursor: pointer;
  transition: all 0.3s;

  &__icon {
    margin-right: 6px;
    font-size: 18px;
    color: var(--el-text-color-regular);
  }

  &__name {
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 14px;
    color: var(--el-text-color-regular);
    white-space: nowrap;
  }

  &__arrow {
    margin-left: 6px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
    transition: transform 0.3s;
  }

  &:hover {
    background: rgba(0, 0, 0, 0.04);

    .tenant-select__icon,
    .tenant-select__name {
      color: var(--el-color-primary);
    }
  }
}

.tenant-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;

  &__name {
    flex: 1;
  }

  &__check {
    margin-left: 8px;
    color: var(--el-color-primary);
  }
}

:deep(.el-dropdown-menu__item.is-active) {
  background-color: var(--el-color-primary-light-9);
}
</style>
