<template>
  <div class="login-page">
    <div class="login-toolbar">
      <ThemeSwitcher />
      <LangSelect size="text-18px" />
    </div>

    <div class="login-layout">
      <div class="login-brand">
        <div class="login-brand__header">
          <el-image :src="logo" class="login-brand__logo" />
          <div class="login-brand__identity">
            <span class="login-brand__name">{{ appConfig.title }}</span>
            <span class="login-brand__version">v{{ appConfig.version }}</span>
          </div>
        </div>

        <div class="login-brand__hero">
          <div class="login-brand__main">
            <el-tag class="login-brand__tag" type="primary" effect="plain" round>
              <span class="login-brand__tag-dot" />
              Enterprise Ready
            </el-tag>
            <h1 class="login-brand__title">开箱即用的企业级中后台解决方案</h1>
          </div>
          <div class="login-brand__features">
            <div class="login-brand__feature">
              <span class="login-brand__feature-mark">
                <span class="login-brand__feature-icon i-svg:security" />
              </span>
              <span class="login-brand__feature-text">安全可靠</span>
            </div>
            <div class="login-brand__feature">
              <span class="login-brand__feature-mark">
                <el-icon class="login-brand__feature-icon"><Clock /></el-icon>
              </span>
              <span class="login-brand__feature-text">高效稳定</span>
            </div>
            <div class="login-brand__feature">
              <span class="login-brand__feature-mark">
                <span class="login-brand__feature-icon i-svg:flexible" />
              </span>
              <span class="login-brand__feature-text">灵活扩展</span>
            </div>
          </div>
        </div>
      </div>

      <div class="login-card">
        <div class="login-card__inner">
          <transition name="fade-slide" mode="out-in">
            <QrCodeLogin
              v-if="component === 'qrcode'"
              key="qrcode"
              class="login-card__form"
              @switch="component = 'login'"
            />

            <div v-else-if="component === 'login'" key="login" class="login-card__form">
              <h2 class="login-card__title">欢迎回来</h2>
              <p class="login-card__desc">请完成身份验证后进入系统</p>

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
                        <span class="input-prefix-icon i-svg:security" />
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

              <div class="login-demo">
                <div class="login-demo__title">工作流演示账号 · 密码统一 123456，点击直接填入</div>
                <div class="login-demo__accounts">
                  <button
                    v-for="account in demoAccounts"
                    :key="account.username"
                    type="button"
                    class="login-demo__chip"
                    @click="fillDemoAccount(account)"
                  >
                    {{ account.label }}
                  </button>
                </div>
              </div>

              <div class="login-alt">
                <div class="login-alt__divider">其他登录方式</div>
                <div class="login-alt__buttons">
                  <button class="login-alt__btn" @click="component = 'qrcode'">
                    <span class="login-alt__icon i-svg:scan" />
                    扫码登录
                  </button>
                  <button class="login-alt__btn">
                    <span class="login-alt__icon i-svg:security" />
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

import { Clock, Lock, Loading, Refresh, User } from "@element-plus/icons-vue";
import type { FormInstance } from "element-plus";
import AuthAPI from "@/api/auth";
import type { LoginRequest } from "@/api/auth";
import router from "@/router";
import { useUserStore } from "@/stores";
import { AuthStorage } from "@/utils/auth";
import { appConfig } from "@/settings";
import ResetPwd from "./components/ResetPwd.vue";
import QrCodeLogin from "./components/QrCodeLogin.vue";
import logo from "@/assets/images/logo.png";

const userStore = useUserStore();
const route = useRoute();
const component = ref<"login" | "resetPwd" | "qrcode">("login");

const loginFormRef = ref<FormInstance>();
const loading = ref(false);
const isCapsLock = ref(false);
const captchaBase64 = ref<string>();
const codeLoading = ref(false);

const UserIcon = markRaw(User);
const LockIcon = markRaw(Lock);

