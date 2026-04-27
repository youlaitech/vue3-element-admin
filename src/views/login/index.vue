<template>
  <div class="auth-view">
    <div class="auth-view__toolbar">
      <el-tooltip :content="t('login.themeToggle')" placement="bottom">
        <div class="toolbar-item">
          <ThemeSwitch />
        </div>
      </el-tooltip>
      <el-tooltip :content="t('login.languageToggle')" placement="bottom">
        <div class="toolbar-item">
          <LangSelect size="text-20px" />
        </div>
      </el-tooltip>
    </div>

    <div class="auth-view__wrapper">
      <!-- 可选：左侧产品介绍区域，如不需要可整段删除，右侧登录表单会自动居中展示 -->
      <section class="auth-feature">
        <div class="auth-feature__badge">
          <span class="auth-feature__dot" />
          Enterprise Ready
        </div>
        <h1 class="auth-feature__title">企业级管理系统</h1>
        <p class="auth-feature__subtitle">
          提供安全、高效、可扩展的管理解决方案，助力企业数字化转型与业务增长。
        </p>
        <ul class="auth-feature__highlights">
          <li>
            <span>✓</span>
            统一身份认证与权限管理
          </li>
          <li>
            <span>✓</span>
            支持多租户模式与租户隔离
          </li>
          <li>
            <span>✓</span>
            数据安全与操作审计
          </li>
          <li>
            <span>✓</span>
            灵活扩展与高可用架构
          </li>
        </ul>
      </section>

      <section class="auth-panel">
        <div class="auth-panel__brand">
          <div class="auth-panel__logo-wrap">
            <el-image :src="logo" class="auth-panel__logo" />
          </div>
          <div class="auth-panel__meta">
            <div class="auth-panel__title-row">
              <span class="auth-panel__title">{{ appConfig.title }}</span>
            </div>
            <div v-if="appConfig.version || tenantEnabled" class="auth-panel__version-row">
              <el-text size="small" type="info">VERSION</el-text>
              <el-tag v-if="appConfig.version" size="small" effect="light" round>
                {{ `v${appConfig.version}` }}
              </el-tag>
              <el-tag v-if="tenantEnabled" type="success" size="small" effect="light" round>
                多租户
              </el-tag>
            </div>
          </div>
        </div>

        <transition name="fade-slide" mode="out-in">
          <component :is="formComponents[component]" v-model="component" class="auth-panel__form" />
        </transition>

        <footer class="auth-panel__footer">
          <el-text size="small">
            Copyright © 2021 - 2026 youlai.tech
            <a href="http://beian.miit.gov.cn/" target="_blank">皖ICP备00064962号</a>
          </el-text>
        </footer>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import logo from "@/assets/images/logo.png";
import { appConfig } from "@/settings";
import ThemeSwitch from "@/components/ThemeSwitch/index.vue";

type LayoutMap = "login" | "register" | "resetPwd";

const { t } = useI18n();
const component = ref<LayoutMap>("login");

const tenantEnabled = appConfig.tenantEnabled;

const formComponents = {
  login: defineAsyncComponent(() => import("./components/Login.vue")),
  register: defineAsyncComponent(() => import("./components/Register.vue")),
  resetPwd: defineAsyncComponent(() => import("./components/ResetPwd.vue")),
};
</script>

