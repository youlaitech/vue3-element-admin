<template>
  <div class="qr-login">
    <h2 class="qr-login__title">扫码登录</h2>
    <p class="qr-login__desc">使用 youlai-app 扫描下方二维码登录</p>

    <div class="qr-login__board">
      <div v-if="state === 'loading'" class="qr-login__mask">
        <el-icon class="is-loading"><Loading /></el-icon>
        <span>二维码生成中...</span>
      </div>

      <div v-else-if="state === 'scanned'" class="qr-login__mask qr-login__mask--info">
        <el-avatar :size="56" :src="avatar || undefined">
          <el-icon><User /></el-icon>
        </el-avatar>
        <span class="qr-login__mask-text">{{ nickname }} 已扫码</span>
        <span class="qr-login__mask-hint">请在手机上确认登录</span>
      </div>

      <div v-else-if="state === 'expired'" class="qr-login__mask">
        <el-icon :size="28"><CircleClose /></el-icon>
        <span>二维码已过期</span>
        <el-button type="primary" link @click="start">点击刷新</el-button>
      </div>

      <div v-else-if="state === 'canceled'" class="qr-login__mask">
        <el-icon :size="28"><CircleClose /></el-icon>
        <span>已取消登录</span>
        <el-button type="primary" link @click="start">重新生成</el-button>
      </div>

      <canvas v-show="state === 'waiting'" ref="canvasRef" class="qr-login__canvas" />
    </div>

    <div class="qr-login__footer">
      <el-button text @click="emit('switch', 'login')">
        <el-icon><ArrowLeft /></el-icon>
        返回账号登录
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft, CircleClose, Loading, User } from "@element-plus/icons-vue";
import QRCode from "qrcode";
import AuthAPI, { type QrCodeStatusResult } from "@/api/auth";
import { useUserStore } from "@/stores";
import router from "@/router";
import { useRoute } from "vue-router";
import { onBeforeUnmount, onMounted, ref } from "vue";

// 界面状态机：loading(生成中) → waiting(待扫码) → scanned(已扫码待确认)
// → done(已登录) / expired(过期或已使用) / canceled(APP 取消)
type State = "loading" | "waiting" | "scanned" | "expired" | "canceled" | "done";

const emit = defineEmits<{ (e: "switch", mode: "login"): void }>();

const userStore = useUserStore();
const route = useRoute();

// 二维码画布元素引用，renderQrCode 把 ticket 绘进它
const canvasRef = ref<HTMLCanvasElement>();
// 当前界面状态，驱动模板中遮罩层的显隐
const state = ref<State>("loading");
// 扫码用户脱敏昵称与头像，scanned 状态展示
const nickname = ref("");
const avatar = ref("");

// 当前票据，轮询与登录换令牌都依赖它
let ticket = "";
// 轮询定时器句柄，组件卸载或停止轮询时清空
let pollTimer: ReturnType<typeof setTimeout> | null = null;

// 轮询间隔（毫秒）
const QR_POLL_INTERVAL = 2000;

// 申请票据并渲染二维码，开始轮询
async function start() {
  stopPolling();
  state.value = "loading";
  nickname.value = "";
  avatar.value = "";
  try {
    const res = await AuthAPI.qrGenerate();
    ticket = res.ticket;
    await renderQrCode(ticket);
    state.value = "waiting";
    startPolling();
  } catch {
    state.value = "expired";
  }
}

async function renderQrCode(payload: string) {
  if (!canvasRef.value) return;
  await QRCode.toCanvas(canvasRef.value, payload, { width: 220, margin: 1 });
}

function startPolling() {
  stopPolling();
  pollTimer = setTimeout(pollOnce, QR_POLL_INTERVAL);
}

function stopPolling() {
  if (pollTimer) {
    clearTimeout(pollTimer);
    pollTimer = null;
  }
}

async function pollOnce() {
  if (!ticket) return;
  try {
    const res = await AuthAPI.qrStatus(ticket);
    handleStatus(res);
  } catch {
    startPolling();
  }
}

// 根据后端返回状态推进界面与下一步动作
function handleStatus(res: QrCodeStatusResult) {
  switch (res.status) {
    case "WAITING":
      state.value = "waiting";
      startPolling();
      break;
    case "SCANNED":
      state.value = "scanned";
      nickname.value = res.nickname || "";
      avatar.value = res.avatar || "";
      startPolling();
      break;
    case "CONFIRMED":
      doLogin();
      break;
    case "CANCELED":
      state.value = "canceled";
      break;
    case "LOGGED_IN":
    case "EXPIRED":
    default:
      state.value = "expired";
      break;
  }
}

async function doLogin() {
  state.value = "done";
  stopPolling();
  try {
    await userStore.loginByQrCode(ticket);
    const redirectPath = (route.query.redirect as string) || "/";
    await router.push(decodeURIComponent(redirectPath));
  } catch {
    state.value = "expired";
  }
}

onMounted(start);
onBeforeUnmount(stopPolling);
</script>

<style lang="scss" scoped>
.qr-login {
  width: 100%;

  &__title {
    margin: 0 0 4px;
    font-size: 34px;
    font-weight: 750;
    color: var(--el-text-color-primary);
  }

  &__desc {
    margin: 8px 0 24px;
    font-size: 14px;
    color: var(--el-text-color-placeholder);
  }

  &__board {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 240px;
    height: 240px;
    margin: 0 auto;
    background: var(--el-fill-color-blank);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 12px;
  }

  &__canvas {
    display: block;
    border-radius: 8px;
  }

  &__mask {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: center;
    justify-content: center;
    padding: 16px;
    font-size: 13px;
    color: var(--el-text-color-regular);
    background: rgb(255 255 255 / 90%);
    backdrop-filter: blur(2px);

    &--info {
      gap: 4px;
    }
  }

  &__mask-text {
    font-size: 14px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  &__mask-hint {
    font-size: 12px;
    color: var(--el-text-color-placeholder);
  }

  &__footer {
    display: flex;
    justify-content: center;
    margin-top: 20px;
  }
}
</style>
