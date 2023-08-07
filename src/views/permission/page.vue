<template>
  <div class="app-container">
    <switch-roles @change="handleRolesChange" />
  </div>
</template>

<script setup lang="ts">
import router from "@/router";
import SwitchRoles from "./components/SwitchRoles.vue";

defineOptions({
  // eslint-disable-next-line
  name: "PagePermission",
  inheritAttrs: false,
});

function handleRolesChange() {
  console.log("roles changed");
  router.push({ path: "/permission/page?" + new Date() });
}
</script>
