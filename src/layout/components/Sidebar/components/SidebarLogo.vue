<template>
  <div class="logo-container">
    <transition name="logo-transition">
      <router-link v-if="collapse" class="wh-full flex-center" to="/">
        <img v-if="settingsStore.sidebarLogo" :src="logo" class="logo-image" />
      </router-link>

      <router-link v-else class="wh-full flex-center" to="/">
        <img v-if="settingsStore.sidebarLogo" :src="logo" class="logo-image" />
        <span class="logo-title"> {{ defaultSettings.title }}</span>
      </router-link>
    </transition>
  </div>
</template>

<script lang="ts" setup>
import defaultSettings from "@/settings";
import { useSettingsStore } from "@/store";

const settingsStore = useSettingsStore();

defineProps({
  collapse: {
    type: Boolean,
    required: true,
  },
});

const logo = ref(new URL(`../../../../assets/logo.png`, import.meta.url).href);
</script>

<style lang="scss" scoped>
.logo-container {
  width: 100%;
  height: $navbar-height;
  background-color: $sidebar-logo-background;

  .logo-image {
    width: 20px;
    height: 20px;
  }

  .logo-title {
    margin-left: 10px;
    font-size: 14px;
    font-weight: bold;
    color: white;
  }
}

.layout-top,
.layout-mix {
  .logo-container {
    width: $sidebar-width;
  }

  &.hideSidebar {
    .logo-container {
      width: $sidebar-width-collapsed;
    }
  }
}
</style>
