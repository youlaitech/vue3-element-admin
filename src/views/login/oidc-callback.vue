<!-- 统一认证回调（技术页：换票据或展示拒绝原因） -->
<template>
  <div class="oidc-callback">
    <div class="oidc-callback__card">
      <template v-if="!hasError">
        <div class="oidc-callback__icon">
          <el-icon class="is-loading" :size="26"><Loading /></el-icon>
        </div>
        <h2 class="oidc-callback__title">正在完成统一认证登录</h2>
        <p class="oidc-callback__desc">正在核对身份并建立业务会话，请稍候…</p>
      </template>

      <template v-else>
        <div class="oidc-callback__icon" :class="`is-${errorView.level}`">
          <el-icon :size="26"><component :is="errorView.icon" /></el-icon>
        </div>
        <h2 class="oidc-callback__title">{{ errorView.title }}</h2>
        <p class="oidc-callback__desc">{{ errorView.message }}</p>

        <div v-if="subjectTip" class="oidc-callback__subject">
          <div class="oidc-callback__subject-head">
            <span class="oidc-callback__subject-label">认证标识 subject</span>
            <el-button type="primary" link @click="handleCopySubject">
              <el-icon><CopyDocument /></el-icon>
              <span class="ml-4px">复制</span>
            </el-button>
          </div>
          <code class="oidc-callback__subject-code">{{ subjectTip }}</code>
          <p class="oidc-callback__subject-tip">
            把上面这串发给管理员，管理员在「用户管理 → 账号绑定」里录入后即可登录
          </p>
        </div>

        <div class="oidc-callback__actions">
          <el-button type="primary" size="large" @click="handleRetry">重新发起统一认证</el-button>
          <el-button size="large" @click="router.replace('/login')">返回登录</el-button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { ElMessage } from "element-plus";
import { Loading } from "@element-plus/icons-vue";
import AuthAPI from "@/api/auth";
import { AuthStorage } from "@/utils/auth";
import router from "@/router";

defineOptions({ name: "OidcCallbackPage" });

// 与登录页「统一认证」入口保持一致
const OIDC_LOGIN_URL = "/oauth2/authorization/youlai";

type ErrorView = {
  /** 卡片标题 */
  title: string;
  /** 说明文案 */
  message: string;
  /** 图标底色语义 */
  level: "danger" | "warning" | "info";
  /** Element Plus 图标组件名 */
  icon: string;
};

// 服务端拒绝统一认证登录时回传的错误码对应的展示
const ERROR_VIEWS: Record<string, ErrorView> = {
  A0301: {
    title: "没有该应用的访问权限",
    message: "该账号不在准入组内，请联系管理员分配权限后重试",
    level: "warning",
    icon: "Lock",
  },
  A0262: {
    title: "尚未开通业务账号",
    message: "该统一认证账号还没有绑定业务账号，绑定后即可登录",
    level: "danger",
    icon: "CircleCloseFilled",
  },
  A0260: {
    title: "登录票据无效或已过期",
    message: "请重新发起统一认证",
    level: "info",
    icon: "Clock",
  },
  A0261: {
    title: "登录票据已被使用",
    message: "请重新发起统一认证",
    level: "info",
    icon: "Clock",
  },
  A0263: {
    title: "统一认证状态核查不可用",
    message: "认证中心暂时无法完成状态核查，请稍后重试",
    level: "warning",
    icon: "WarningFilled",
  },
};

const DEFAULT_ERROR_VIEW: ErrorView = {
  title: "统一认证登录失败",
  message: "请重试，或返回登录页改用账号密码登录",
  level: "danger",
  icon: "CircleCloseFilled",
};

const errorCode = ref("");
// 前端自身产生的错误（缺票据、兑换失败），优先于错误码展示
const localError = ref("");
// 账号未绑定时服务端回传的认证标识，供用户转发给管理员
const subjectTip = ref("");

const hasError = computed(() => Boolean(localError.value || errorCode.value));

const errorView = computed<ErrorView>(() => {
  if (localError.value) {
    return { ...DEFAULT_ERROR_VIEW, message: localError.value };
  }
  return ERROR_VIEWS[errorCode.value] ?? DEFAULT_ERROR_VIEW;
});

const { copy } = useClipboard();

