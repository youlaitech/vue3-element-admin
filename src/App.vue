<script setup lang="ts">
import { useAppStore } from "@/store/modules/app";

const appStore = useAppStore();
</script>

<template>
  <el-config-provider :locale="appStore.locale" :size="appStore.size">
    <router-view />
  </el-config-provider>
</template>
