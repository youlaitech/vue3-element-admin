<template>
  <div class="wh-full flex-center flex-col login">
    <!-- 右侧切换主题、语言按钮 -->
    <div class="flex flex-col gap-4px fixed top-40px right-40px text-lg">
      <el-tooltip :content="t('login.themeToggle')" placement="left">
        <CommonWrapper>
          <DarkModeSwitch />
        </CommonWrapper>
      </el-tooltip>
      <el-tooltip :content="t('login.languageToggle')" placement="left">
        <CommonWrapper>
          <LangSelect size="text-20px" />
        </CommonWrapper>
      </el-tooltip>
    </div>
    <!-- 登录页主体 -->
    <div flex-1 flex-center>
      <div
        class="p-4xl h-full w-full sm:w-450px border-rd-10px sm:h-680px shadow-[var(--el-box-shadow-light)] backdrop-blur-3px"
      >
        <div w-full flex flex-col items-center>
          <!-- logo -->
          <el-image :src="logo" style="width: 84px" />

          <!-- 标题 -->
          <h2>
            <el-badge :value="`v ${defaultSettings.version}`" type="success">
              {{ defaultSettings.title }}
            </el-badge>
          </h2>

          <!-- 组件切换 -->
          <transition name="fade-slide" mode="out-in">
            <component :is="formComponents[component]" v-model="component" class="w-90%" />
          </transition>
        </div>
      </div>
      <!-- 登录页底部版权 -->
      <el-text size="small" class="py-2.5! fixed bottom-0 text-center">
        Copyright © 2021 - 2025 youlai.tech All Rights Reserved.
        <a href="http://beian.miit.gov.cn/" target="_blank">皖ICP备20006496号-2</a>
      </el-text>
    </div>
  </div>
</template>

<script setup lang="ts">
import logo from "@/assets/logo.png";
import defaultSettings from "@/settings";
import CommonWrapper from "@/components/CommonWrapper/index.vue";
import DarkModeSwitch from "@/components/DarkModeSwitch/index.vue";

type LayoutMap = "login" | "register" | "resetPwd";

const t = useI18n().t;

const component = ref<LayoutMap>("login"); // 切换显示的组件
const formComponents = {
  login: defineAsyncComponent(() => import("./components/Login.vue")),
  register: defineAsyncComponent(() => import("./components/Register.vue")),
  resetPwd: defineAsyncComponent(() => import("./components/ResetPwd.vue")),
};
</script>

<style lang="scss" scoped>
.login {
  background: url("@/assets/images/login-bg.svg");
  background-size: cover;
}

/* fade-slide */
.fade-slide-leave-active,
.fade-slide-enter-active {
  transition: all 0.3s;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
