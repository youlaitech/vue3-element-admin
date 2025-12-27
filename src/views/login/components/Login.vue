<template>
  <div class="auth-panel-form">
    <h3 class="auth-panel-form__title" text-center>{{ t("login.login") }}</h3>
    <el-form
      ref="loginFormRef"
      :model="loginFormData"
      :rules="loginRules"
      size="large"
      :validate-on-rule-change="false"
    >
      <!-- 用户名 -->
      <el-form-item prop="username">
        <el-input v-model.trim="loginFormData.username" :placeholder="t('login.username')">
          <template #prefix>
            <el-icon><User /></el-icon>
          </template>
        </el-input>
      </el-form-item>

      <!-- 密码 -->
      <el-tooltip :visible="isCapsLock" :content="t('login.capsLock')" placement="right">
        <el-form-item prop="password">
          <el-input
            v-model.trim="loginFormData.password"
            :placeholder="t('login.password')"
            type="password"
            show-password
            @keyup="checkCapsLock"
            @keyup.enter="handleLoginSubmit"
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </el-form-item>
      </el-tooltip>

      <!-- 验证码 -->
      <el-form-item prop="captchaCode">
        <div flex items-center gap-10px>
          <el-input
            v-model.trim="loginFormData.captchaCode"
            :placeholder="t('login.captchaCode')"
            clearable
            class="flex-1"
            @keyup.enter="handleLoginSubmit"
          >
            <template #prefix>
              <div class="i-svg:captcha" />
            </template>
          </el-input>
          <div cursor-pointer h-40px w-120px flex-center @click="getCaptcha">
            <el-icon v-if="codeLoading" class="is-loading" size="20"><Loading /></el-icon>
            <img
              v-else-if="captchaBase64"
              border-rd-4px
              object-cover
              shadow="[0_0_0_1px_var(--el-border-color)_inset]"
              :src="captchaBase64"
              alt="captchaCode"
            />
            <el-text v-else type="info" size="small">点击获取验证码</el-text>
          </div>
        </div>
      </el-form-item>

      <div class="flex-x-between w-full">
        <el-checkbox v-model="loginFormData.rememberMe">{{ t("login.rememberMe") }}</el-checkbox>
        <el-link type="primary" underline="never" @click="toOtherForm('resetPwd')">
          {{ t("login.forgetPassword") }}
        </el-link>
      </div>

      <!-- 登录按钮 -->
      <el-form-item>
        <el-button :loading="loading" type="primary" class="w-full" @click="handleLoginSubmit">
          {{ t("login.login") }}
        </el-button>
      </el-form-item>
    </el-form>

    <div flex-center gap-10px>
      <el-text size="default">{{ t("login.noAccount") }}</el-text>
      <el-link type="primary" underline="never" @click="toOtherForm('register')">
        {{ t("login.reg") }}
      </el-link>
    </div>

    <!-- 租户选择对话框 -->
    <el-dialog
      v-model="tenantDialogVisible"
      title="选择登录租户"
      :width="isSmallScreen ? '92vw' : '500px'"
      :fullscreen="isSmallScreen"
      append-to-body
      :teleported="true"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
    >
      <div class="tenant-select-content" :style="tenantDialogBodyStyle">
        <p class="tenant-select-tip">检测到你的账号属于多个租户，请选择登录租户：</p>
        <TenantSwitcher @change="handleTenantSwitcherChange" />
      </div>
      <template #footer>
        <el-button @click="tenantDialogVisible = false">取消</el-button>
        <el-button type="primary" :disabled="!selectedTenantId" @click="handleTenantSelected">
          继续
        </el-button>
      </template>
    </el-dialog>

    <!-- 第三方登录 -->
    <div class="third-party-login">
      <div class="divider-container">
        <div class="divider-line"></div>
        <span class="divider-text">{{ t("login.otherLoginMethods") }}</span>
        <div class="divider-line"></div>
      </div>
      <div class="social-login">
        <div class="social-login__item">
          <div class="i-svg:wechat" />
        </div>
        <div class="social-login__item">
          <div class="i-svg:qq" />
        </div>
        <div class="social-login__item">
          <div class="i-svg:github" />
        </div>
        <div class="social-login__item">
          <div class="i-svg:gitee" />
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import type { FormInstance } from "element-plus";
import AuthAPI from "@/api/auth";
import type { LoginRequest } from "@/types/api";
import router from "@/router";
import { useUserStore } from "@/store";
import { useTenantStoreHook } from "@/store/modules/tenant";
import TenantSwitcher from "@/components/TenantSwitcher/index.vue";
import { AuthStorage } from "@/utils/auth";
import { ApiCodeEnum } from "@/enums";

const { t } = useI18n();
const userStore = useUserStore();
const tenantStore = useTenantStoreHook();
const route = useRoute();

onMounted(() => getCaptcha());

const loginFormRef = ref<FormInstance>();
const loading = ref(false);
// 是否大写锁定
const isCapsLock = ref(false);
const isSmallScreen = useMediaQuery("(max-width: 768px)");
// 验证码图片 Base64
const captchaBase64 = ref();
// 记住我
const rememberMe = AuthStorage.getRememberMe();
// 租户选择对话框
const tenantDialogVisible = ref(false);
const selectedTenantId = ref<number | null>(null);

