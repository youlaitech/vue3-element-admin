<script lang="ts" setup>
import { usePermissionStore } from "@/store/modules/permission";
import variables from "@/styles/variables.module.scss";
import { useAppStore } from "@/store/modules/app";
import { translateRouteTitleI18n } from "@/utils/i18n";
const appStore = useAppStore();
const tPath = ref();
const selectMenu = (index: string) => {
  appStore.changeTopActive(index);
};
const permissionStore = usePermissionStore();
const topMenu = ref<any[]>([]);
onMounted(() => {
  topMenu.value = permissionStore.routes.filter((el) => !el.meta?.hidden);
});
</script>
<template>
  <el-scrollbar>
    <el-menu
      mode="horizontal"
      class="el-menu-demo"
      :default-active="tPath"
      :background-color="variables.menuBg"
      :text-color="variables.menuText"
      :active-text-color="variables.menuActiveText"
      @select="selectMenu"
    >
      <el-menu-item
        v-for="route in topMenu"
        :key="route.path"
        :index="route.path"
      >
        <template #title>
          <svg-icon
            v-if="route.meta && route.meta.icon"
            :icon-class="route.meta.icon"
          />
          <span v-if="route.meta && route.meta.title">{{
            translateRouteTitleI18n(route.meta.title)
          }}</span>
        </template>
      </el-menu-item>
      <!-- <sidebar-item
        v-for="route in topMenu"
        :key="route.path"
        :item="route"
        :base-path="route.path"
        :is-collapse="false"
      /> -->
    </el-menu>
  </el-scrollbar>
</template>
