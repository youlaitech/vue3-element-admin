<template>
  <div class="relative p-5">
    <!-- github 角标 -->
    <github-corner class="absolute top-0 right-0 z-1 border-0" />

    <el-card shadow="never">
      <div class="flex flex-wrap">
        <!-- 左侧问候语区域 -->
        <div class="flex-1 flex items-start">
          <div style="width: 80px; height: 80px; overflow: hidden; border-radius: 50%">
            <img
              :src="userStore.userInfo.avatar + '?imageView2/1/w/80/h/80'"
              class="w80px h80px rounded-full"
              style="width: 100%; height: 100%; object-fit: cover; object-position: center"
            />
          </div>
          <div class="ml-5">
            <p class="text-base font-semibold text-[--el-text-color-primary] leading-tight">
              {{ greetings }}
            </p>
            <p class="text-sm text-gray">今日天气晴朗，气温在15℃至25℃之间，东南风。</p>
          </div>
        </div>

        <!-- 右侧图标区域 - PC端-->
        <div class="hidden sm:block">
          <div class="flex items-end space-x-6">
            <!-- 仓库 -->
            <div>
              <div class="font-bold color-#ff9a2e text-sm flex items-center">
                <el-icon class="mr-2px"><Folder /></el-icon>
                仓库
              </div>
              <div class="mt-3 whitespace-nowrap">
                <el-link href="https://gitee.com/youlaiorg/vue3-element-admin" target="_blank">
                  <div class="i-svg:gitee text-lg color-#F76560" />
                </el-link>
                <el-divider direction="vertical" />
                <el-link href="https://github.com/youlaitech/vue3-element-admin" target="_blank">
                  <div class="i-svg:github text-lg color-#4080FF" />
                </el-link>
                <el-divider direction="vertical" />
                <el-link href="https://gitcode.com/youlai/vue3-element-admin" target="_blank">
                  <div class="i-svg:gitcode text-lg color-#FF9A2E" />
                </el-link>
              </div>
            </div>

            <!-- 文档 -->
            <div>
              <div class="font-bold color-#4080ff text-sm flex items-center">
                <el-icon class="mr-2px"><Document /></el-icon>
                文档
              </div>
              <div class="mt-3 whitespace-nowrap">
                <el-link href="https://juejin.cn/post/7228990409909108793" target="_blank">
                  <div class="i-svg:juejin text-lg" />
                </el-link>
                <el-divider direction="vertical" />
                <el-link
                  href="https://youlai.blog.csdn.net/article/details/130191394"
                  target="_blank"
                >
                  <div class="i-svg:csdn text-lg" />
                </el-link>
                <el-divider direction="vertical" />
                <el-link href="https://www.cnblogs.com/haoxianrui/p/17331952.html" target="_blank">
                  <div class="i-svg:cnblogs text-lg" />
                </el-link>
              </div>
            </div>

            <!-- 视频 -->
            <div>
              <div class="font-bold color-#f76560 text-sm flex items-center">
                <el-icon class="mr-2px"><VideoCamera /></el-icon>
                视频
              </div>
              <div class="mt-3 whitespace-nowrap">
                <el-link href="https://www.bilibili.com/video/BV1eFUuYyEFj" target="_blank">
                  <div class="i-svg:bilibili text-lg" />
                </el-link>
              </div>
            </div>
          </div>
        </div>

        <!-- 移动端图标区域-->
        <div class="w-full sm:hidden mt-3">
          <div class="flex justify-end space-x-4 overflow-x-auto">
            <!-- 仓库图标 -->
            <el-link href="https://gitee.com/youlaiorg/vue3-element-admin" target="_blank">
              <div class="i-svg:gitee text-lg color-#F76560" />
            </el-link>
            <el-link href="https://github.com/youlaitech/vue3-element-admin" target="_blank">
              <div class="i-svg:github text-lg color-#4080FF" />
            </el-link>
            <el-link href="https://gitcode.com/youlai/vue3-element-admin" target="_blank">
              <div class="i-svg:gitcode text-lg color-#FF9A2E" />
            </el-link>

            <!-- 文档图标 -->
            <el-link href="https://juejin.cn/post/7228990409909108793" target="_blank">
              <div class="i-svg:juejin text-lg" />
            </el-link>
            <el-link href="https://youlai.blog.csdn.net/article/details/130191394" target="_blank">
              <div class="i-svg:csdn text-lg" />
            </el-link>
            <el-link href="https://www.cnblogs.com/haoxianrui/p/17331952.html" target="_blank">
              <div class="i-svg:cnblogs text-lg" />
            </el-link>

            <!-- 视频图标 -->
            <el-link href="https://www.bilibili.com/video/BV1eFUuYyEFj" target="_blank">
              <div class="i-svg:bilibili text-lg" />
            </el-link>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 数据统计 -->
    <el-row :gutter="10" class="mt-5">
      <!-- 在线用户数量 -->
      <el-col :span="8" :xs="24" class="mb-xs-3">
        <el-card
          shadow="never"
          class="h-full transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
        >
          <template #header>
            <div class="flex-x-between">
              <span class="text-xs font-medium text-[--el-text-color-secondary]">在线用户</span>
              <el-tag
                size="small"
                :type="
                  isConnected ? 'success' : connectionState === 'CONNECTING' ? 'warning' : 'danger'
                "
                effect="plain"
                class="inline-flex"
              >
                SSE {{ sseStatusText }}
              </el-tag>
            </div>
          </template>

          <div class="mt-2 flex-1 flex items-end">
            <div class="flex items-baseline gap-1.5">
              <span class="text-xl font-semibold tracking-wide">{{ onlineUserCount }}</span>
              <span class="text-xs text-[--el-text-color-secondary]">人</span>
            </div>
          </div>

          <div class="mt-2 flex justify-between items-center">
            <span class="text-sm text-gray">更新时间</span>
            <span class="text-sm">{{ formattedTime }}</span>
          </div>
        </el-card>
      </el-col>

      <!-- 访客量UV) -->
      <el-col :span="8" :xs="24" class="mb-xs-3">
        <el-skeleton :loading="visitStatsLoading" :rows="5" animated>
          <template #template>
            <el-card>
              <template #header>
                <div>
                  <el-skeleton-item variant="h3" style="width: 40%" />
                  <el-skeleton-item variant="rect" style="float: right; width: 1em; height: 1em" />
                </div>
              </template>

              <div class="flex-x-between">
                <el-skeleton-item variant="text" style="width: 30%" />
                <el-skeleton-item variant="circle" style="width: 2em; height: 2em" />
              </div>
              <div class="mt-5 flex-x-between">
                <el-skeleton-item variant="text" style="width: 50%" />
                <el-skeleton-item variant="text" style="width: 1em" />
              </div>
            </el-card>
          </template>
          <template v-if="!visitStatsLoading">
            <el-card
              shadow="never"
              class="h-full transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
            >
              <template #header>
                <div class="flex-x-between">
                  <span class="text-xs font-medium text-[--el-text-color-secondary]">
                    访客数 UV
                  </span>
                  <el-tag type="success" size="small">日</el-tag>
                </div>
              </template>

              <div class="mt-2 flex-1 flex items-end">
                <div class="flex items-baseline gap-1.5">
                  <span class="text-xl font-semibold tracking-wide">
                    {{ displayTransitionUvCount }}
                  </span>
                  <span
                    v-if="uvGrowthText !== null"
                    :class="['text-xs', computeGrowthRateClass(visitStatsData.uvGrowthRate)]"
                  >
                    <el-icon
                      v-if="
                        visitStatsData.uvGrowthRate !== undefined &&
                        visitStatsData.uvGrowthRate !== null
                      "
                    >
                      <Top v-if="visitStatsData.uvGrowthRate > 0" />
                      <Bottom v-else-if="visitStatsData.uvGrowthRate < 0" />
                    </el-icon>
                    {{ uvGrowthText }}
                  </span>
                </div>
              </div>

              <div class="mt-2 flex justify-between items-center">
                <span class="text-sm text-gray">总访客数</span>
                <span class="text-sm">{{ displayTransitionTotalUvCount }}</span>
              </div>
            </el-card>
          </template>
        </el-skeleton>
      </el-col>

      <!-- 浏览量(PV) -->
      <el-col :span="8" :xs="24">
        <el-skeleton :loading="visitStatsLoading" :rows="5" animated>
          <template #template>
            <el-card>
              <template #header>
                <div>
                  <el-skeleton-item variant="h3" style="width: 40%" />
                  <el-skeleton-item variant="rect" style="float: right; width: 1em; height: 1em" />
                </div>
              </template>

              <div class="flex-x-between">
                <el-skeleton-item variant="text" style="width: 30%" />
                <el-skeleton-item variant="circle" style="width: 2em; height: 2em" />
              </div>
              <div class="mt-5 flex-x-between">
                <el-skeleton-item variant="text" style="width: 50%" />
                <el-skeleton-item variant="text" style="width: 1em" />
              </div>
            </el-card>
          </template>
          <template v-if="!visitStatsLoading">
            <el-card
              shadow="never"
              class="h-full transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
            >
              <template #header>
                <div class="flex-x-between">
                  <span class="text-xs font-medium text-[--el-text-color-secondary]">
                    浏览量 PV
                  </span>
                  <el-tag type="primary" size="small">日</el-tag>
                </div>
              </template>

              <div class="mt-2 flex-1 flex items-end">
                <div class="flex items-baseline gap-1.5">
                  <span class="text-xl font-semibold tracking-wide">
                    {{ displayTransitionPvCount }}
                  </span>
                  <span
                    v-if="pvGrowthText !== null"
                    :class="['text-xs', computeGrowthRateClass(visitStatsData.pvGrowthRate)]"
                  >
                    <el-icon
                      v-if="
                        visitStatsData.pvGrowthRate !== undefined &&
                        visitStatsData.pvGrowthRate !== null
                      "
                    >
                      <Top v-if="visitStatsData.pvGrowthRate > 0" />
                      <Bottom v-else-if="visitStatsData.pvGrowthRate < 0" />
                    </el-icon>
                    {{ pvGrowthText }}
                  </span>
                </div>
              </div>

              <div class="mt-2 flex justify-between items-center">
                <span class="text-sm text-gray">总浏览量</span>
                <span class="text-sm">{{ displayTransitionTotalPvCount }}</span>
              </div>
            </el-card>
          </template>
        </el-skeleton>
      </el-col>
    </el-row>

    <el-row :gutter="10" class="mt-5">
      <!-- 访问趋势统计图-->
      <el-col :xs="24" :span="16">
        <el-card>
          <template #header>
            <div class="flex-x-between">
              <span>访问趋势</span>
              <el-radio-group v-model="visitTrendDateRange" size="small">
                <el-radio-button label="近7天" :value="7" />
                <el-radio-button label="近30天" :value="30" />
              </el-radio-group>
            </div>
          </template>
          <ECharts :options="visitTrendChartOptions" height="400px" />
        </el-card>
      </el-col>
      <!-- 最近访问 -->
      <el-col :xs="24" :span="8">
        <el-card>
          <template #header>
            <div class="flex-x-between">
              <span class="font-semibold">最近访问</span>
              <el-button
                v-if="recentMenus.length > 0"
                type="primary"
                link
                size="small"
                @click="clearRecentMenus"
              >
                清空
              </el-button>
            </div>
          </template>

          <div class="min-h-[400px] flex flex-col">
            <!-- 宫格显示 -->
            <div v-if="recentMenus.length > 0" class="grid grid-cols-2 gap-3">
              <div
                v-for="item in recentMenus"
                :key="item.path"
                class="group flex items-center gap-2 px-3 py-2.5 bg-[--el-fill-color-lighter] rounded-lg cursor-pointer transition-all duration-200 hover:bg-[--el-color-primary-light-8]"
                @click="router.push(item.path)"
              >
                <!-- 图标 -->
                <div class="shrink-0 w-8 h-8 flex items-center justify-center">
                  <el-icon
                    v-if="item.icon?.startsWith('el-icon-')"
                    class="text-lg text-[--el-color-primary]"
                  >
                    <component :is="item.icon.replace('el-icon-', '')" />
                  </el-icon>
                  <div
                    v-else-if="item.icon"
                    :class="`i-svg:${item.icon} text-lg text-[--el-color-primary]`"
                  />
                  <el-icon v-else class="text-lg text-[--el-color-primary]"><Menu /></el-icon>
                </div>
                <!-- 标题 -->
                <span class="text-sm truncate flex-1 leading-tight">
                  {{ item.title }}
                </span>
              </div>
            </div>

            <!-- 空状态 -->
            <div v-else class="flex flex-col items-center justify-center flex-1 py-16">
              <el-icon :size="48" class="text-[--el-text-color-placeholder] mb-4">
                <Clock />
              </el-icon>
              <p class="text-sm text-[--el-text-color-secondary] mb-2">暂无访问记录</p>
              <p class="text-xs text-[--el-text-color-placeholder]">访问的页面会自动记录在这里</p>
            </div>
          </div>
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