<style lang="scss" scoped>
.auth-view {
  --auth-page-bg: #f5f7ff;
  --auth-overlay: linear-gradient(120deg, rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0));
  --auth-toolbar-bg: rgba(255, 255, 255, 0.85);
  --auth-toolbar-border: rgba(22, 93, 255, 0.15);
  --auth-toolbar-shadow: 0 10px 30px rgba(22, 93, 255, 0.12);
  --auth-toolbar-hover-shadow: 0 16px 40px rgba(22, 93, 255, 0.18);
  --auth-toolbar-inner-hover-bg: var(--el-fill-color);
  --auth-feature-text: var(--el-text-color-primary);
  --auth-badge-text: rgba(22, 93, 255, 0.95);
  --auth-badge-bg: rgba(22, 93, 255, 0.1);
  --auth-dot-bg: #165dff;
  --auth-dot-shadow: 0 0 12px rgba(22, 93, 255, 0.7);
  --auth-subtitle-text: var(--el-text-color-regular);
  --auth-highlight-text: var(--el-text-color-primary);
  --auth-highlight-bg: rgba(255, 255, 255, 0.9);
  --auth-highlight-border: rgba(64, 128, 255, 0.08);
  --auth-highlight-accent: rgba(22, 93, 255, 0.8);
  --auth-panel-bg: rgba(255, 255, 255, 0.95);
  --auth-panel-border: rgba(22, 93, 255, 0.1);
  --auth-panel-shadow:
    0 16px 48px rgba(22, 93, 255, 0.12), 0 4px 16px rgba(22, 93, 255, 0.08),
    0 0 0 1px rgba(255, 255, 255, 0.5) inset;
  --auth-brand-border: rgba(22, 93, 255, 0.06);
  --auth-panel-title: var(--el-text-color-primary);
  --auth-version-label: var(--el-text-color-secondary);
  --auth-version-tag-bg: rgba(22, 93, 255, 0.1);
  --auth-version-tag-border: rgba(22, 93, 255, 0.12);
  --auth-version-tag-text: rgba(22, 93, 255, 0.9);
  --auth-logo-bg: radial-gradient(circle at 30% 20%, #ffffff, #e6efff);
  --auth-logo-shadow: 0 8px 20px rgba(22, 93, 255, 0.16), 0 0 0 1px rgba(255, 255, 255, 0.8) inset;
  --auth-footer-border: rgba(22, 93, 255, 0.06);
  --auth-link: rgba(22, 93, 255, 0.85);
  --auth-link-hover: rgba(22, 93, 255, 1);
  --auth-inline-text: var(--el-text-color-regular);
  --auth-input-bg: rgba(255, 255, 255, 0.92);
  --auth-input-border: var(--el-border-color);
  --auth-input-border-hover: var(--el-border-color-hover);
  --auth-input-border-focus: var(--el-color-primary);
  --auth-input-text: var(--el-text-color-primary);
  --auth-input-placeholder: var(--el-text-color-placeholder);
  --auth-input-icon: var(--el-text-color-secondary);
  --auth-checkbox-text: var(--el-text-color-regular);
  --auth-divider: var(--el-border-color-light);
  --auth-social-text: var(--el-text-color-secondary);
  --auth-social-hover-bg: var(--el-fill-color);
  --auth-captcha-shadow: 0 0 0 1px var(--el-border-color) inset;
  --auth-button-shadow: 0 12px 24px rgba(22, 93, 255, 0.12);
  --auth-button-success-shadow: 0 12px 24px rgba(35, 166, 111, 0.2);
  --auth-button-warning-shadow: 0 12px 24px rgba(230, 162, 60, 0.2);
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 100vh;
  padding: clamp(1rem, 3vw, 2rem);
  overflow-x: hidden;
  overflow-y: auto;
  background-color: var(--auth-page-bg);

  &::before {
    position: fixed;
    inset: 0;
    z-index: -2;
    content: "";
    background: url("@/assets/images/login-bg.svg") center/cover no-repeat;
  }

  &::after {
    position: fixed;
    inset: 0;
    z-index: -1;
    pointer-events: none;
    content: "";
    background: var(--auth-overlay);
  }
}

