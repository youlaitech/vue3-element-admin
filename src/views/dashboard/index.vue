<script setup lang="ts">
defineOptions({
  name: "Dashboard",
  inheritAttrs: false,
});

import { useUserStore } from "@/store/modules/user";
import { useTransition, TransitionPresets } from "@vueuse/core";

const userStore = useUserStore();
const date: Date = new Date();

const greetings = computed(() => {
  const hours = date.getHours();
  if (hours >= 6 && hours < 8) {
    return "晨起披衣出草堂，轩窗已自喜微凉🌅！";
  } else if (hours >= 8 && hours < 12) {
    return "上午好🌞！";
  } else if (hours >= 12 && hours < 18) {
    return "下午好☕！";
  } else if (hours >= 18 && hours < 24) {
    return "晚上好🌃！";
  } else if (hours >= 0 && hours < 6) {
    return "偷偷向银河要了一把碎星，只等你闭上眼睛撒入你的梦中，晚安🌛！";
  }
});

const duration = 5000;

// 收入金额
const amount = ref(0);
const amountOutput = useTransition(amount, {
  duration: duration,
  transition: TransitionPresets.easeOutExpo,
});
amount.value = 2000;

// 访问数
const visitCount = ref(0);
const visitCountOutput = useTransition(visitCount, {
  duration: duration,
  transition: TransitionPresets.easeOutExpo,
});
visitCount.value = 2000;

//消息数
const messageCount = ref(0);
const messageCountOutput = useTransition(messageCount, {
  duration: duration,
  transition: TransitionPresets.easeOutExpo,
});
messageCount.value = 2000;

// 订单数
const orderCount = ref(0);
const orderCountOutput = useTransition(orderCount, {
  duration: duration,
  transition: TransitionPresets.easeOutExpo,
});
orderCount.value = 2000;
</script>