import { dayjs } from "element-plus";
import { ref } from "vue";
import { useRouter } from "vue-router";
import LogAPI from "@/api/system/log";
import type { VisitStatsDetail, VisitTrendDetail } from "@/api/system/log";
import { useUserStore } from "@/store/modules/user";
import { formatGrowthRate } from "@/utils";
import { useTransition, useDateFormat } from "@vueuse/core";
import { Clock, Menu } from "@element-plus/icons-vue";
import { useOnlineCount, useRecentMenus } from "@/composables";

const router = useRouter();

// 在线用户数量组件相关
const { onlineUserCount, lastUpdateTime, isConnected, connectionState } = useOnlineCount();

// 最近访问菜单
const { recentMenus, clearRecentMenus } = useRecentMenus();

// 格式化时间戳
const formattedTime = computed(() => {
  if (!lastUpdateTime.value) return "--";
  return useDateFormat(lastUpdateTime, "HH:mm:ss").value;
});

const sseStatusText = computed(() => {
  if (!isConnected.value) {
    return connectionState.value === "CONNECTING" ? "连接中" : "未连接";
  }
  return "已连接";
});

const userStore = useUserStore();

// 当前时间（用于计算问候语）
const currentDate = new Date();

// 问候语：根据当前小时返回不同问候语
const greetings = computed(() => {
  const hours = currentDate.getHours();
  const nickname = userStore.userInfo.nickname;
  if (hours >= 6 && hours < 8) {
    return "晨起披衣出草堂，轩窗已自喜微凉🌅！";
  } else if (hours >= 8 && hours < 12) {
    return `上午好，${nickname}！`;
  } else if (hours >= 12 && hours < 18) {
    return `下午好，${nickname}！`;
  } else if (hours >= 18 && hours < 24) {
    return `晚上好，${nickname}！`;
  } else {
    return "偷偷向银河要了一把碎星，只等你闭上眼睛撒入你的梦中，晚安🌛！";
  }
});

