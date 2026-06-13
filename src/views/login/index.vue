<template>
  <div class="login-page">
    <div class="login-toolbar">
      <ThemeSwitch />
      <LangSelect size="text-18px" />
    </div>

    <div class="login-layout">
      <div class="login-brand animate__animated animate__fadeInLeft">
        <div class="login-brand__header">
          <el-image :src="logo" class="login-brand__logo" />
          <span class="login-brand__name">{{ appConfig.title }}</span>
        </div>

        <div class="login-brand__hero">
          <p class="login-brand__label">DESIGNED BY YOU LAI TEAM</p>
          <h1 class="login-brand__title">欢迎使用 vue3-element-admin</h1>
          <p class="login-brand__desc">面向企业级后台管理系统，让开发更高效，让业务更卓越</p>
        </div>
      </div>

      <div class="login-card animate__animated animate__fadeInRight">
        <div class="login-card__inner">
          <transition name="fade-slide" mode="out-in">
            <div v-if="component === 'login'" key="login" class="login-card__form">
              <h2 class="login-card__title">欢迎回来</h2>
              <p class="login-card__desc">请输入账号和密码登录系统</p>

              <el-form
                ref="loginFormRef"
                :model="loginFormData"
                :rules="loginRules"
                size="large"
                :validate-on-rule-change="false"
              >
                <el-form-item prop="username">
                  <el-input
                    v-model.trim="loginFormData.username"
                    placeholder="用户名"
                    :prefix-icon="UserIcon"
                  />
                </el-form-item>

                <el-tooltip :visible="isCapsLock" content="大写锁定已开启" placement="right">
                  <el-form-item prop="password">
                    <el-input
                      v-model.trim="loginFormData.password"
                      placeholder="密码"
                      type="password"
                      show-password
                      :prefix-icon="LockIcon"
                      @keyup="checkCapsLock"
                      @keyup.enter="handleLoginSubmit"
                    />
                  </el-form-item>
                </el-tooltip>

                <el-form-item prop="captchaCode">
                  <div class="captcha-row">
                    <el-input
                      v-model.trim="loginFormData.captchaCode"
                      placeholder="验证码"
                      class="captcha-row__input"
                      @keyup.enter="handleLoginSubmit"
                    >
                      <template #prefix>
                        <span class="input-prefix-icon" v-html="ShieldIcon" />
                      </template>
                    </el-input>
                    <div class="captcha-img" @click="getCaptcha">
                      <el-icon v-if="codeLoading" class="is-loading" :size="16">
                        <Loading />
                      </el-icon>
                      <img v-else-if="captchaBase64" :src="captchaBase64" alt="验证码" />
                      <el-icon v-else :size="16"><Refresh /></el-icon>
                    </div>
                  </div>
                </el-form-item>

                <div class="login-options">
                  <el-checkbox v-model="loginFormData.rememberMe">记住我</el-checkbox>
                  <a class="login-options__link" @click="showForm('resetPwd')">忘记密码？</a>
                </div>

                <el-button
                  :loading="loading"
                  type="primary"
                  size="large"
                  class="login-btn"
                  @click="handleLoginSubmit"
                >
                  登录
                </el-button>
              </el-form>

              <div class="login-alt">
                <div class="login-alt__divider">其他登录方式</div>
                <div class="login-alt__buttons">
                  <button class="login-alt__btn">
                    <span class="i-svg:qr-code" />
                    扫码登录
                  </button>
                  <button class="login-alt__btn">
                    <span class="i-svg:sso" />
                    统一认证
                  </button>
                </div>
              </div>
            </div>

            <ResetPwd
              v-else
              key="resetPwd"
              class="login-card__form"
              @update:model-value="component = $event"
            />
          </transition>
        </div>

        <div class="login-footer">Copyright © 2021-2026 youlai.tech</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: "LoginPage", inheritAttrs: false });

import { User, Lock, Loading, Refresh } from "@element-plus/icons-vue";
import type { FormInstance } from "element-plus";
import AuthAPI from "@/api/auth";
import type { LoginRequest } from "@/api/auth";
import router from "@/router";
import { useUserStore } from "@/stores";
import { AuthStorage } from "@/utils/auth";
import { appConfig } from "@/settings";
import ThemeSwitch from "@/components/ThemeSwitch/index.vue";
import ResetPwd from "./components/ResetPwd.vue";
import ShieldIcon from "@/assets/icons/shield.svg?raw";
import logo from "@/assets/images/logo.png";

const userStore = useUserStore();
const route = useRoute();
const component = ref<"login" | "resetPwd">("login");

const loginFormRef = ref<FormInstance>();
const loading = ref(false);
const isCapsLock = ref(false);
const captchaBase64 = ref<string>();
const codeLoading = ref(false);

const UserIcon = markRaw(User);
const LockIcon = markRaw(Lock);

