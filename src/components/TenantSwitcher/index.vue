<template>
  <el-select
    v-if="tenantList.length > 0"
    v-model="currentTenantIdRef"
    placeholder="选择租户"
    style="width: 180px"
    @change="onChange"
  >
    <el-option v-for="item in tenantList" :key="item.id" :label="item.name" :value="item.id" />
  </el-select>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useTenantStoreHook } from "@/store/modules/tenant-store";

const emit = defineEmits<{
  (e: "change", tenantId: number): void;
}>();

const tenantStore = useTenantStoreHook();

const tenantList = computed(() => tenantStore.tenantList);

const currentTenantIdRef = computed<number | null>({
  get: () => tenantStore.currentTenantId,
  set: (val) => {
    tenantStore.currentTenantId = val;
  },
});

function onChange(tenantId: number) {
  emit("change", tenantId);
}
</script>
