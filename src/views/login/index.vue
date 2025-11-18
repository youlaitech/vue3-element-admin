<template>
  <div class="login-container">
    <!-- 右侧切换主题、语言按钮  -->
    <div class="login-toolbar">
      <el-tooltip :content="t('login.themeToggle')" placement="bottom">
        <CommonWrapper>
          <DarkModeSwitch />
        </CommonWrapper>
      </el-tooltip>
      <el-tooltip :content="t('login.languageToggle')" placement="bottom">
        <CommonWrapper>
          <LangSelect size="text-20px" />
        </CommonWrapper>
      </el-tooltip>
    </div>
    <!-- 登录页主体 -->
    <div class="login-content">
      <div class="login-card">
        <div class="login-card__inner">
          <!-- logo -->
          <el-image :src="logo" class="w-84px h-auto" />

          <!-- 标题 -->
          <h2 class="my-4">
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
      <footer class="login-footer">
        <el-text size="small">
          Copyright © 2021 - 2025 youlai.tech All Rights Reserved.
          <a href="http://beian.miit.gov.cn/" target="_blank">皖ICP备20006496号-2</a>
        </el-text>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import logo from "@/assets/logo.png";
import { defaultSettings } from "@/settings";
import CommonWrapper from "@/components/CommonWrapper/index.vue";
import DarkModeSwitch from "@/components/DarkModeSwitch/index.vue";

type LayoutMap = "login" | "register" | "resetPwd";

const { t } = useI18n();
const component = ref<LayoutMap>("login");

const formComponents = {
  login: defineAsyncComponent(() => import("./components/Login.vue")),
  register: defineAsyncComponent(() => import("./components/Register.vue")),
  resetPwd: defineAsyncComponent(() => import("./components/ResetPwd.vue")),
};

let notificationInstance: ReturnType<typeof ElNotification> | null = null;

const showVoteNotification = () => {
  notificationInstance = ElNotification({
    title: "⭐ Gitee 2025 开源评选 · 诚邀您的支持！ 🙏",
    message: `我正在参加 Gitee 2025 最受欢迎的开源软件投票活动，快来给我投票吧！<br/><a href="https://gitee.com/activity/2025opensource?ident=I6VXEH" target="_blank" style="color: var(--el-color-primary); text-decoration: none; font-weight: 500;">点击投票 →</a>`,
    type: "success",
    position: "bottom-right",
    duration: 0,
    dangerouslyUseHTMLString: true,
  });
};

onMounted(() => {
  setTimeout(showVoteNotification, 500);
});

onBeforeUnmount(() => {
  if (notificationInstance) {
    notificationInstance.close();
    notificationInstance = null;
  }
});
</script>

<style lang="scss" scoped>
$transition-duration: 0.3s;
$transition-offset: 30px;
.login-container {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;

  &::before {
    position: fixed;
    top: 0;
    left: 0;
    z-index: -1;
    width: 100%;
    height: 100%;
    content: "";
    background: url("@/assets/images/login-bg.svg") center center / cover;
  }
}

.login-toolbar {
  position: fixed;
  top: 10px;
  right: 10px;
  z-index: 10;
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: 1.125rem;

  @media (max-width: 480px) {
    right: auto;
    left: 10px;
  }

  @media (min-width: 640px) {
    top: 40px;
    right: 40px;
  }
}

.login-content {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
}

.login-card {
  width: 100%;
  height: auto;
  padding: 3rem;
  border-radius: 0.5rem;
  box-shadow: var(--el-box-shadow-light);

  @media (min-width: 640px) {
    width: 450px;
    height: 700px;
  }
}

.login-card__inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.login-footer {
  position: fixed;
  bottom: 0;
  padding: 0.625rem 0;
  text-align: center;
}

.fade-slide-leave-active,
.fade-slide-enter-active {
  transition: all $transition-duration;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(-$transition-offset);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX($transition-offset);
}
</style>