const loginFormData = ref<LoginRequest>({
  username: "admin",
  password: "123456",
  captchaId: "",
  captchaCode: "",
  rememberMe: AuthStorage.getRememberMe(),
});

const loginRules = computed(() => ({
  username: [{ required: true, trigger: "blur", message: "请输入用户名" }],
  password: [
    { required: true, trigger: "blur", message: "请输入密码" },
    { min: 6, message: "密码不能少于6位", trigger: "blur" },
  ],
  captchaCode: [{ required: true, trigger: "blur", message: "请输入验证码" }],
}));

function getCaptcha() {
  codeLoading.value = true;
  AuthAPI.getCaptcha()
    .then((d) => {
      loginFormData.value.captchaId = d.captchaId;
      captchaBase64.value = d.captchaBase64;
    })
    .finally(() => (codeLoading.value = false));
}

async function handleLoginSubmit() {
  const valid = await loginFormRef.value?.validate().then(
    () => true,
    () => false
  );
  if (!valid) return;

  loading.value = true;
  try {
    await userStore.login(loginFormData.value).then(
      async () => {
        const redirectPath = (route.query.redirect as string) || "/";
        await router.push(decodeURIComponent(redirectPath));
      },
      () => getCaptcha()
    );
  } finally {
    loading.value = false;
  }
}

function checkCapsLock(event: KeyboardEvent) {
  if (event instanceof KeyboardEvent) {
    isCapsLock.value = event.getModifierState("CapsLock");
  }
}

function showForm(type: "resetPwd") {
  component.value = type;
}

onMounted(() => getCaptcha());
</script>

<style lang="scss" scoped>
$primary: #5d87ff;
$bg: #f8fafc;
$text-primary: #273248;
$text-secondary: #6b7280;
$text-muted: #9ca3af;
$input-h: 44px;

.login-page {
  position: relative;
  display: flex;
  min-height: 100vh;
  overflow: auto;
  background: $bg;
}

/* ---- 工具栏 ---- */

.login-toolbar {
  position: fixed;
  top: 28px;
  right: 32px;
  z-index: 10;
  display: flex;
  gap: 12px;
  align-items: center;

  :deep(*) {
    cursor: pointer;
  }
}

/* ---- 布局 ---- */

.login-layout {
  display: flex;
  flex: 1;
  min-height: 100%;
}

/* ---- 左侧品牌区 65% ---- */

.login-brand {
  position: relative;
  display: flex;
  flex: 0 0 65%;
  flex-direction: column;
  padding: 20px 0 0 32px;
  overflow: hidden;
  background: $bg;

  &::before {
    position: absolute;
    inset: 0;
    content: "";
    background:
      linear-gradient(rgb(0 0 0 / 1.5%) 1px, transparent 1px),
      linear-gradient(90deg, rgb(0 0 0 / 1.5%) 1px, transparent 1px);
    background-size: 48px 48px;
  }

  &::after {
    position: absolute;
    bottom: -200px;
    left: -100px;
    width: 500px;
    height: 500px;
    content: "";
    background: radial-gradient(rgba(96, 192, 252, 0.12), transparent 70%);
    filter: blur(50px);
  }

  &__header {
    position: relative;
    z-index: 1;
    display: flex;
    gap: 10px;
    align-items: center;
  }

  &__logo {
    width: 36px;
    height: 36px;
  }

  &__name {
    font-size: 22px;
    font-weight: 500;
  }

  &__hero {
    position: relative;
    z-index: 1;
    margin-top: auto;
    margin-bottom: auto;
  }

  &__label {
    margin: 0;
    font-size: 14px;
    font-weight: 700;
    color: $primary;
    letter-spacing: 3px;
  }

  &__title {
    margin: 16px 0 0;
    font-size: 60px;
    font-weight: 750;
    line-height: 1.2;
    color: $text-primary;
    letter-spacing: -0.04em;
  }

  &__desc {
    max-width: 600px;
    margin: 24px 0 0;
    font-size: 20px;
    line-height: 1.9;
    color: $text-secondary;
  }
}

/* ---- 右侧登录区 35% ---- */

.login-card {
  position: relative;
  z-index: 1;
  display: flex;
  flex: 0 0 35%;
  flex-direction: column;
  align-items: center;
  padding: 0 0 32px;
  background: #fff;

  &__inner {
    box-sizing: border-box;
    display: flex;
    flex: 1;
    flex-direction: column;
    justify-content: center;
    width: 100%;
    max-width: 430px;
    padding: 0 20px;
  }

  &__form {
    width: 100%;
  }

  &__title {
    margin: 0 0 4px;
    font-size: 34px;
    font-weight: 750;
    line-height: 1.1;
    color: $text-primary;
    letter-spacing: -0.03em;
  }

  &__desc {
    margin: 8px 0 24px;
    font-size: 14px;
    color: $text-muted;
  }
}

