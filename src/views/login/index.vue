<template>
  <div class="login-container">
    <el-form
      ref="loginFormRef"
      :model="loginForm"
      :rules="loginRules"
      class="login-form"
      auto-complete="on"
      label-position="left"
    >
      <div class="title-container">
        <h3 class="title">{{ $t('login.title') }}</h3>
        <lang-select class="set-language" />
      </div>

      <el-form-item prop="username">
        <span class="svg-container">
          <svg-icon icon-class="user" />
        </span>
        <el-input
          ref="username"
          v-model="loginForm.username"
          :placeholder="$t('login.username')"
          name="username"
          type="text"
          tabindex="1"
          auto-complete="on"
        />
      </el-form-item>

      <el-tooltip
        :disabled="capslockTooltipDisabled"
        content="Caps lock is On"
        placement="right"
      >
        <el-form-item prop="password">
          <span class="svg-container">
            <svg-icon icon-class="password" />
          </span>
          <el-input
            ref="passwordRef"
            :key="passwordType"
            v-model="loginForm.password"
            :type="passwordType"
            placeholder="Password"
            name="password"
            tabindex="2"
            auto-complete="on"
            @keyup="checkCapslock"
            @blur="capslockTooltipDisabled = true"
            @keyup.enter="handleLogin"
          />
          <span class="show-pwd" @click="showPwd">
            <svg-icon
              :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'"
            />
          </span>
        </el-form-item>
      </el-tooltip>

      <!-- 验证码 -->
      <el-form-item prop="code">
        <span class="svg-container">
          <svg-icon icon-class="valid_code" />
        </span>
        <el-input
          v-model="loginForm.code"
          auto-complete="off"
          :placeholder="$t('login.code')"
          style="width: 65%"
          @keyup.enter="handleLogin"
        />

        <div class="captcha">
          <img
            :src="captchaBase64"
            @click="handleCaptchaGenerate"
            height="38px"
          />
        </div>
      </el-form-item>

      <el-button
        size="default"
        :loading="loading"
        type="primary"
        style="width: 100%; margin-bottom: 30px"
        @click.prevent="handleLogin"
        >{{ $t('login.login') }}
      </el-button>

      <div class="tips">
        <span style="margin-right: 20px"
          >{{ $t('login.username') }}: admin</span
        >
        <span> {{ $t('login.password') }}: 123456</span>
      </div>
    </el-form>

    <div v-if="showCopyright == true" class="copyright">
      <p>{{ $t('login.copyright') }}</p>
      <p>{{ $t('login.icp') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, toRefs, watch, nextTick } from 'vue';

// 组件依赖
import { ElForm, ElInput } from 'element-plus';
import router from '@/router';
import LangSelect from '@/components/LangSelect/index.vue';
import SvgIcon from '@/components/SvgIcon/index.vue';

// 状态管理依赖
import useStore from '@/store';

// API依赖
import { getCaptcha } from '@/api/login';
import { useRoute } from 'vue-router';
import { LoginFormData } from '@/types/api/system/login';

const { user } = useStore();
const route = useRoute();

const loginFormRef = ref(ElForm);
const passwordRef = ref(ElInput);

const state = reactive({
  redirect: '',
  loginForm: {
    username: 'admin',
    password: '123456',
    code: '',
    uuid: '',
  } as LoginFormData,
  loginRules: {
    username: [{ required: true, trigger: 'blur' }],
    password: [
      { required: true, trigger: 'blur', validator: validatePassword },
    ],
  },
  loading: false,
  passwordType: 'password',
  captchaBase64: '',
  // 大写提示禁用
  capslockTooltipDisabled: true,
  otherQuery: {},
  clientHeight: document.documentElement.clientHeight,
  showCopyright: true,
});

function validatePassword(rule: any, value: any, callback: any) {
  if (value.length < 6) {
    callback(new Error('The password can not be less than 6 digits'));
  } else {
    callback();
  }
}

const {
  loginForm,
  loginRules,
  loading,
  passwordType,
  captchaBase64,
  capslockTooltipDisabled,
  showCopyright,
} = toRefs(state);

function checkCapslock(e: any) {
  const { key } = e;
  state.capslockTooltipDisabled =
    key && key.length === 1 && key >= 'A' && key <= 'Z';
}

function showPwd() {
  if (state.passwordType === 'password') {
    state.passwordType = '';
  } else {
    state.passwordType = 'password';
  }
  nextTick(() => {
    passwordRef.value.focus();
  });
}

function handleLogin() {
  loginFormRef.value.validate((valid: boolean) => {
    if (valid) {
      state.loading = true;
      user
        .login(state.loginForm)
        .then(() => {
          router.push({ path: state.redirect || '/', query: state.otherQuery });
          state.loading = false;
        })
        .catch(() => {
          state.loading = false;
          handleCaptchaGenerate();
        });
    } else {
      return false;
    }
  });
}

// 获取验证码
function handleCaptchaGenerate() {
  getCaptcha().then(({ data }) => {
    const { img, uuid } = data;
    state.captchaBase64 = img;
    state.loginForm.uuid = uuid;
  });
}

watch(
  route,
  () => {
    const query = route.query;
    if (query) {
      state.redirect = query.redirect as string;
      state.otherQuery = getOtherQuery(query);
    }
  },
  {
    immediate: true,
  }
);

function getOtherQuery(query: any) {
  return Object.keys(query).reduce((acc: any, cur: any) => {
    if (cur !== 'redirect') {
      acc[cur] = query[cur];
    }
    return acc;
  }, {});
}

onMounted(() => {
  handleCaptchaGenerate();
  window.onresize = () => {
    if (state.clientHeight > document.documentElement.clientHeight) {
      state.showCopyright = false;
    } else {
      state.showCopyright = true;
    }
  };
});
</script>

<style lang="scss">
/* 修复input 背景不协调 和光标变色 */
/* Detail see https://github.com/PanJiaChen/vue-element-admin/pull/927 */

$bg: #283443;
$light_gray: #fff;
$cursor: #fff;

/* reset element-ui css */
.login-container {
  .title-container {
    position: relative;

    .title {
      font-size: 26px;
      color: $light_gray;
      margin: 0px auto 40px auto;
      text-align: center;
      font-weight: bold;
    }

    .set-language {
      color: #fff;
      position: absolute;
      top: 3px;
      font-size: 18px;
      right: 0px;
      cursor: pointer;
    }
  }

  .el-input {
    display: inline-block;
    height: 36px;
    width: 85%;
    .el-input__wrapper {
      padding: 0;
      background: transparent;
      box-shadow: none;
      .el-input__inner {
        background: transparent;
        border: 0px;
        -webkit-appearance: none;
        border-radius: 0px;
        color: $light_gray;
        height: 36px;
        caret-color: $cursor;

        &:-webkit-autofill {
          box-shadow: 0 0 0px 1000px $bg inset !important;
          -webkit-text-fill-color: $cursor !important;
        }
      }
    }
  }

  .el-input__inner {
    &:hover {
      border-color: var(--el-input-hover-border, var(--el-border-color-hover));
      box-shadow: none;
    }

    box-shadow: none;
  }

  .el-form-item {
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.1);
    border-radius: 5px;
    color: #454545;
  }

  .copyright {
    width: 100%;
    position: absolute;
    bottom: 0;
    font-size: 12px;
    text-align: center;
    color: #cccccc;
  }
}
</style>

