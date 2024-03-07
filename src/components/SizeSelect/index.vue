<template>
  <el-dropdown trigger="click" @command="handleSizeChange">
    <div>
      <svg-icon icon-class="size" />
    </div>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item
          v-for="item of sizeOptions"
          :key="item.value"
          :disabled="appStore.size == item.value"
          :command="item.value"
        >
          {{ item.label }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
import { useAppStore } from "@/store/modules/app";

const { t } = useI18n();
const sizeOptions = computed(() => {
  return [
    { label: t("sizeSelect.default"), value: "default" },
    { label: t("sizeSelect.large"), value: "large" },
    { label: t("sizeSelect.small"), value: "small" },
  ];
});

const appStore = useAppStore();
function handleSizeChange(size: string) {
  appStore.changeSize(size);
  ElMessage.success(t("sizeSelect.message.success"));
}
</script>
