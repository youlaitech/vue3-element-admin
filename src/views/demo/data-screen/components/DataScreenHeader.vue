<template>
  <!-- 头部区域 -->
  <div class="dataScreen-header">
    <!-- 头部内容 -->
    <div flex-center h-full overflow-hidden>
      <!-- 左侧内容 -->
      <div class="leftHead"></div>
      <!-- 中间标题 -->
      <div class="title">新能源汽车联网平台数据概览</div>
      <!-- 右侧内容 -->
      <div class="rightHead">
        <!-- 实时时间 -->
        <div class="dateTime">{{ dateTime }}</div>
      </div>
    </div>
    <!-- 装饰线 -->
    <div class="lines" left="[10%]" />
    <div class="lines" right="[10%]" rotate="180" />
    <div class="ray" />
  </div>
</template>
<script lang="ts" setup>
import { useKeepTicking } from "../composables/useKeepTicking";

defineOptions({ name: "DataScreenHeader" });

/**
 * 生成包含日期、时间和星期的大屏时钟文本。
 */
function formatClock(date: Date): string {
  const week = ["日", "一", "二", "三", "四", "五", "六"][date.getDay()];
  /**
   * 将时间分量补齐为两位数字。
   */
  const pad = (n: number) => String(n).padStart(2, "0");
  const meridiem = date.getHours() < 12 ? "上午" : "下午";

  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
    `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())} ` +
    `周${week} ${meridiem}`
  );
}

const dateTime = ref("加载中...");
/**
 * 更新大屏日期和时间。
 */
const updateCurrentTime = () => (dateTime.value = formatClock(new Date()));

// 使用定时器钩子更新时间
useKeepTicking(updateCurrentTime, 1000);
</script>
