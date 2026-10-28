<template>
  <div class="oidc-callback">
    <el-result
      class="oidc-result"
      icon="error"
      :title="errorMessage ? '统一认证登录失败' : '正在完成统一认证登录'"
      :sub-title="errorMessage || '请稍候…'"
    >
      <template v-if="!errorMessage" #icon>
        <el-icon class="is-loading" :size="40"><Loading /></el-icon>
      </template>
      <template v-if="errorMessage" #extra>
        <div v-if="subject" class="mb-4">
          <el-text tag="p" class="mb-3">将身份标识交给管理员，在用户管理中关联账号。</el-text>
          <el-input :model-value="subject" readonly aria-label="身份标识 subject">
            <template #append>
              <el-button @click="copySubject">复制</el-button>
            </template>
          </el-input>
        </div>
        <el-space wrap>
          <el-button type="primary" @click="retryLogin">重新登录</el-button>
          <el-button @click="router.replace('/login')">返回登录页</el-button>
        </el-space>
      </template>
    </el-result>
  </div>
</template>

<script setup lang="ts">
import { Loading } from "@element-plus/icons-vue";
import AuthAPI, { OIDC_AUTHORIZATION_URL } from "@/api/auth";
import { AuthStorage, authSessionRevision } from "@/utils/auth";
import router from "@/router";

defineOptions({ name: "OidcCallbackPage" });

const errorMessage = ref("");
const subject = ref("");
const { copy } = useClipboard();
let active = true;

onBeforeUnmount(() => {
  active = false;
});

/**
 * 复制认证中心的身份标识。
 */
async function copySubject(): Promise<void> {
  try {
    await copy(subject.value);
    ElMessage.success("已复制");
  } catch {
    ElMessage.error("复制失败，请手动复制");
  }
}

/**
 * 重新发起 OIDC 登录。
 */
function retryLogin(): void {
  window.location.href = OIDC_AUTHORIZATION_URL;
}

/**
 * 读取路由参数，兼容普通查询参数。
 */
function getCallbackParam(name: string): string {
  const value = router.currentRoute.value.query[name];
  return typeof value === "string"
    ? value
    : (new URLSearchParams(window.location.search).get(name) ?? "");
}

/**
 * 兑换票据并保存本地登录凭证。
 */
async function completeLogin(): Promise<void> {
  const ticket = getCallbackParam("ticket");
  const code = getCallbackParam("error");
  const identity = getCallbackParam("subject");
  const revision = authSessionRevision.value;

  try {
    // 兑换前清理地址，避免刷新页面重复使用票据。
    const url = new URL(window.location.href);
    ["ticket", "error", "subject"].forEach((name) => url.searchParams.delete(name));
    window.history.replaceState(window.history.state, "", url);
    await router.replace({ path: "/oidc/callback" });
    if (!active || revision !== authSessionRevision.value) return;

    if (code) {
      if (code === "A0262") {
        subject.value = identity;
        errorMessage.value = "该身份尚未关联本地账号";
      } else {
        errorMessage.value = "认证未完成，请重新登录";
      }
      return;
    }
    if (!ticket) {
      errorMessage.value = "登录票据缺失，请重新登录";
      return;
    }

    const { accessToken, refreshToken } = await AuthAPI.exchangeOidcTicket(ticket);
    // 离开页面或切换账号后，不再写入这次登录的凭证。
    if (!active || revision !== authSessionRevision.value) return;
    AuthStorage.setTokens(accessToken, refreshToken, false);
    await router.replace("/");
  } catch (error) {
    if (active && revision === authSessionRevision.value) {
      errorMessage.value = error instanceof Error ? error.message : "登录失败，请重试";
    }
  }
}

onMounted(completeLogin);
</script>

<style scoped lang="scss">
.oidc-callback {
  display: grid;
  place-items: center;
  min-height: 100vh;
  padding: 24px;
}

.oidc-result {
  width: 100%;
  max-width: 480px;
}
</style>
