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

defineOptions({ name: "Cephalosome" });

// 看板时间格式：YYYY-MM-DD HH:mm:ss 周X 上午/下午
function formatClock(date: Date): string {
  const week = ["日", "一", "二", "三", "四", "五", "六"][date.getDay()];
  const pad = (n: number) => String(n).padStart(2, "0");
  const meridiem = date.getHours() < 12 ? "上午" : "下午";

  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
    `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())} ` +
    `周${week} ${meridiem}`
  );
}

// 获取当前时间
const dateTime = ref("加载中...");
const getCurrentTime = () => (dateTime.value = formatClock(new Date()));

// 使用定时器钩子更新时间
useKeepTicking(getCurrentTime, 1000);
</script>