const loginFormData = ref<LoginRequest>({
  username: "youlai",
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

/** 工作流演示账号（与 workflow.sql 预置数据一致，点击填入登录表单） */
const demoAccounts = [
  { username: "employee", label: "员工·发起" },
  { username: "dept_manager", label: "部门主管·审批" },
  { username: "manager", label: "总经理" },
  { username: "finance", label: "财务" },
  { username: "clerk", label: "行政" },
];

/**
 * 点击演示账号填入账号密码（验证码仍需手动输入）
 */
function fillDemoAccount(account: { username: string }): void {
  loginFormData.value.username = account.username;
  loginFormData.value.password = "123456";
}

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
$primary: #165dff;
$text-primary: #273248;
$text-secondary: #667085;
$text-muted: #98a2b3;
$input-h: 44px;

.login-page {
  position: relative;
  display: flex;
  min-height: 100vh;
  overflow: auto;
  /* 浅色渐变底色；桌面端被品牌区背景图与白色卡片完全覆盖，窄屏两区透明后透出 */
  background: linear-gradient(180deg, #ffffff 0%, #dbeafe 100%);
}

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

.login-layout {
  display: flex;
  flex: 1;
  min-height: 100%;
}

.login-brand {
  position: relative;
  display: flex;
  flex: 0 0 65%;
  flex-direction: column;
  min-height: 100vh;
  padding: 28px 64px 48px;
  overflow: hidden;
  background: url("@/assets/images/login/bg.svg") center / cover no-repeat;
  animation: login-pane-in 0.36s ease-out both;

  &__header,
  &__hero {
    position: relative;
    z-index: 1;
  }

  &__header {
    display: flex;
    gap: 14px;
    align-items: center;
  }

  &__logo {
    box-sizing: border-box;
    width: 42px;
    height: 42px;
    padding: 5px;
    background: rgb(37 99 235 / 8%);
    border: 1px solid rgb(37 99 235 / 18%);
    border-radius: 12px;
  }

  &__identity {
    display: inline-flex;
    gap: 10px;
    align-items: center;
    min-width: 0;
  }

  &__name {
    font-size: 24px;
    font-weight: 600;
    line-height: 1;
    color: #1e3a8a;
  }

  &__version {
    display: inline-flex;
    align-items: center;
    height: 22px;
    padding: 0 8px;
    font-size: 12px;
    font-weight: 600;
    line-height: 1;
    color: rgb(30 58 138 / 80%);
    background: rgb(37 99 235 / 8%);
    border: 1px solid rgb(37 99 235 / 16%);
    border-radius: 999px;
  }

  &__hero {
    display: flex;
    flex: 1;
    flex-direction: column;
    justify-content: center;
    width: min(760px, 100%);
    padding: 40px 0 60px;
  }

  &__main {
    width: 100%;
  }

  &__tag {
    gap: 8px;
    height: 32px;
    padding: 0 15px 0 13px;
    margin-bottom: 20px;
    font-size: 12px;
    font-weight: 700;
    color: #1d4ed8;
    background: rgb(37 99 235 / 8%);
    border-color: rgb(37 99 235 / 16%);

    :deep(.el-tag__content) {
      display: inline-flex;
      gap: 8px;
      align-items: center;
    }
  }

  &__tag-dot {
    display: inline-block;
    flex-shrink: 0;
    width: 7px;
    height: 7px;
    background: #2563eb;
    border-radius: 50%;
    box-shadow: 0 0 0 3px rgb(37 99 235 / 16%);
  }

  &__title {
    margin: 0;
    font-size: 36px;
    font-weight: 800;
    line-height: 1.15;
    color: #1e3a8a;
    letter-spacing: 0;
  }

  &__desc {
    max-width: 560px;
    margin: 0;
    font-size: 18px;
    line-height: 1.6;
    color: #475569;
  }

  &__features {
    display: inline-flex;
    align-items: center;
    width: fit-content;
    max-width: 100%;
    margin-top: 32px;
  }

  &__feature {
    position: relative;
    display: inline-flex;
    gap: 10px;
    align-items: center;
    height: 32px;
    padding: 0 15px;
    font-size: 14px;
    font-weight: 600;
    color: rgb(30 58 138 / 85%);
    background: transparent;

    &:first-child {
      padding-left: 0;
    }

    &:not(:last-child)::after {
      position: absolute;
      top: 7px;
      right: 0;
      width: 1px;
      height: 14px;
      content: "";
      background: rgb(37 99 235 / 18%);
    }
  }

  &__feature-mark {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    color: #1d4ed8;
    background: rgb(37 99 235 / 8%);
    border: 1px solid rgb(37 99 235 / 16%);
    border-radius: 6px;
  }

  &__feature-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 14px;
    height: 14px;
    color: #1d4ed8;
  }

  &__feature-text {
    line-height: 1;
    white-space: nowrap;
  }
}

.login-card {
  position: relative;
  z-index: 1;
  display: flex;
  flex: 0 0 35%;
  flex-direction: column;
  align-items: center;
  padding: 0 0 32px;
  background: #fff;
  animation: login-pane-in 0.36s ease-out 0.04s both;

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
    margin: 0 0 10px;
    font-size: 28px;
    font-weight: 750;
    line-height: 1.1;
    color: $text-primary;
    letter-spacing: 0;
  }

  &__desc {
    margin: 10px 0 28px;
    font-size: 15px;
    color: $text-muted;
  }
}

:deep(.el-form-item) {
  margin-bottom: 14px;
}

:deep(.el-input__wrapper) {
  height: $input-h;
}

.input-prefix-icon {
  display: inline-flex;
  width: 14px;
  height: 14px;
  color: var(--el-text-color-placeholder);
}

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
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 108px;
  height: $input-h;
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

.login-btn {
  width: 100%;
  height: 44px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  box-shadow: 0 12px 24px rgba($primary, 0.18);

  &:hover {
    box-shadow: 0 14px 28px rgba($primary, 0.22);
  }

  &:focus,
  &:focus-visible {
    outline: none;
  }
}

.login-demo {
  margin-top: 20px;

  &__title {
    margin-bottom: 10px;
    font-size: 12px;
    color: $text-muted;
  }

  &__accounts {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  &__chip {
    height: 28px;
    padding: 0 12px;
    font-size: 12px;
    color: $text-secondary;
    cursor: pointer;
    background: rgb(37 99 235 / 5%);
    border: 1px solid rgb(37 99 235 / 16%);
    border-radius: 999px;
    transition:
      color 0.2s,
      background 0.2s,
      border-color 0.2s;

    &:hover {
      color: $primary;
      background: rgb(37 99 235 / 10%);
      border-color: rgba($primary, 0.4);
    }
  }
}

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
      background: rgb(30 58 138 / 12%);
    }
  }

  &__buttons {
    display: flex;
    gap: 12px;
  }

  /* 半透明白底按钮，在渐变背景上保持可见；hover 时提实并加深投影 */
  &__btn {
    display: flex;
    flex: 1;
    gap: 8px;
    align-items: center;
    justify-content: center;
    height: 44px;
    padding: 0;
    font-size: 14px;
    color: $text-secondary;
    cursor: pointer;
    background: rgb(255 255 255 / 80%);
    border: 1px solid rgb(30 58 138 / 10%);
    border-radius: 8px;
    box-shadow: 0 1px 2px rgb(30 58 138 / 6%);
    backdrop-filter: blur(4px);
    transition:
      color 0.2s,
      background 0.2s,
      border-color 0.2s,
      box-shadow 0.2s;

    &:hover {
      color: $primary;
      background: #fff;
      border-color: rgba($primary, 0.35);
      box-shadow: 0 4px 12px rgba($primary, 0.14);
    }
  }

  &__icon {
    width: 16px;
    height: 16px;
  }
}

