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
                多租�?
              </el-tag>
            </div>
          </div>
        </div>

        <transition name="fade-slide" mode="out-in">
          <component :is="formComponents[component]" v-model="component" class="auth-panel__form" />
        </transition>

        <footer class="auth-panel__footer">
          <el-text size="small">
            Copyright © 2021 - 2025 youlai.tech
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

let notificationInstance: ReturnType<typeof ElNotification> | null = null;

const showVoteNotification = () => {
  notificationInstance = ElNotification({
    title: "Gitee 2025 开源评选 · 诚邀支持",
    message: `我正在参与 Gitee 2025 最受欢迎开源软件投票活动，欢迎支持！<br/><a href="https://gitee.com/activity/2025opensource?ident=I6VXEH" target="_blank" style="color: var(--el-color-primary); text-decoration: none; font-weight: 500;">点击投票</a>`,
    type: "success",
    position: "bottom-left",
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
.auth-view {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: clamp(1rem, 3vw, 2rem);
  overflow: hidden;
  background-color: #f5f7ff;

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
    background: linear-gradient(120deg, rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0));
  }
}

.auth-view__toolbar {
  display: inline-flex;
  gap: 0.75rem;
  align-self: flex-end;
  padding: 0.5rem 0.75rem;
  background-color: rgba(255, 255, 255, 0.85);
  border: 1px solid rgba(22, 93, 255, 0.15);
  border-radius: 999px;
  box-shadow: 0 10px 30px rgba(22, 93, 255, 0.12);
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;

  &:hover {
    box-shadow: 0 16px 40px rgba(22, 93, 255, 0.18);
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
      background-color: var(--el-fill-color);
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

  @media (prefers-color-scheme: dark) {
    background-color: rgba(24, 28, 43, 0.8);
    border-color: rgba(64, 128, 255, 0.3);
  }
}

/* 应用内暗黑主题下顶部设置面板的深色样�?*/
.dark .auth-view__toolbar {
  background-color: rgba(24, 28, 43, 0.9);
  border-color: rgba(64, 128, 255, 0.35);
  box-shadow:
    0 10px 30px rgba(0, 0, 0, 0.7),
    0 0 0 1px rgba(90, 140, 255, 0.25) inset;
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
  color: var(--el-text-color-primary);
  animation: featureFade 0.8s ease-out;

  @media (prefers-color-scheme: dark) {
    color: rgba(236, 242, 255, 0.92);
  }
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
  color: rgba(22, 93, 255, 0.95);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  background: rgba(22, 93, 255, 0.1);
  border-radius: 999px;

  @media (prefers-color-scheme: dark) {
    color: rgba(160, 190, 255, 0.95);
    background: rgba(64, 128, 255, 0.12);
  }
}

.auth-feature__dot {
  width: 0.5rem;
  height: 0.5rem;
  background: #165dff;
  border-radius: 50%;
  box-shadow: 0 0 12px rgba(22, 93, 255, 0.7);

  @media (prefers-color-scheme: dark) {
    background: #7aa2ff;
  }
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
  color: var(--el-text-color-regular);

  @media (prefers-color-scheme: dark) {
    color: rgba(220, 230, 255, 0.75);
  }
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
    color: var(--el-text-color-primary);
    background: rgba(255, 255, 255, 0.9);
    border: 1px solid rgba(64, 128, 255, 0.08);
    border-radius: 12px;
    backdrop-filter: blur(6px);

    span {
      font-size: 0.75rem;
      line-height: 1.6;
      color: rgba(22, 93, 255, 0.8);
    }
  }

  @media (prefers-color-scheme: dark) {
    li {
      color: rgba(230, 236, 255, 0.85);
      background: rgba(18, 22, 36, 0.7);
      border-color: rgba(98, 149, 255, 0.18);

      span {
        color: rgba(122, 162, 255, 0.9);
      }
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
  padding: clamp(1.5rem, 3vw, 2rem);
  margin-inline: auto;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(22, 93, 255, 0.1);
  border-radius: 24px;
  box-shadow:
    0 16px 48px rgba(22, 93, 255, 0.12),
    0 4px 16px rgba(22, 93, 255, 0.08),
    0 0 0 1px rgba(255, 255, 255, 0.5) inset;
  backdrop-filter: blur(20px);
  animation: panelLift 0.7s ease;

  @media (prefers-color-scheme: dark) {
    background: rgba(18, 20, 32, 0.88);
    border-color: rgba(64, 128, 255, 0.25);
    box-shadow:
      0 20px 60px rgba(0, 0, 0, 0.6),
      0 4px 16px rgba(0, 0, 0, 0.4),
      0 0 0 1px rgba(90, 140, 255, 0.12) inset;
  }
}

/* 应用内暗黑主题（例如 html/body 上挂 .dark 类）下的登录表单样式 */
.dark .auth-panel {
  background: rgba(26, 32, 48, 0.9);
  border-color: rgba(86, 140, 255, 0.28);
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.58),
    0 4px 16px rgba(0, 0, 0, 0.36),
    0 0 0 1px rgba(110, 150, 255, 0.16) inset;
}

.auth-panel__brand {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 0.875rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid rgba(22, 93, 255, 0.06);

  @media (prefers-color-scheme: dark) {
    border-color: rgba(64, 128, 255, 0.12);
  }
}

.auth-panel__logo-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  background: radial-gradient(circle at 30% 20%, #ffffff, #e6efff);
  border-radius: 18px;
  box-shadow:
    0 8px 20px rgba(22, 93, 255, 0.16),
    0 0 0 1px rgba(255, 255, 255, 0.8) inset;

  @media (prefers-color-scheme: dark) {
    background: radial-gradient(circle at 30% 20%, #1f2438, #141827);
    box-shadow:
      0 8px 20px rgba(0, 0, 0, 0.7),
      0 0 0 1px rgba(90, 140, 255, 0.3) inset;
  }
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
  color: var(--el-text-color-primary);
  white-space: nowrap;
}

.auth-panel__version-row {
  display: inline-flex;
  gap: 0.5rem;
  align-items: center;
  font-size: 0.78rem;
}

.auth-panel__form {
  width: 100%;
  max-width: 100%;
  margin-inline: auto;

  :deep(.el-form-item) {
    margin-bottom: 1rem;
  }

  :deep(.el-input__wrapper) {
    box-shadow: 0 0 0 1px var(--el-border-color) inset;
    transition: all 0.2s ease;

    &:hover {
      box-shadow: 0 0 0 1px var(--el-border-color-hover) inset;
    }

    &.is-focus {
      box-shadow: 0 0 0 1px var(--el-color-primary) inset;
    }
  }

  :deep(.el-card) {
    background: transparent;
    box-shadow: none;
  }
}

.auth-panel__footer {
  padding-top: 0.875rem;
  margin-top: 0.125rem;
  font-size: 0.875rem;
  text-align: center;
  border-top: 1px solid rgba(22, 93, 255, 0.06);

  a {
    margin-left: 0.25rem;
    color: rgba(22, 93, 255, 0.85);
    text-decoration: none;
    transition: color 0.2s ease;

    &:hover {
      color: rgba(22, 93, 255, 1);
    }
  }

  @media (prefers-color-scheme: dark) {
    border-color: rgba(64, 128, 255, 0.12);

    a {
      color: rgba(140, 170, 255, 0.88);

      &:hover {
        color: rgba(160, 190, 255, 1);
      }
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