function handleTenantSwitcherChange(id: number) {
  selectedTenantId.value = id;
  tenantStore.currentTenantId = id;
  const matched = tenantStore.tenantList?.find((t) => t.id === id) || null;
  tenantStore.currentTenant = matched;
}

const tenantDialogBodyStyle = computed(() => {
  if (isSmallScreen.value) {
    return {
      maxHeight: "calc(100vh - 160px)",
      overflow: "auto",
    };
  }
  return {
    maxHeight: "60vh",
    overflow: "auto",
  };
});

const loginFormData = ref<LoginRequest>({
  username: "admin",
  password: "123456",
  captchaId: "",
  captchaCode: "",
  rememberMe,
});

const loginRules = computed(() => {
  return {
    username: [
      {
        required: true,
        trigger: "blur",
        message: t("login.message.username.required"),
      },
    ],
    password: [
      {
        required: true,
        trigger: "blur",
        message: t("login.message.password.required"),
      },
      {
        min: 6,
        message: t("login.message.password.min"),
        trigger: "blur",
      },
    ],
    captchaCode: [
      {
        required: true,
        trigger: "blur",
        message: t("login.message.captchaCode.required"),
      },
    ],
  };
});

// 获取验证码
const codeLoading = ref(false);
function getCaptcha() {
  codeLoading.value = true;
  AuthAPI.getCaptcha()
    .then((data) => {
      loginFormData.value.captchaId = data.captchaId;
      captchaBase64.value = data.captchaBase64;
    })
    .finally(() => (codeLoading.value = false));
}

/**
 * 登录提交
 */
async function handleLoginSubmit() {
  try {
    // 1. 表单验证
    const valid = await loginFormRef.value?.validate();
    if (!valid) return;

    loading.value = true;

    // 2. 执行登录
    try {
      await userStore.login(loginFormData.value);
      // 登录成功，跳转到目标页面
      const redirectPath = (route.query.redirect as string) || "/";
      await router.push(decodeURIComponent(redirectPath));
    } catch (error: any) {
      // 检查是否是 choose_tenant 响应
      if (
        error?.code === ApiCodeEnum.CHOOSE_TENANT &&
        Array.isArray(error?.data) &&
        error.data.length > 0
      ) {
        // 需要选择租户
        tenantStore.setTenantList(error.data);
        selectedTenantId.value = error.data[0]?.id || null;
        if (selectedTenantId.value) {
          tenantStore.currentTenantId = selectedTenantId.value;
          tenantStore.currentTenant =
            error.data.find((t: any) => t.id === selectedTenantId.value) || null;
        }
        tenantDialogVisible.value = true;
        return; // 等待用户选择租户
      }
      // 其他错误，刷新验证码
      getCaptcha();
      throw error;
    }
  } catch (error) {
    // 统一错误处理
    console.error("登录失败:", error);
  } finally {
    loading.value = false;
  }
}

/**
 * 租户选择确认后的处理
 */
async function handleTenantSelected() {
  if (!selectedTenantId.value) {
    ElMessage.warning("请选择租户");
    return;
  }

  try {
    loading.value = true;
    // 使用选中的租户ID重新登录
    const loginData = {
      ...loginFormData.value,
      tenantId: selectedTenantId.value,
    };
    await userStore.login(loginData);
    // 登录成功，关闭对话框并跳转
    tenantDialogVisible.value = false;
    const redirectPath = (route.query.redirect as string) || "/";
    await router.push(decodeURIComponent(redirectPath));
  } catch (error) {
    // 登录失败，刷新验证码
    getCaptcha();
    console.error("登录失败:", error);
  } finally {
    loading.value = false;
  }
}

// 检查输入大小写
function checkCapsLock(event: KeyboardEvent) {
  // 防止浏览器密码自动填充时报错
  if (event instanceof KeyboardEvent) {
    isCapsLock.value = event.getModifierState("CapsLock");
  }
}

const emit = defineEmits(["update:modelValue"]);
function toOtherForm(type: "register" | "resetPwd") {
  emit("update:modelValue", type);
}
</script>

<style lang="scss" scoped>
.auth-panel-form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.auth-panel-form__title {
  margin: 0 0 0.5rem;
  font-size: 1.125rem;
  font-weight: 600;
}

.third-party-login {
  .divider-container {
    display: flex;
    align-items: center;
    margin: 16px 0;

    .divider-line {
      flex: 1;
      height: 1px;
      background: linear-gradient(to right, transparent, var(--el-border-color-light), transparent);
    }

    .divider-text {
      padding: 0 16px;
      font-size: 12px;
      color: var(--el-text-color-regular);
      white-space: nowrap;
    }
  }

  .social-login {
    display: flex;
    gap: 1.25rem;
    align-items: center;
    justify-content: center;
    width: 100%;
    color: var(--el-text-color-secondary);

    &__item {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0.5rem;
      font-size: 20px;
      cursor: pointer;
      border-radius: 8px;
      transition: background-color 0.3s ease;

      &:hover {
        background-color: var(--el-fill-color);
      }
    }
  }
}

.tenant-select-content {
  padding: 20px 0;

  .tenant-select-tip {
    margin: 0 0 20px;
    font-size: 14px;
    color: var(--el-text-color-regular);
  }
}
</style>
