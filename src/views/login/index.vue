<template>
  <div class="login-container">
    <!-- 顶部 -->
    <div class="absolute-lt flex-x-end p-3 w-full">
      <el-switch
        v-model="isDark"
        inline-prompt
        :active-icon="Moon"
        :inactive-icon="Sunny"
        active-color="var(--el-fill-color-dark)"
        inactive-color="var(--el-color-primary)"
        @change="handleThemeChange"
      />
      <lang-select class="ml-2 cursor-pointer" />
    </div>
    <!-- 登录表单 -->
    <el-card class="!border-none !bg-transparent !rounded-4% w-100 <sm:w-85">
      <div class="text-center relative">
        <h2>{{ defaultSettings.title }}</h2>
        <el-tag class="ml-2 absolute-rt">{{ defaultSettings.version }}</el-tag>
      </div>

      <el-form
        ref="loginFormRef"
        :model="loginData"
        :rules="loginRules"
        class="login-form"
      >
        <!-- 用户名 -->
        <el-form-item prop="username">
          <div class="flex-y-center w-full">
            <svg-icon icon-class="user" class="mx-2" />
            <el-input
              ref="username"
              v-model="loginData.username"
              :placeholder="$t('login.username')"
              name="username"
              size="large"
              class="h-[48px]"
            />
          </div>
        </el-form-item>

        <!-- 密码 -->
        <el-tooltip
          :disabled="isCapslock === false"
          content="Caps lock is On"
          placement="right"
        >
          <el-form-item prop="password">
            <div class="flex-y-center w-full">
              <el-icon class="mx-2"><Lock /></el-icon>
              <el-input
                v-model="loginData.password"
                :placeholder="$t('login.password')"
                :type="passwordVisible === false ? 'password' : 'input'"
                name="password"
                @keyup="checkCapslock"
                @keyup.enter="handleLogin"
                size="large"
                class="flex-1 h-[48px]"
              />
              <span
                class="mr-2 cursor-pointer"
                @click="passwordVisible = !passwordVisible"
              >
                <el-icon v-if="passwordVisible === false"><View /></el-icon>
                <el-icon v-else><Hide /></el-icon>
              </span>
            </div>
          </el-form-item>
        </el-tooltip>

        <!-- 验证码 -->
        <el-form-item prop="captchaCode">
          <div class="flex-y-center w-full">
            <svg-icon icon-class="captcha" class="mx-2" />
            <el-input
              v-model="loginData.captchaCode"
              auto-complete="off"
              size="large"
              class="flex-1"
              :placeholder="$t('login.captchaCode')"
              @keyup.enter="handleLogin"
            />

            <el-image
              @click="getCaptcha"
              :src="captchaBase64"
              class="rounded-tr-md rounded-br-md cursor-pointer h-[48px]"
            />
          </div>
        </el-form-item>

        <!-- 登录按钮 -->
        <el-button
          :loading="loading"
          type="primary"
          size="large"
          class="w-full"
          @click.prevent="handleLogin"
          >{{ $t("login.login") }}
        </el-button>

        <!-- 账号密码提示 -->
        <div class="mt-10 text-sm">
          <span>{{ $t("login.username") }}: admin</span>
          <span class="ml-4"> {{ $t("login.password") }}: 123456</span>
        </div>
      </el-form>
    </el-card>

    <!-- ICP备案 -->
    <div class="absolute bottom-1 text-[10px] text-center" v-show="icpVisible">
      <p>
        Copyright © 2021 - 2024 youlai.tech All Rights Reserved. 有来技术
        版权所有
      </p>
      <p>皖ICP备20006496号-3</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSettingsStore, useUserStore, useAppStore } from "@/store";
import { Sunny, Moon } from "@element-plus/icons-vue";
import router from "@/router";
import { LocationQuery, LocationQueryValue, useRoute } from "vue-router";
import { getCaptchaApi } from "@/api/auth";
import { LoginData } from "@/api/auth/types";

const route = useRoute();
const userStore = useUserStore();
const settingsStore = useSettingsStore();

import defaultSettings from "@/settings";
/**
 * 明亮/暗黑主题切换
 */
