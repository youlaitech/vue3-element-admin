<template>
  <header class="flex shrink-0 items-center gap-4">
    <div class="flex w-72 items-center">
      <div class="screen__clock">
        <span class="screen__clock-time">{{ time }}</span>
        <span class="screen__clock-divider" />
        <div class="screen__clock-meta">
          <span class="screen__clock-date">{{ date }}</span>
          <span class="screen__clock-week">{{ weekday }}</span>
        </div>
      </div>
    </div>

    <div class="flex-1 text-center">
      <h1 class="screen__title m-0">{{ title }}</h1>
      <p class="screen__subtitle m-0">{{ subtitle }}</p>
    </div>

    <div class="flex w-72 items-center justify-end">
      <el-tooltip :content="isFullscreen ? '退出全屏' : '全屏查看'" placement="bottom">
        <el-button class="screen__action" circle @click="emit('toggleFullscreen')">
          <el-icon :size="16"><FullScreen /></el-icon>
        </el-button>
      </el-tooltip>
    </div>
  </header>
</template>

<script setup lang="ts">
defineOptions({
  name: "ScreenHeader",
});

defineProps<{
  /** 主标题 */
  title: string;
  /** 英文副标题 */
  subtitle: string;
  /** 当前是否处于全屏，用于切换按钮提示 */
  isFullscreen: boolean;
}>();

const emit = defineEmits<{
  toggleFullscreen: [];
}>();

const WEEKDAYS = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

const date = ref("");
const weekday = ref("");
const time = ref("");

/**
 * 刷新当前时间
 */
function updateClock(): void {
  const now = new Date();
  // 数值补零为两位
  const pad = (value: number) => String(value).padStart(2, "0");
  date.value = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  weekday.value = WEEKDAYS[now.getDay()];
  time.value = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}

let timer: number | undefined;

onMounted(() => {
  updateClock();
  timer = window.setInterval(updateClock, 1000);
});

onBeforeUnmount(() => {
  window.clearInterval(timer);
});
</script>