// 访客统计数据加载状态
const visitStatsLoading = ref(true);
// 访客统计数据
const visitStatsData = ref<VisitStatsDetail>({
  todayUvCount: 0,
  uvGrowthRate: 0,
  totalUvCount: 0,
  todayPvCount: 0,
  pvGrowthRate: 0,
  totalPvCount: 0,
});

const uvGrowthText = computed(() => {
  if (
    visitStatsData.value.uvGrowthRate === undefined ||
    visitStatsData.value.uvGrowthRate === null
  ) {
    return "--";
  }
  return formatGrowthRate(visitStatsData.value.uvGrowthRate);
});

const pvGrowthText = computed(() => {
  if (
    visitStatsData.value.pvGrowthRate === undefined ||
    visitStatsData.value.pvGrowthRate === null
  ) {
    return "--";
  }
  return formatGrowthRate(visitStatsData.value.pvGrowthRate);
});

// 数字过渡动画
const transitionUvCount = useTransition(
  computed(() => visitStatsData.value.todayUvCount),
  {
    duration: 1000,
    transition: [0.25, 0.1, 0.25, 1.0], // CSS cubic-bezier
  }
);

const transitionTotalUvCount = useTransition(
  computed(() => visitStatsData.value.totalUvCount),
  {
    duration: 1200,
    transition: [0.25, 0.1, 0.25, 1.0],
  }
);

