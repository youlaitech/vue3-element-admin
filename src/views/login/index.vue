<template>
  <div class="login-container">
    <!-- 顶部 -->
    <div class="absolute top-0 flex items-center justify-end px-25 h-20 w-full">
      <el-switch
        v-model="isDark"
        inline-prompt
        :active-icon="IconEpMoon"
        :inactive-icon="IconEpSunny"
        active-color="var(--el-fill-color-dark)"
        inactive-color="var(--el-color-primary)"
        @change="toggleDark"
      />
      <lang-select class="ml-4" />
    </div>
    <!-- 登录表单 -->
    <el-card
      class="z-1 !border-none w-100 !bg-transparent !rounded-4% <sm:w-83"
    >
      <h2 class="text-center">
        {{ $t("login.title") }}
      </h2>
      <el-form
        ref="loginFormRef"
        :model="loginData"
        :rules="loginRules"
        class="login-form"
      >
        <el-form-item prop="username">
          <div class="p-2">
            <svg-icon icon-class="user" />
          </div>
          <el-input
            ref="username"
            v-model="loginData.username"
            class="flex-1"
            size="large"
            :placeholder="$t('login.username')"
            name="username"
          />
        </el-form-item>

        <el-tooltip
          :disabled="isCapslock === false"
          content="Caps lock is On"
          placement="right"
        >
          <el-form-item prop="password">
            <span class="p-2">
              <svg-icon icon-class="password" />
            </span>
            <el-input
              v-model="loginData.password"
              class="flex-1"
              :placeholder="$t('login.password')"
              :type="passwordVisible === false ? 'password' : 'input'"
              size="large"
              name="password"
              @keyup="checkCapslock"
              @keyup.enter="handleLogin"
            />
            <span class="mr-2" @click="passwordVisible = !passwordVisible">
              <svg-icon
                :icon-class="passwordVisible === false ? 'eye' : 'eye-open'"
                class="cursor-pointer"
              />
            </span>
          </el-form-item>
        </el-tooltip>

        <!-- 验证码 -->
        <el-form-item prop="verifyCode">
          <span class="p-2">
            <svg-icon icon-class="verify-code" />
          </span>

          <el-input
            v-model="loginData.verifyCode"
            auto-complete="off"
            :placeholder="$t('login.verifyCode')"
            class="w-[60%]"
            @keyup.enter="handleLogin"
          />

          <div class="captcha">
            <img :src="captchaBase64" @click="getCaptcha" />
          </div>
        </el-form-item>

        <el-button
          :loading="loading"
          type="primary"
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
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import router from "@/router";
import LangSelect from "@/components/LangSelect/index.vue";
import SvgIcon from "@/components/SvgIcon/index.vue";
import IconEpSunny from "~icons/ep/sunny";
import IconEpMoon from "~icons/ep/moon";

// 状态管理依赖
import { useUserStore } from "@/store/modules/user";
import { useAppStore } from "@/store/modules/app";

// API依赖
import { LocationQuery, LocationQueryValue, useRoute } from "vue-router";
import { getCaptchaApi } from "@/api/auth";
import { LoginData } from "@/api/auth/types";

const appStore = useAppStore();
const userStore = useUserStore();
const route = useRoute();

const isDark = useDark();
const toggleDark = () => useToggle(isDark);

/**
 * 按钮loading
 */
const loading = ref(false);
/**
 * 是否大写锁定
 */
const isCapslock = ref(false);
/**
 * 密码是否可见
 */
const passwordVisible = ref(false);
/**
 * 验证码图片Base64字符串
 */
const captchaBase64 = ref();

/**
 * 登录表单引用
 */
const loginFormRef = ref(ElForm);

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
        validator: passwordValidator,
        message: `${prefix}${t("login.password")}`,
      },
    ],
    verifyCode: [
      {
        required: true,
        trigger: "blur",
        message: `${prefix}${t("login.verifyCode")}`,
      },
    ],
  };
});

/**
 * 密码校验器
 */
function passwordValidator(rule: any, value: any, callback: any) {
  if (value.length < 6) {
    callback(new Error("The password can not be less than 6 digits"));
  } else {
    callback();
  }
}

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
    const { verifyCodeBase64, verifyCodeKey } = data;
    loginData.value.verifyCodeKey = verifyCodeKey;
    captchaBase64.value = verifyCodeBase64;
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
});
</script>

<style lang="scss" scoped>
.login-container {
  @apply w-full h-full flex-center dark:bg-#101628 bg-no-repeat bg-center-top;

  .login-form {
    padding: 30px 10px;

    .captcha {
      position: absolute;
      top: 0;
      right: 0;

      img {
        width: 120px;
        height: 48px;
        cursor: pointer;
      }
    }
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
    box-shadow: none;

    input:-webkit-autofill {
      transition: background-color 5000s ease-in-out 0s; /* 通过延时渲染背景色变相去除背景颜色 */
    }
  }
}
</style>