<template>
  <div class="dashboard-container">
    <!-- github角标 -->
    <github-corner class="github-corner" />

    <!-- 用户信息 -->
    <el-row class="mb-8">
      <el-card class="w-full">
        <div class="flex justify-between flex-wrap">
          <div class="flex items-center">
            <img
              class="user-avatar"
              :src="userStore.user.avatar + '?imageView2/1/w/80/h/80'"
            />
            <span class="ml-[10px] text-[16px]">
              {{ userStore.user.nickname }}
            </span>
          </div>

          <div class="leading-[40px]">
            {{ greetings }}
          </div>

          <div class="space-x-2 flex items-center justify-end">
            <el-link
              target="_blank"
              type="danger"
              href="https://blog.csdn.net/u013737132/article/details/130191394"
              >💥官方从零到一文档</el-link
            >
            <el-divider direction="vertical" />
            <el-link
              target="_blank"
              type="success"
              href="https://gitee.com/youlaiorg"
              >Gitee</el-link
            >
            <el-divider direction="vertical" />
            <el-link
              target="_blank"
              type="primary"
              href="https://github.com/youlaitech"
              >GitHub
            </el-link>
          </div>
        </div>
      </el-card>
    </el-row>

    <!-- 数据卡片 -->
    <el-row :gutter="40" class="mb-4">
      <el-col :xs="24" :sm="12" :lg="6" class="mb-4">
        <el-card shadow="never">
          <template #header>
            <div class="flex items-center justify-between">
              <span class="text-[var(--el-text-color-secondary)]">访问数</span>
              <el-tag type="success">日</el-tag>
            </div>
          </template>

          <div class="flex items-center justify-between mt-5">
            <div class="text-lg text-right">
              {{ Math.round(visitCountOutput) }}
            </div>
            <svg-icon icon-class="visit" size="2em" />
          </div>

          <div
            class="flex items-center justify-between mt-5 text-sm text-[var(--el-text-color-secondary)]"
          >
            <span> 总访问数 </span>
            <span> {{ Math.round(visitCountOutput) }} </span>
          </div>
        </el-card>
      </el-col>

      <!--消息数-->
      <el-col :xs="24" :sm="12" :lg="6" class="mb-4">
        <el-card shadow="never">
          <template #header>
            <div class="flex items-center justify-between">
              <span class="text-[var(--el-text-color-secondary)]">消息数</span>
              <el-tag>周</el-tag>
            </div>
          </template>

          <div class="flex items-center justify-between mt-5">
            <div class="text-lg text-right">
              {{ Math.round(messageCountOutput) }}
            </div>
            <svg-icon icon-class="message" size="2em" />
          </div>

          <div
            class="flex items-center justify-between mt-5 text-sm text-[var(--el-text-color-secondary)]"
          >
            <span> 总消息数 </span>
            <span> {{ Math.round(messageCountOutput) }} </span>
          </div>
        </el-card>
      </el-col>

      <!--收入金额-->
      <el-col :xs="24" :sm="12" :lg="6" class="mb-4">
        <el-card shadow="never">
          <template #header>
            <div class="flex items-center justify-between">
              <span class="text-[var(--el-text-color-secondary)]"
                >收入金额</span
              >
              <el-tag type="warning">月</el-tag>
            </div>
          </template>

          <div class="flex items-center justify-between mt-5">
            <div class="text-lg text-right">
              {{ Math.round(amountOutput) }}
            </div>
            <svg-icon icon-class="money" size="2em" />
          </div>

          <div
            class="flex items-center justify-between mt-5 text-sm text-[var(--el-text-color-secondary)]"
          >
            <span> 总收入金额 </span>
            <span> {{ Math.round(amountOutput) }} </span>
          </div>
        </el-card>
      </el-col>

      <!--订单数-->

      <el-col :xs="24" :sm="12" :lg="6" class="mb-4">
        <el-card shadow="never">
          <template #header>
            <div class="flex items-center justify-between">
              <span class="text-[var(--el-text-color-secondary)]">订单数</span>
              <el-tag type="danger">年</el-tag>
            </div>
          </template>

          <div class="flex items-center justify-between mt-5">
            <div class="text-lg text-right">
              {{ Math.round(orderCountOutput) }}
            </div>
            <svg-icon icon-class="cart" size="2em" />
          </div>

          <div
            class="flex items-center justify-between mt-5 text-sm text-[var(--el-text-color-secondary)]"
          >
            <span> 总订单数 </span>
            <span> {{ Math.round(orderCountOutput) }} </span>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Echarts 图表 -->
    <el-row :gutter="40">
      <el-col :sm="24" :lg="8" class="mb-2">
        <BarChart
          id="barChart"
          height="400px"
          width="100%"
          class="bg-[var(--el-bg-color-overlay)]"
        />
      </el-col>

      <el-col :xs="24" :sm="12" :lg="8" class="mb-2">
        <PieChart
          id="pieChart"
          height="400px"
          width="100%"
          class="bg-[var(--el-bg-color-overlay)]"
        />
      </el-col>

      <el-col :xs="24" :sm="12" :lg="8" class="mb-2">
        <RadarChart
          id="radarChart"
          height="400px"
          width="100%"
          class="bg-[var(--el-bg-color-overlay)]"
        />
      </el-col>
    </el-row>
  </div>
</template>

<style lang="scss" scoped>
.dashboard-container {
  position: relative;
  padding: 24px;

  .user-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
  }

  .github-corner {
    position: absolute;
    top: 0;
    right: 0;
    z-index: 1;
    border: 0;
  }

  .data-box {
    display: flex;
    justify-content: space-between;
    padding: 20px;
    font-weight: bold;
    color: var(--el-text-color-regular);
    background: var(--el-bg-color-overlay);
    border-color: var(--el-border-color);
    box-shadow: var(--el-box-shadow-dark);
  }

  .svg-icon {
    fill: currentcolor !important;
  }
}
</style>