const transitionPvCount = useTransition(
  computed(() => visitStatsData.value.todayPvCount),
  {
    duration: 1000,
    transition: [0.25, 0.1, 0.25, 1.0],
  }
);

const transitionTotalPvCount = useTransition(
  computed(() => visitStatsData.value.totalPvCount),
  {
    duration: 1200,
    transition: [0.25, 0.1, 0.25, 1.0],
  }
);

// 过渡结果可能是 Ref<number>，为模板中使用做类型和格式处理（避免 TS 报错）
const displayTransitionUvCount = computed(() =>
  Math.round(Number((transitionUvCount as any)?.value ?? transitionUvCount))
);
const displayTransitionTotalUvCount = computed(() =>
  Math.round(Number((transitionTotalUvCount as any)?.value ?? transitionTotalUvCount))
);
const displayTransitionPvCount = computed(() =>
  Math.round(Number((transitionPvCount as any)?.value ?? transitionPvCount))
);
const displayTransitionTotalPvCount = computed(() =>
  Math.round(Number((transitionTotalPvCount as any)?.value ?? transitionTotalPvCount))
);

// 访问趋势日期范围（单位：天）
const visitTrendDateRange = ref(7);
// 访问趋势图表配置
const visitTrendChartOptions = ref();

/**
 * 获取访客统计数据
 */