const isDark = ref<boolean>(settingsStore.theme === "dark");
const handleThemeChange = (isDark: any) => {
  useToggle(isDark);
  settingsStore.changeSetting({
    key: "theme",
    value: isDark ? "dark" : "light",
  });
};

/**
 * 根据屏幕宽度切换设备模式
 */
const appStore = useAppStore();
const { width, height } = useWindowSize();
const icpVisible = ref(true);

watchEffect(() => {
  // 响应式布局容器固定宽度  大屏（>=1200px） 中屏（>=992px） 小屏（>=768px）
  if (width.value < 992) {
    appStore.toggleDevice("mobile");
  } else {
    appStore.toggleDevice("desktop");
  }

  if (height.value < 600) {
    icpVisible.value = false;
  } else {
    icpVisible.value = true;
  }
});

const loading = ref(false); // 按钮loading
const isCapslock = ref(false); // 是否大写锁定
const passwordVisible = ref(false); // 密码是否可见
const captchaBase64 = ref(); // 验证码图片Base64字符串
const loginFormRef = ref(ElForm); // 登录表单ref

const loginData = ref<LoginData>({
  username: "admin",
  password: "123456",
});

const { t } = useI18n();
const loginRules = computed(() => {
  const prefix = appStore.language === "en" ? "Please enter " : "请输入";
  return {
    username: [
      {
        required: true,
        trigger: "blur",
        message: `${prefix}${t("login.username")}`,
      },
    ],
    password: [
      {
        required: true,
        trigger: "blur",
        validator: (rule: any, value: any, callback: any) => {
          if (value.length < 6) {
            callback(new Error("The password can not be less than 6 digits"));
          } else {
            callback();
          }
        },
        message: `${prefix}${t("login.password")}`,
      },
    ],
    captchaCode: [
      {
        required: true,
        trigger: "blur",
        message: `${prefix}${t("login.captchaCode")}`,
      },
    ],
  };
});

/**
 * 检查输入大小写状态
 */
function checkCapslock(e: any) {
  const { key } = e;
  isCapslock.value = key && key.length === 1 && key >= "A" && key <= "Z";
}

/**
 * 获取验证码
 */
function getCaptcha() {
  getCaptchaApi().then(({ data }) => {
    loginData.value.captchaKey = data.captchaKey;
    captchaBase64.value = data.captchaBase64;
  });
}

/**
 * 登录
 */
function handleLogin() {
  loginFormRef.value.validate((valid: boolean) => {
    if (valid) {
      loading.value = true;
      userStore
        .login(loginData.value)
        .then(() => {
          const query: LocationQuery = route.query;

          const redirect = (query.redirect as LocationQueryValue) ?? "/";

          const otherQueryParams = Object.keys(query).reduce(
            (acc: any, cur: string) => {
              if (cur !== "redirect") {
                acc[cur] = query[cur];
              }
              return acc;
            },
            {}
          );

          router.push({ path: redirect, query: otherQueryParams });
        })
        .catch(() => {
          // 验证失败，重新生成验证码
          getCaptcha();
        })
        .finally(() => {
          loading.value = false;
        });
    }
  });
}

onMounted(() => {
  getCaptcha();

  // 主题初始化
  const theme = useSettingsStore().theme;
  useSettingsStore().changeSetting({ key: "theme", value: theme });
  if (theme == "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
});
</script>

<style lang="scss" scoped>
html.dark .login-container {
  background: url("@/assets/images/login-bg-dark.jpg") no-repeat center right;
}

.login-container {
  overflow-y: auto;
  background: url("@/assets/images/login-bg.jpg") no-repeat center right;

  @apply wh-full flex-center;

  .login-form {
    padding: 30px 10px;
  }
}

.el-form-item {
  background: var(--el-input-bg-color);
  border: 1px solid var(--el-border-color);
  border-radius: 5px;
}

:deep(.el-input) {
  .el-input__wrapper {
    padding: 0;
    background-color: transparent;
    box-shadow: none;

    &.is-focus,
    &:hover {
      box-shadow: none !important;
    }

    input:-webkit-autofill {
      /* 通过延时渲染背景色变相去除背景颜色 */
      transition: background-color 1000s ease-in-out 0s;
    }
  }
}
</style>
