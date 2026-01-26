<template>
  <el-dropdown
    v-if="tenantList.length > 0"
    class="tenant-switcher"
    trigger="click"
    :hide-on-click="true"
    @command="onCommand"
  >
    <div class="tenant-switcher__trigger">
      <span class="tenant-switcher__label">{{ currentTenantName }}</span>
      <el-icon class="tenant-switcher__icon"><ArrowDown /></el-icon>
    </div>
    <template #dropdown>
      <el-dropdown-menu class="tenant-switcher__menu">
        <el-dropdown-item
          v-for="item in tenantList"
          :key="item.id"
          :command="item.id"
          :class="{ 'is-active': item.id === currentTenantId }"
        >
          {{ item.name }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { ArrowDown } from "@element-plus/icons-vue";
import { useTenantStoreHook } from "@/store/modules/tenant";

const emit = defineEmits<{
  (e: "change", tenantId: number): void;
}>();

const tenantStore = useTenantStoreHook();

const tenantList = computed(() => tenantStore.tenantList);

const currentTenantId = computed<number | null>({
  get: () => tenantStore.currentTenantId,
  set: (val) => {
    tenantStore.currentTenantId = val;
  },
});

const currentTenantName = computed(() => {
  const currentId = currentTenantId.value;
  const fromList = tenantList.value.find((t) => t.id === currentId)?.name;
  return fromList || tenantStore.currentTenant?.name || "切换租户";
});

function onCommand(tenantId: number) {
  if (tenantId === currentTenantId.value) {
    return;
  }
  emit("change", tenantId);
}
</script>

<style scoped lang="scss">
.tenant-switcher {
  display: flex;
  align-items: center;
  height: 100%;

  &__trigger {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 32px;
    padding: 0 10px;
    cursor: pointer;
    user-select: none;
    border-radius: 8px;
    transition: background 0.2s;
  }

  &__label {
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 13px;
    line-height: 1;
    white-space: nowrap;
  }

  &__icon {
    margin-left: 6px;
    font-size: 12px;
    opacity: 0.8;
  }

  &:hover {
    .tenant-switcher__trigger {
      background: rgba(0, 0, 0, 0.04);
    }
  }

  :deep(.el-dropdown-menu__item.is-active) {
    font-weight: 600;
    color: var(--el-color-primary);
  }
}
</style>
