<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useRoute, useRouter } from 'vue-router';
import { useAppStore } from '@/store/modules/app';
import { useTagsViewStore } from '@/store/modules/tagsView';
import { useUserStore } from '@/store/modules/user';
import { useSettingsStore } from '@/store/modules/settings';

const appStore = useAppStore();
const tagsViewStore = useTagsViewStore();
const userStore = useUserStore();
const settingsStore = useSettingsStore();

const route = useRoute();
const router = useRouter();

const { device } = storeToRefs(appStore); // 设备类型：desktop-宽屏设备 || mobile-窄屏设备
const { layout } = storeToRefs(settingsStore); // 布局模式：left-左侧模式||top-顶部模式||mix-混合模式

function toggleSideBar() {
  appStore.toggleSidebar(true);
}

// 注销
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
  <div class="navbar">
    <div
      class="flex justify-start"
      v-if="device === 'mobile' || layout === 'left'"
    >
      <hamburger
        :is-active="appStore.sidebar.opened"
        @toggleClick="toggleSideBar"
      />
      <!-- 面包屑导航栏 -->
      <breadcrumb />
    </div>

    <mix-nav v-if="device !== 'mobile' && layout === 'mix'" />

    <!-- 宽屏或左侧模式显示 -->
    <div
      v-if="device === 'desktop' || layout === 'left'"
      class="flex justify-start"
    >
      <!-- 左侧窄屏不显示 -->
      <div v-if="device !== 'mobile'" class="flex justify-center items-center">
        <i-ep-add-location />
        <i-ep-aim />
        <div i-ep-check />

        <el-button>
          <template #icon><i-ep-circle-check-filled /></template>
          Hello world
        </el-button>

        <!--全屏 -->
        <screenfull id="screenfull" />

        <!-- 布局大小 -->
        <el-tooltip content="布局大小" effect="dark" placement="bottom">
          <size-select />
        </el-tooltip>

        <!--语言选择-->
        <lang-select />
      </div>
      <!-- 头像 -->
      <el-dropdown trigger="click">
        <div class="flex justify-center items-center pr-[20px]">
          <img
            :src="userStore.avatar + '?imageView2/1/w/80/h/80'"
            class="w-[40px] h-[40px] rounded-lg"
          />
          <i-ep-caret-bottom class="w-3 h-3" />
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
.navbar {
  background-color: #fff;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 0 1px #0003;
}
</style>
