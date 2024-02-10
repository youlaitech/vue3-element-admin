<!-- 混合布局菜单(top) -->
<template>
  <el-scrollbar>
    <el-menu
      mode="horizontal"
      :default-active="activePath"
      :background-color="variables['menu-background']"
      :text-color="variables['menu-text']"
      :active-text-color="variables['menu-active-text']"
      @select="handleMenuSelect"
    >
      <el-menu-item
        v-for="route in mixTopMenus"
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
            <span v-if="route.meta && route.meta.title" class="ml-1">
              {{ translateRouteTitle(route.meta.title) }}
            </span>
          </template>
        </template>
      </el-menu-item>
    </el-menu>
  </el-scrollbar>
</template>

<script lang="ts" setup>
import { usePermissionStore, useAppStore } from "@/store";
import { translateRouteTitle } from "@/utils/i18n";
import variables from "@/styles/variables.module.scss";
import { RouteRecordRaw } from "vue-router";

const appStore = useAppStore();
const permissionStore = usePermissionStore();
const router = useRouter();

const activePath = computed(() => appStore.activeTopMenuPath);

// 顶部菜单集合
const mixTopMenus = ref<RouteRecordRaw[]>([]);

/**
 * 菜单选择事件
 */
const handleMenuSelect = (routePath: string) => {
  appStore.activeTopMenu(routePath);
  permissionStore.setMixLeftMenus(routePath);
  // 获取左侧菜单集合，默认跳转到第一个菜单
  const mixLeftMenus = permissionStore.mixLeftMenus;
  goToFirstMenu(mixLeftMenus);
};

/**
 * 默认跳转到左侧第一个菜单
 */
const goToFirstMenu = (menus: RouteRecordRaw[]) => {
  if (menus.length === 0) return;

  const [first] = menus;

  if (first.children && first.children.length > 0) {
    goToFirstMenu(first.children as RouteRecordRaw[]);
  } else if (first.name) {
    router.push({
      name: first.name,
    });
  }
};

// 初始化顶部菜单
onMounted(() => {
  mixTopMenus.value = permissionStore.routes.filter(
    (item) => !item.meta || !item.meta.hidden
  );
});
</script>
