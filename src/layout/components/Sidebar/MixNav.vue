<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { RouterLink, useRoute, useRouter, RouteRecordRaw } from 'vue-router';
import {
  ElDropdown,
  ElDropdownItem,
  ElDropdownMenu,
  ElMenu,
  ElMessageBox,
  ElTooltip
} from 'element-plus';

import Screenfull from '@/components/Screenfull/index.vue';
import SizeSelect from '@/components/SizeSelect/index.vue';
import LangSelect from '@/components/LangSelect/index.vue';
import { CaretBottom } from '@element-plus/icons-vue';

import SidebarItem from './SidebarItem.vue';
import variables from '@/styles/variables.module.scss';

import { useTagsViewStore } from '@/store/modules/tagsView';
import { useUserStore } from '@/store/modules/user';
import { usePermissionStore } from '@/store/modules/permission';

const tagsViewStore = useTagsViewStore();
const userStore = useUserStore();
const permissionStore = usePermissionStore();

const route = useRoute();
const router = useRouter();
const routes = [] as any[];
onMounted(() => {
  console.log('origin routes', permissionStore.routes);
  permissionStore.routes.forEach(item => {
    const { children, ...newItem } = item;
    routes.push(newItem);
  });
  console.log('routes', routes);
});

const activeMenu = computed<string>(() => {
  const { meta, path } = route;
  if (meta?.activeMenu) {
    return meta.activeMenu as string;
  }
  return path;
});

function logout() {
  ElMessageBox.confirm('确定注销并退出系统吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    userStore
      .logout()
      .then(() => {
        tagsViewStore.delAllViews();
      })
      .then(() => {
        router.push(`/login?redirect=${route.fullPath}`);
      });
  });
}
</script>

<template>
  <div class="horizontal-header">
    <el-menu
      class="horizontal-header-menu"
      :default-active="activeMenu"
      :background-color="variables.menuBg"
      :text-color="variables.menuText"
      :active-text-color="variables.menuActiveText"
      mode="horizontal"
    >
      <sidebar-item
        v-for="route in routes"
        :item="route"
        :key="route.path"
        :base-path="route.path"
      />
    </el-menu>

    <div class="horizontal-header-right">
      <!--全屏 -->
      <screenfull id="screenfull" />

      <!-- 布局大小 -->
      <el-tooltip content="布局大小" effect="dark" placement="bottom">
        <size-select />
      </el-tooltip>

      <!--语言选择-->
      <lang-select />

      <el-dropdown trigger="click">
        <div class="flex justify-center items-center pr-[20px]">
          <img
            :src="userStore.avatar + '?imageView2/1/w/80/h/80'"
            class="w-[40px] h-[40px] rounded-lg"
          />
          <CaretBottom class="w-3 h-3" />
        </div>

        <template #dropdown>
          <el-dropdown-menu>
            <router-link to="/">
              <el-dropdown-item>{{ $t('navbar.dashboard') }}</el-dropdown-item>
            </router-link>
            <a target="_blank" href="https://github.com/hxrui">
              <el-dropdown-item>Github</el-dropdown-item>
            </a>
            <a target="_blank" href="https://gitee.com/haoxr">
              <el-dropdown-item>{{ $t('navbar.gitee') }}</el-dropdown-item>
            </a>
            <a target="_blank" href="https://www.cnblogs.com/haoxianrui/">
              <el-dropdown-item>{{ $t('navbar.document') }}</el-dropdown-item>
            </a>
            <el-dropdown-item divided @click="logout">
              {{ $t('navbar.logout') }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.horizontal-header {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-around;
  background: #001529;

  &-menu {
    height: 100%;
    width: 100%;
    border: none;
    background-color: transparent;
  }

  &-right {
    display: flex;
    min-width: 340px;
    align-items: center;
    justify-content: flex-end;
    color: #fff;
  }
}
</style>
