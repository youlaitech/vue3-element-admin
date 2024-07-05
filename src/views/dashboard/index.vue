<template>
  <div class="dashboard-container">
    <!-- github角标 -->
    <github-corner class="github-corner" />

    <el-card shadow="never">
      <el-row justify="space-between">
        <el-col :span="18" :xs="24">
          <div class="flex h-full items-center">
            <img
              class="w-20 h-20 mr-5 rounded-full"
              :src="userStore.user.avatar + '?imageView2/1/w/80/h/80'"
            />
            <div>
              <p>{{ greetings }}</p>
              <p class="text-sm text-gray">
                今日天气晴朗，气温在15℃至25℃之间，东南风。
              </p>
            </div>
          </div>
        </el-col>

        <el-col :span="6" :xs="24">
          <div class="flex h-full items-center justify-around">
            <el-statistic
              v-for="item in statisticData"
              :key="item.key"
              :value="item.value"
            >
              <template #title>
                <div class="flex items-center">
                  <svg-icon :icon-class="item.iconClass" size="20px" />
                  <span class="text-[16px] ml-1">{{ item.title }}</span>
                </div>
              </template>
              <template v-if="item.suffix" #suffix>/100</template>
            </el-statistic>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 数据卡片 -->
    <el-row :gutter="10" class="mt-5">
      <el-col :xs="24" :sm="12" :lg="6">
        <el-card shadow="never">
          <template #header>
            <div class="flex-x-between">
              <span class="text-[var(--el-text-color-secondary)]"
                >在线用户</span
              >
              <el-tag type="success" size="small">-</el-tag>
            </div>
          </template>

          <div class="flex-x-between mt-2">
            <span class="text-lg"> 1</span>
            <svg-icon icon-class="item.iconClass" size="2em" />
          </div>
          <div
            class="flex-x-between mt-2 text-sm text-[var(--el-text-color-secondary)]"
          >
            <span> 总用户数 </span>
            <span>5 </span>
          </div>
        </el-card>
      </el-col>

      <el-col
        :xs="24"
        :sm="12"
        :lg="6"
        v-for="(item, index) in visitStatsList"
        :key="index"
      >
        <el-skeleton :loading="loading" animated>
          <template #template>
            <div>
              <el-skeleton-item variant="text" style="width: 60%" />
              <div class="mt-2">
                <el-skeleton-item variant="text" style="width: 40%" />
                <el-skeleton-item
                  variant="rect"
                  style="float: right; width: 2em; height: 2em"
                />
              </div>
              <div class="mt-2">
                <el-skeleton-item variant="text" style="width: 100%" />
                <el-skeleton-item variant="text" style="width: 80%" />
              </div>
            </div>
          </template>
          <template v-if="!loading">
            <el-card shadow="never">
              <template #header>
                <div class="flex-x-between">
                  <span class="text-[var(--el-text-color-secondary)]">{{
                    item.title
                  }}</span>
                  <el-tag type="primary" size="small"> 日 </el-tag>
                </div>
              </template>

              <div class="flex-x-between mt-2">
                <div class="flex-y-center">
                  <span class="text-lg"> {{ item.todayCount }}</span>
                  <span
                    v-if="item.growthRate"
                    :class="[
                      'text-xs',
                      'ml-2',
                      item.growthRate > 0 ? 'color-red' : 'color-green',
                    ]"
                  >
                    <i-ep-top v-if="item.growthRate > 0" />
                    <i-ep-bottom v-else-if="item.growthRate < 0" />
                    {{ Math.abs(item.growthRate * 100).toFixed(2) }}%
                  </span>
                </div>
                <svg-icon :icon-class="item.type" size="2em" />
              </div>

              <div
                class="flex-x-between mt-2 text-sm text-[var(--el-text-color-secondary)]"
              >
                <span>总{{ item.title }} </span>
                <span> {{ item.totalCountOutput }} </span>
              </div>
            </el-card>
          </template>
        </el-skeleton>
      </el-col>
    </el-row>

    <!-- Echarts 图表 -->
    <el-row :gutter="10" class="mt-5">
      <el-col :xs="24" :span="16">
        <VisitTrend id="VisitTrend" width="100%" height="400px" />
      </el-col>
      <el-col :xs="24" :span="8">
        <el-card>
          <template #header>
            <span> 通知公告</span>
          </template>

          <el-scrollbar height="400px">
            <div v-for="(item, index) in notices" :key="index" class="mb-2">
              <el-alert :title="item.title" :closable="false" class="mb-2">
                <template #default>{{ item.description }} </template>
              </el-alert>
            </div>
          </el-scrollbar>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: "Dashboard",
  inheritAttrs: false,
});

import type { EpPropMergeType } from "element-plus/es/utils/vue/props/types";

import { useUserStore } from "@/store/modules/user";
import { useTransition, TransitionPresets } from "@vueuse/core";

import StatsAPI, { VisitStatsVO } from "@/api/log";
const userStore = useUserStore();

const date: Date = new Date();
const greetings = computed(() => {
  const hours = date.getHours();
  if (hours >= 6 && hours < 8) {
    return "晨起披衣出草堂，轩窗已自喜微凉🌅！";
  } else if (hours >= 8 && hours < 12) {
    return "上午好，" + userStore.user.nickname + "！";
  } else if (hours >= 12 && hours < 18) {
    return "下午好，" + userStore.user.nickname + "！";
  } else if (hours >= 18 && hours < 24) {
    return "晚上好，" + userStore.user.nickname + "！";
  } else {
    return "偷偷向银河要了一把碎星，只等你闭上眼睛撒入你的梦中，晚安🌛！";
  }
});

// 右上角数量
const statisticData = ref([
  {
    value: 99,
    iconClass: "message",
    title: "消息",
    key: "message",
  },
  {
    value: 50,
    iconClass: "todolist",
    title: "待办",
    suffix: "/100",
    key: "upcoming",
  },
  {
    value: 10,
    iconClass: "project",
    title: "项目",
    key: "project",
  },
]);

const notices = ref([
  {
    title: "v2.12.0",
    description: "新增系统日志，访问趋势统计等功能。",
  },
  {
    title: "v2.11.5",
    description: "修复了一些问题，优化了一些代码。",
  },
  {
    title: "v2.11.4",
    description: "修复了一些问题，优化了一些代码。",
  },
  {
    title: "v2.11.3",
    description: "修复了一些问题，优化了一些代码。",
  },
  {
    title: "v2.11.2",
    description: "修复了一些问题，优化了一些代码。",
  },
  {
    title: "v2.11.1",
    description: "修复了一些问题，优化了一些代码。",
  },
]);

const loading = ref(true);

const visitStatsList = ref<VisitStatsVO[] | null>(Array(3).fill({}));

const loadVisitStatsData = async () => {
  const list = await StatsAPI.getVisitStats();

  if (list) {
    visitStatsList.value = list;
    // 初始化动画输出
    list.forEach((item) => {
      item.totalCountOutput = useTransition(item.totalCount, {
        duration: 1000,
        transition: TransitionPresets.easeOutExpo,
      }).value;
    });
    loading.value = false;
  }
};

onMounted(() => {
  loadVisitStatsData();
});
</script>

<style lang="scss" scoped>
.dashboard-container {
  position: relative;
  padding: 24px;

  .github-corner {
    position: absolute;
    top: 0;
    right: 0;
    z-index: 1;
    border: 0;
  }
}
</style>
