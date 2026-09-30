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
import { parseTime } from "../utils/time";

defineOptions({ name: "Cephalosome" });

// 获取当前时间
const dateTime = ref("加载中...");
const getCurrentTime = () =>
  (dateTime.value = parseTime(new Date(), "YYYY-MM-DD HH:mm:ss 周dd A "));

// 使用定时器钩子更新时间
useKeepTicking(getCurrentTime, 1000);
</script>
