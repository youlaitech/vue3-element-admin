<template>
  <el-config-provider :locale="appStore.locale" :size="appStore.size">
    <el-watermark content="vue3-element-admin" class="wh-full">
      <router-view />
    </el-watermark>
  </el-config-provider>
</template>

<script setup lang="ts">
import { useAppStore } from "@/store/modules/app";

const appStore = useAppStore();
</script>