<style lang="scss" scoped>
$bg: #2d3a4b;
$dark_gray: #889aa4;
$light_gray: #eee;

.login-container {
  min-height: 100%;
  width: 100%;
  background-color: $bg;
  overflow: hidden;

  .login-form {
    position: relative;
    width: 520px;
    max-width: 100%;
    padding: 160px 35px 0;
    margin: 0 auto;
    overflow: hidden;
  }

  .tips {
    font-size: 14px;
    color: #fff;
    margin-bottom: 10px;

    span {
      &:first-of-type {
        margin-right: 16px;
      }
    }
  }

  .svg-container {
    padding: 5px 10px;
    color: $dark_gray;
    vertical-align: middle;
    width: 30px;
    display: inline-block;
  }

  .title-container {
    position: relative;

    .title {
      font-size: 26px;
      color: $light_gray;
      margin: 0px auto 40px auto;
      text-align: center;
      font-weight: bold;
    }
  }

  .show-pwd {
    position: absolute;
    right: 10px;
    top: 7px;
    font-size: 16px;
    color: $dark_gray;
    cursor: pointer;
    user-select: none;
  }

  .captcha {
    position: absolute;
    right: 0;
    top: 0;

    img {
      height: 42px;
      cursor: pointer;
      vertical-align: middle;
    }
  }
}
</style>
