<template>
  <router-view>
    <template #default="{ Component, route }">
      <transition enter-active-class="animate__animated animate__fadeIn" mode="out-in">
        <keep-alive :include="tagsViewStore.cachedViews">
          <component :is="Component" :key="route.path" />
        </keep-alive>
      </transition>
    </template>
  </router-view>
</template>
<script setup lang="ts">
defineOptions({ name: "KeepCache" });

import { useTagsViewStore } from "@/store";

const tagsViewStore = useTagsViewStore();
</script>
