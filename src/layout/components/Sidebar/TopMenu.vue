<script lang="ts" setup>
import { usePermissionStore } from "@/store/modules/permission";
import variables from "@/styles/variables.module.scss";
import { useAppStore } from "@/store/modules/app";
import { translateRouteTitle } from "@/utils/i18n";
import { useRouter } from "vue-router";
const appStore = useAppStore();
const activePath = computed(() => appStore.activeTopMenu);
const router = useRouter();
// 递归跳转
const goFirst = (menu: any[]) => {
  if (!menu.length) return;
  const [first] = menu;
  if (first.children) {
    goFirst(first.children);
  } else {
    router.push({
      name: first.name,
    });
  }
};
const selectMenu = (index: string) => {
  appStore.changeTopActive(index);
  permissionStore.getMixLeftMenu(index);
  const { mixLeftMenu } = permissionStore;
  goFirst(mixLeftMenu);
};
const permissionStore = usePermissionStore();
const topMenu = ref<any[]>([]);
onMounted(() => {
  topMenu.value = permissionStore.routes.filter(
    (item) => !item.meta || !item.meta.hidden
  );
});
</script>
<template>
  <el-scrollbar>
    <el-menu
      mode="horizontal"
      :default-active="activePath"
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
          <span v-if="route.path === '/'"> 首页 </span>
          <template v-else>
            <span v-if="route.meta && route.meta.title">
              {{ translateRouteTitle(route.meta.title) }}
            </span>
          </template>
        </template>
      </el-menu-item>
    </el-menu>
  </el-scrollbar>
</template>
<style lang="scss" scoped>
.el-menu {
  height: 50px !important;
}
</style>