.login-footer {
  flex-shrink: 0;
  font-size: 12px;
  color: $text-muted;
}

.dark .login-page {
  background: #0b1020;
}

.dark .login-brand {
  background-image: url("@/assets/images/login/bg-dark.svg");

  &__logo {
    background: rgb(255 255 255 / 10%);
    border-color: rgb(255 255 255 / 20%);
  }

  &__name {
    color: rgb(255 255 255 / 92%);
  }

  &__version {
    color: rgb(255 255 255 / 85%);
    background: rgb(255 255 255 / 10%);
    border-color: rgb(255 255 255 / 16%);
  }

  &__tag {
    color: #fff;
    background: rgb(255 255 255 / 8%);
    border-color: rgb(255 255 255 / 16%);
  }

  &__tag-dot {
    background: #fff;
    box-shadow: 0 0 0 3px rgb(255 255 255 / 18%);
  }

  &__title {
    color: #fff;
  }

  &__desc {
    color: rgb(255 255 255 / 65%);
  }

  &__feature {
    color: rgb(255 255 255 / 85%);

    &:not(:last-child)::after {
      background: rgb(255 255 255 / 18%);
    }
  }

  &__feature-mark {
    color: #fff;
    background: rgb(255 255 255 / 10%);
    border-color: rgb(255 255 255 / 16%);
  }

  &__feature-icon {
    color: #fff;
  }
}

.dark .login-card {
  background: #0b1020;

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

  &::before,
  &::after {
    background: rgb(255 255 255 / 12%);
  }
}

/* 深色下演示账号用半透明白底 */
.dark .login-demo {
  &__title {
    color: rgb(255 255 255 / 35%);
  }

  &__chip {
    color: rgb(255 255 255 / 70%);
    background: rgb(255 255 255 / 6%);
    border-color: rgb(255 255 255 / 14%);

    &:hover {
      color: #fff;
      background: rgb(255 255 255 / 12%);
      border-color: rgb(255 255 255 / 28%);
    }
  }
}

/* 深色下按钮用半透明白叠加，hover 提亮 */
.dark .login-alt__btn {
  color: rgb(255 255 255 / 65%);
  background: rgb(255 255 255 / 6%);
  border-color: rgb(255 255 255 / 12%);
  box-shadow: none;

  &:hover {
    color: #fff;
    background: rgb(255 255 255 / 12%);
    border-color: rgb(255 255 255 / 24%);
  }
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.2s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(6px);
}

@keyframes login-pane-in {
  from {
    opacity: 0;
    filter: blur(4px);
  }

  to {
    opacity: 1;
    filter: blur(0);
  }
}

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
    min-height: auto;
    padding: 28px 40px 32px;
    background: transparent;

    &__hero {
      display: none;
    }
  }

  /* 深色品牌区的背景图不适合窄屏，透出页面底色 */
  .dark .login-brand {
    background: none;
  }

  /* 卡片占满剩余高度并透出页面渐变，inner 沿用全局的垂直居中，页脚沉底 */
  .login-card {
    flex: 1;
    padding: 40px 48px 32px;
    background: transparent;
  }

  .dark .login-card {
    background: transparent;
  }
}

@media (max-width: 640px) {
  .login-toolbar {
    top: 33px;
    right: 20px;
  }

  .login-brand {
    padding: 24px 24px 28px;
  }

  .login-card {
    padding: 32px 24px 24px;

    &__inner {
      width: 100%;
      padding: 0;
    }
  }
}
</style>