.dark .auth-view {
  --auth-page-bg: #08101f;
  --auth-overlay: linear-gradient(120deg, rgba(7, 12, 24, 0.4), rgba(7, 12, 24, 0));
  --auth-toolbar-bg: rgba(24, 28, 43, 0.9);
  --auth-toolbar-border: rgba(64, 128, 255, 0.35);
  --auth-toolbar-shadow: 0 10px 30px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(90, 140, 255, 0.25) inset;
  --auth-toolbar-hover-shadow:
    0 16px 40px rgba(0, 0, 0, 0.72), 0 0 0 1px rgba(96, 148, 255, 0.28) inset;
  --auth-feature-text: rgba(240, 245, 255, 0.92);
  --auth-badge-text: rgba(160, 190, 255, 0.95);
  --auth-badge-bg: rgba(64, 128, 255, 0.12);
  --auth-dot-bg: #7aa2ff;
  --auth-subtitle-text: rgba(220, 230, 255, 0.75);
  --auth-highlight-text: rgba(230, 236, 255, 0.85);
  --auth-highlight-bg: rgba(18, 22, 36, 0.7);
  --auth-highlight-border: rgba(98, 149, 255, 0.18);
  --auth-highlight-accent: rgba(122, 162, 255, 0.9);
  --auth-panel-bg: rgba(26, 32, 48, 0.9);
  --auth-panel-border: rgba(86, 140, 255, 0.28);
  --auth-panel-shadow:
    0 20px 60px rgba(0, 0, 0, 0.58), 0 4px 16px rgba(0, 0, 0, 0.36),
    0 0 0 1px rgba(110, 150, 255, 0.16) inset;
  --auth-brand-border: rgba(64, 128, 255, 0.12);
  --auth-panel-title: rgba(245, 248, 255, 0.95);
  --auth-version-label: rgba(186, 202, 236, 0.78);
  --auth-version-tag-bg: rgba(86, 140, 255, 0.16);
  --auth-version-tag-border: rgba(104, 156, 255, 0.2);
  --auth-version-tag-text: rgba(214, 226, 255, 0.96);
  --auth-logo-bg: radial-gradient(circle at 30% 20%, #1f2438, #141827);
  --auth-logo-shadow: 0 8px 20px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(90, 140, 255, 0.3) inset;
  --auth-footer-border: rgba(64, 128, 255, 0.12);
  --auth-link: rgba(140, 170, 255, 0.88);
  --auth-link-hover: rgba(160, 190, 255, 1);
  --auth-inline-text: rgba(208, 220, 244, 0.76);
  --auth-input-bg: rgba(14, 19, 33, 0.92);
  --auth-input-border: rgba(104, 132, 194, 0.28);
  --auth-input-border-hover: rgba(122, 154, 224, 0.4);
  --auth-input-border-focus: rgba(122, 162, 255, 0.92);
  --auth-input-text: rgba(240, 245, 255, 0.96);
  --auth-input-placeholder: rgba(168, 185, 221, 0.56);
  --auth-input-icon: rgba(168, 186, 227, 0.74);
  --auth-checkbox-text: rgba(208, 220, 244, 0.78);
  --auth-divider: rgba(98, 128, 191, 0.24);
  --auth-social-text: rgba(176, 192, 224, 0.72);
  --auth-social-hover-bg: rgba(36, 49, 79, 0.78);
  --auth-captcha-shadow: 0 0 0 1px rgba(104, 132, 194, 0.28) inset;
  --auth-button-shadow: 0 14px 26px rgba(51, 100, 214, 0.22);
  --auth-button-success-shadow: 0 14px 26px rgba(34, 149, 108, 0.24);
  --auth-button-warning-shadow: 0 14px 26px rgba(211, 142, 38, 0.24);

  &::before {
    background-image: url("@/assets/images/login-bg-dark.svg");
  }
}

.auth-view__toolbar {
  display: inline-flex;
  gap: 0.75rem;
  align-self: flex-end;
  padding: 0.5rem 0.75rem;
  background-color: var(--auth-toolbar-bg);
  border: 1px solid var(--auth-toolbar-border);
  border-radius: 999px;
  box-shadow: var(--auth-toolbar-shadow);
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;

  &:hover {
    box-shadow: var(--auth-toolbar-hover-shadow);
    transform: translateY(-2px);
  }

  .toolbar-item {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.5rem;
    cursor: pointer;
    border-radius: 8px;
    transition: background-color 0.3s ease;

    &:hover {
      background-color: var(--auth-toolbar-inner-hover-bg);
    }
  }

  @media (max-width: 640px) {
    position: fixed;
    top: 12px;
    right: 16px;
    z-index: 20;
    align-self: flex-end;
    justify-content: center;
  }
}

.auth-view__wrapper {
  display: grid;
  flex: 1;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: clamp(1.5rem, 3vw, 3rem);
  align-items: stretch;
  padding: clamp(1.5rem, 2vw, 2.5rem);
}

.auth-feature {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: clamp(1.5rem, 3vw, 3rem);
  color: var(--auth-feature-text);
  animation: featureFade 0.8s ease-out;
}

@media (max-width: 768px) {
  .auth-view__wrapper {
    display: block;
    padding: 1.25rem 0.75rem 1.75rem;
  }

  .auth-feature {
    display: none;
  }

  .auth-panel {
    width: 100%;
    margin-inline: 0;
    box-shadow:
      0 12px 32px rgba(22, 93, 255, 0.18),
      0 2px 8px rgba(22, 93, 255, 0.12);
  }
}

.auth-feature__badge {
  display: inline-flex;
  gap: 0.5rem;
  align-items: center;
  width: fit-content;
  padding: 0.3rem 0.9rem;
  font-size: 0.875rem;
  color: var(--auth-badge-text);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  background: var(--auth-badge-bg);
  border-radius: 999px;
}

.auth-feature__dot {
  width: 0.5rem;
  height: 0.5rem;
  background: var(--auth-dot-bg);
  border-radius: 50%;
  box-shadow: var(--auth-dot-shadow);
}

.auth-feature__title {
  margin: 1.5rem 0 0.5rem;
  font-size: clamp(2rem, 4vw, 2.75rem);
  font-weight: 600;
  line-height: 1.2;
}

.auth-feature__subtitle {
  margin-bottom: 1.5rem;
  font-size: 1rem;
  line-height: 1.7;
  color: var(--auth-subtitle-text);
}

.auth-feature__highlights {
  display: grid;
  gap: 0.75rem;
  padding: 0;
  margin: 0;
  list-style: none;

  li {
    display: flex;
    gap: 0.5rem;
    align-items: flex-start;
    padding: 0.75rem 1rem;
    font-weight: 500;
    color: var(--auth-highlight-text);
    background: var(--auth-highlight-bg);
    border: 1px solid var(--auth-highlight-border);
    border-radius: 12px;
    backdrop-filter: blur(6px);

    span {
      font-size: 0.75rem;
      line-height: 1.6;
      color: var(--auth-highlight-accent);
    }
  }
}

.auth-panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-self: center;
  justify-content: flex-start;
  justify-self: end;
  width: min(420px, 100%);
  min-height: 560px;
  padding: clamp(1.5rem, 3vw, 2rem);
  margin-inline: auto;
  background: var(--auth-panel-bg);
  border: 1px solid var(--auth-panel-border);
  border-radius: 24px;
  box-shadow: var(--auth-panel-shadow);
  backdrop-filter: blur(20px);
  animation: panelLift 0.7s ease;
}