const fetchVisitStatsData = () => {
  LogAPI.getVisitOverview()
    .then((data) => {
      visitStatsData.value = data;
    })
    .finally(() => {
      visitStatsLoading.value = false;
    });
};

/**
 * 获取访问趋势数据，并更新图表配置
 */
const fetchVisitTrendData = () => {
  const startDate = dayjs()
    .subtract(visitTrendDateRange.value - 1, "day")
    .toDate();
  const endDate = new Date();

  LogAPI.getVisitTrend({
    startDate: dayjs(startDate).format("YYYY-MM-DD"),
    endDate: dayjs(endDate).format("YYYY-MM-DD"),
  }).then((data) => {
    updateVisitTrendChartOptions(data);
  });
};

/**
 * 更新访问趋势图表的配置项
 *
 * @param data - 访问趋势数据
 */
const updateVisitTrendChartOptions = (data: VisitTrendDetail) => {
  visitTrendChartOptions.value = {
    tooltip: {
      trigger: "axis",
    },
    legend: {
      data: ["浏览量(PV)", "访客量UV)"],
      bottom: 0,
    },
    grid: {
      left: "1%",
      right: "5%",
      bottom: "10%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: data.dates,
    },
    yAxis: {
      type: "value",
      splitLine: {
        show: true,
        lineStyle: {
          type: "dashed",
        },
      },
    },
    series: [
      {
        name: "浏览量(PV)",
        type: "line",
        data: data.pvList,
        areaStyle: {
          color: "rgba(64, 158, 255, 0.1)",
        },
        smooth: true,
        itemStyle: {
          color: "#4080FF",
        },
        lineStyle: {
          color: "#4080FF",
        },
      },
      {
        name: "访客量UV)",
        type: "line",
        data: data.ipList,
        areaStyle: {
          color: "rgba(103, 194, 58, 0.1)",
        },
        smooth: true,
        itemStyle: {
          color: "#67C23A",
        },
        lineStyle: {
          color: "#67C23A",
        },
      },
    ],
  };
};

/**
 * 根据增长率计算对应的 CSS 类名
 *
 * @param growthRate - 增长率数值
 */
const computeGrowthRateClass = (growthRate?: number): string => {
  if (!growthRate) {
    return "text-[--el-color-info]";
  }
  if (growthRate > 0) {
    return "text-[--el-color-danger]";
  } else if (growthRate < 0) {
    return "text-[--el-color-success]";
  } else {
    return "text-[--el-color-info]";
  }
};

// 监听访问趋势日期范围的变化，重新获取趋势数据
watch(
  () => visitTrendDateRange.value,
  () => {
    fetchVisitTrendData();
  },
  { immediate: true }
);

// 组件挂载后加载访客统计数据和通知公告数据
onMounted(() => {
  fetchVisitStatsData();
});
</script>

<style lang="scss" scoped>
// 暂无自定义样式
</style>