/* ---- 输入框 ---- */

::deep(.el-form-item) {
  margin-bottom: 14px;
}

::deep(.el-input__wrapper) {
  height: $input-h;
}

.input-prefix-icon {
  display: inline-flex;
  width: 14px;
  height: 14px;
  color: var(--el-text-color-placeholder);

  :deep(svg) {
    width: 14px;
    height: 14px;
    fill: currentColor;
  }
}

/* ---- 验证码行 ---- */

.captcha-row {
  display: flex;
  gap: 12px;
  width: 100%;
}

.captcha-row__input {
  flex: 1;
  min-width: 0;
}

.captcha-img {
  box-sizing: border-box;
  flex-shrink: 0;
  width: 108px;
  height: 40px;
  overflow: hidden;
  cursor: pointer;
  background: var(--el-fill-color-blank);
  border: 1px solid var(--el-border-color);
  border-radius: var(--el-border-radius-base);
  transition: border-color 0.2s;

  &:hover {
    border-color: var(--el-color-primary);
  }

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
}

/* ---- 选项行 ---- */

.login-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 22px;
  font-size: 14px;
  color: $text-secondary;

  &__link {
    font-weight: 500;
    color: $primary;
    cursor: pointer;
    transition: opacity 0.15s;

    &:hover {
      opacity: 0.8;
    }
  }
}

/* ---- 主按钮 ---- */

.login-btn {
  width: 100%;
  height: 44px;
  font-size: 15px;
  font-weight: 600;
  border-radius: 8px;
  box-shadow: none;

  &:hover {
    box-shadow: none;
  }

  &:focus,
  &:focus-visible {
    outline: none;
    box-shadow: none;
  }

  &:active {
    box-shadow: none;
  }
}

/* ---- 其他登录 ---- */

.login-alt {
  margin-top: 28px;

  &__divider {
    display: flex;
    gap: 12px;
    align-items: center;
    margin-bottom: 14px;
    font-size: 13px;
    color: $text-muted;

    &::before,
    &::after {
      flex: 1;
      height: 1px;
      content: "";
      background: var(--el-border-color-lighter);
    }
  }

  &__buttons {
    display: flex;
    gap: 12px;
  }

  &__btn {
    display: flex;
    flex: 1;
    gap: 8px;
    align-items: center;
    justify-content: center;
    height: 44px;
    padding: 0;
    font-size: 13px;
    color: $text-secondary;
    cursor: pointer;
    background: transparent;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 8px;
    transition:
      background 0.2s,
      border-color 0.2s;

    &:hover {
      background: var(--el-fill-color-light);
      border-color: var(--el-border-color);
    }

    span {
      font-size: 16px;
    }
  }
}

/* ---- 版权 ---- */

.login-footer {
  flex-shrink: 0;
  font-size: 12px;
  color: $text-muted;
}

/* ---- 暗黑模式 ---- */

.dark .login-page {
  background: #0a0a0b;
}

.dark .login-brand {
  background: #0a0a0b;

  &::before {
    background:
      linear-gradient(rgb(255 255 255 / 1%) 1px, transparent 1px),
      linear-gradient(90deg, rgb(255 255 255 / 1%) 1px, transparent 1px);
    background-size: 48px 48px;
  }

  &__name {
    color: rgb(255 255 255 / 80%);
  }

  &__title {
    color: rgb(255 255 255 / 85%);
  }

  &__desc {
    color: rgb(255 255 255 / 40%);
  }
}

.dark .login-card {
  background: #0a0a0b;

  &__title {
    color: rgb(255 255 255 / 85%);
  }

  &__desc {
    color: rgb(255 255 255 / 30%);
  }
}

.dark .login-footer {
  color: rgb(255 255 255 / 15%);
}

.dark .login-alt__divider {
  color: rgb(255 255 255 / 20%);
}

/* ---- 动画 ---- */

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.2s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(6px);
}

/* ---- 响应式 ---- */

@media (max-width: 1024px) {
  .login-layout {
    flex-direction: column;
  }

  .login-toolbar {
    position: absolute;
    top: 37px;
  }

  .login-brand {
    flex: none;
    height: auto;
    padding: 28px 0 0 40px;
    background: #fff;

    &::before {
      display: none;
    }

    &::after {
      display: none;
    }

    &__hero {
      display: none;
    }
  }

  .login-card {
    flex: 1;
    justify-content: flex-start;
    padding: 96px 48px 0;
  }

  .login-footer {
    flex-shrink: 0;
  }
}

@media (max-width: 640px) {
  .login-toolbar {
    top: 33px;
    right: 20px;
  }

  .login-brand {
    padding: 24px 0 0 24px;
  }

  .login-card {
    padding: 72px 24px 0;

    &__inner {
      width: 100%;
      padding: 0;
    }
  }
}
</style>