.auth-panel__brand {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 0.875rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid var(--auth-brand-border);
}

.auth-panel__logo-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  background: var(--auth-logo-bg);
  border-radius: 18px;
  box-shadow: var(--auth-logo-shadow);
}

.auth-panel__logo {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
}

.auth-panel__meta {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 0.35rem;
  min-width: 0;
}

.auth-panel__title-row {
  display: flex;
  gap: 0.5rem;
  align-items: baseline;
}

.auth-panel__title {
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 1.2rem;
  font-weight: 650;
  line-height: 1.4;
  color: var(--auth-panel-title);
  white-space: nowrap;
}

.auth-panel__version-row {
  display: inline-flex;
  gap: 0.5rem;
  align-items: center;
  font-size: 0.78rem;

  :deep(.el-text) {
    color: var(--auth-version-label);
  }

  :deep(.el-tag) {
    color: var(--auth-version-tag-text);
    background-color: var(--auth-version-tag-bg);
    border-color: var(--auth-version-tag-border);
  }
}

.auth-panel__form {
  width: 100%;
  max-width: 100%;
  min-height: 360px;
  margin-inline: auto;

  :deep(.el-form-item) {
    margin-bottom: 1rem;
  }

  :deep(.el-input__wrapper) {
    background-color: var(--auth-input-bg);
    box-shadow: 0 0 0 1px var(--auth-input-border) inset;
    transition: all 0.2s ease;

    &:hover {
      box-shadow: 0 0 0 1px var(--auth-input-border-hover) inset;
    }

    &.is-focus {
      box-shadow: 0 0 0 1px var(--auth-input-border-focus) inset;
    }
  }

  :deep(.el-input__inner) {
    color: var(--auth-input-text);

    &::placeholder {
      color: var(--auth-input-placeholder);
    }
  }

  :deep(.el-input__prefix),
  :deep(.el-input__suffix),
  :deep(.el-input__prefix-inner),
  :deep(.el-input__suffix-inner) {
    color: var(--auth-input-icon);
  }

  :deep(.el-text) {
    color: var(--auth-inline-text);
  }

  :deep(.el-link) {
    color: var(--auth-link);

    &:hover {
      color: var(--auth-link-hover);
    }
  }

  :deep(.el-checkbox) {
    color: var(--auth-checkbox-text);
  }

  :deep(.el-checkbox__label) {
    color: inherit;
  }

  :deep(.el-button) {
    box-shadow: var(--auth-button-shadow);
  }

  :deep(.el-button--success) {
    box-shadow: var(--auth-button-success-shadow);
  }

  :deep(.el-button--warning) {
    box-shadow: var(--auth-button-warning-shadow);
  }

  :deep(.el-card) {
    background: transparent;
    box-shadow: none;
  }

  :deep(img[alt="captchaCode"]),
  :deep(img[alt="code"]) {
    box-shadow: var(--auth-captcha-shadow);
  }

  :deep(.third-party-login .divider-line) {
    background: linear-gradient(to right, transparent, var(--auth-divider), transparent);
  }

  :deep(.third-party-login .divider-text) {
    color: var(--auth-inline-text);
  }

  :deep(.third-party-login .social-login) {
    color: var(--auth-social-text);
  }

  :deep(.third-party-login .social-login__item:hover) {
    background-color: var(--auth-social-hover-bg);
  }
}

.auth-panel__footer {
  padding-top: 0.875rem;
  margin-top: 0.125rem;
  font-size: 0.875rem;
  text-align: center;
  border-top: 1px solid var(--auth-footer-border);

  a {
    margin-left: 0.25rem;
    color: var(--auth-link);
    text-decoration: none;
    transition: color 0.2s ease;

    &:hover {
      color: var(--auth-link-hover);
    }
  }
}

@keyframes featureFade {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes panelLift {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(-40px) scale(0.95);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(40px) scale(0.95);
}

.fade-slide-enter-to,
.fade-slide-leave-from {
  opacity: 1;
  transform: translateX(0) scale(1);
}
</style>