async function handleCopySubject(): Promise<void> {
  await copy(subjectTip.value);
  ElMessage.success("已复制");
}

// 重新发起授权码流程，Keycloak 已有会话时会静默回到本页
function handleRetry(): void {
  window.location.href = OIDC_LOGIN_URL;
}

/**
 * 取回调参数，同时兼容服务端把参数放在 hash 查询或普通查询两种形态
 */
function takeParam(name: string): string | undefined {
  const fromRoute = router.currentRoute.value.query[name];
  if (typeof fromRoute === "string" && fromRoute) {
    return fromRoute;
  }

  return new URLSearchParams(window.location.search).get(name) ?? undefined;
}

/**
 * 用票据换取业务令牌，后续由路由守卫加载用户信息与动态路由
 */
async function completeLogin(): Promise<void> {
  const ticket = takeParam("ticket");
  const code = takeParam("error");
  const subject = takeParam("subject");

  // 票据与错误码只用于兑换，取到后立即从地址栏移除
  await router.replace({ path: "/oidc/callback" });

  if (code) {
    errorCode.value = code;
    if (code === "A0262" && subject) {
      subjectTip.value = subject;
    }
    return;
  }

  if (!ticket) {
    localError.value = "缺少登录票据，请返回登录页重新发起统一认证";
    return;
  }

  try {
    const { accessToken, refreshToken } = await AuthAPI.oidcLogin(ticket);
    AuthStorage.setTokens(accessToken, refreshToken, false);
    await router.replace("/");
  } catch (error) {
    localError.value = error instanceof Error ? error.message : "统一认证登录失败，请重试";
  }
}

onMounted(completeLogin);
</script>

<style scoped lang="scss">
.oidc-callback {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 24px;
  // 主题色浅渐变，切换主题色板时整页跟随
  background: linear-gradient(
    180deg,
    var(--el-bg-color) 0%,
    color-mix(in srgb, var(--el-color-primary) 12%, var(--el-bg-color)) 100%
  );

  &__card {
    box-sizing: border-box;
    width: 100%;
    max-width: 460px;
    padding: 40px 36px;
    text-align: center;
    background: var(--el-bg-color-overlay);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 16px;
    box-shadow: 0 18px 40px -12px rgb(15 23 42 / 18%);
    animation: oidc-card-in 0.32s ease-out both;
  }

  &__icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 56px;
    height: 56px;
    margin-bottom: 18px;
    color: var(--el-color-primary);
    background: color-mix(in srgb, var(--el-color-primary) 12%, transparent);
    border-radius: 50%;

    &.is-danger {
      color: var(--el-color-danger);
      background: color-mix(in srgb, var(--el-color-danger) 12%, transparent);
    }

    &.is-warning {
      color: var(--el-color-warning);
      background: color-mix(in srgb, var(--el-color-warning) 14%, transparent);
    }

    &.is-info {
      color: var(--el-color-info);
      background: color-mix(in srgb, var(--el-color-info) 12%, transparent);
    }
  }

  &__title {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    line-height: 1.4;
    color: var(--el-text-color-primary);
  }

  &__desc {
    margin: 10px 0 0;
    font-size: 14px;
    line-height: 1.7;
    color: var(--el-text-color-secondary);
  }

  &__subject {
    padding: 14px 16px;
    margin-top: 24px;
    text-align: left;
    background: color-mix(in srgb, var(--el-color-primary) 5%, transparent);
    border: 1px dashed color-mix(in srgb, var(--el-color-primary) 32%, transparent);
    border-radius: 12px;
  }

  &__subject-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__subject-label {
    font-size: 12px;
    font-weight: 600;
    color: var(--el-text-color-secondary);
    letter-spacing: 0.04em;
  }

  &__subject-code {
    display: block;
    margin: 6px 0 10px;
    font-family: ui-monospace, sfmono-regular, menlo, consolas, monospace;
    font-size: 15px;
    line-height: 1.6;
    color: var(--el-text-color-primary);
    word-break: break-all;
  }

  &__subject-tip {
    margin: 0;
    font-size: 12px;
    line-height: 1.6;
    color: var(--el-text-color-placeholder);
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    justify-content: center;
    margin-top: 28px;

    :deep(.el-button + .el-button) {
      margin-left: 0;
    }
  }
}

@keyframes oidc-card-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: none;
  }
}
</style>
