<template>
  <div class="dashboard-container">
    <!-- github 角标 -->
    <github-corner class="github-corner" />

    <el-card shadow="never" class="mt-2">
      <el-row class="h-80px">
        <el-col :span="18" :xs="24">
          <div class="flex-x-start">
            <img
              class="w80px h80px rounded-full"
              :src="userStore.userInfo.avatar + '?imageView2/1/w/80/h/80'"
            />
            <div class="ml-5">
              <p>{{ greetings }}</p>
              <p class="text-sm text-gray">今日天气晴朗，气温在15℃至25℃之间，东南风。</p>
            </div>
          </div>
        </el-col>

        <el-col :span="6" :xs="24">
          <el-row class="h-80px flex-y-center" :gutter="10">
            <el-col :span="10">
              <div class="font-bold color-#ff9a2e text-sm flex-y-center">
                <el-icon class="mr-2px"><Folder /></el-icon>
                仓库
              </div>
              <div class="mt-3">
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
            </el-col>

            <el-col :span="10">
              <div class="font-bold color-#4080ff text-sm flex-y-center">
                <el-icon class="mr-2px"><Document /></el-icon>
                文档
              </div>
              <div class="mt-3">
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
            </el-col>

            <el-col :span="4">
              <div class="font-bold color-#f76560 text-sm flex-y-center">
                <el-icon class="mr-2px"><VideoCamera /></el-icon>
                视频
              </div>
              <div class="mt-3">
                <el-link href="https://www.bilibili.com/video/BV1eFUuYyEFj" target="_blank">
                  <div class="i-svg:bilibili text-lg" />
                </el-link>
              </div>
            </el-col>
          </el-row>
        </el-col>
      </el-row>
    </el-card>

    <!-- 数据统计 -->
    <el-row :gutter="10" class="mt-5">
      <!-- 访客数(UV) -->
      <el-col :span="12">
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
            <el-card shadow="never">
              <template #header>
                <div class="flex-x-between">
                  <span class="text-gray">访客数(UV)</span>
                  <el-tag type="success" size="small">日</el-tag>
                </div>
              </template>

              <div class="flex-x-between mt-2">
                <div class="flex-y-center">
                  <span class="text-lg">{{ visitStatsData.todayUvCount }}</span>
                  <span
                    :class="[
                      'text-xs',
                      'ml-2',
                      computeGrowthRateClass(visitStatsData.uvGrowthRate),
                    ]"
                  >
                    <el-icon>
                      <Top v-if="visitStatsData.uvGrowthRate > 0" />
                      <Bottom v-else-if="visitStatsData.uvGrowthRate < 0" />
                    </el-icon>
                    {{ formatGrowthRate(visitStatsData.uvGrowthRate) }}
                  </span>
                </div>
                <div class="i-svg:visitor w-8 h-8" />
              </div>

              <div class="flex-x-between mt-2 text-sm text-gray">
                <span>总访客数</span>
                <span>{{ visitStatsData.totalUvCount }}</span>
              </div>
            </el-card>
          </template>
        </el-skeleton>
      </el-col>

      <!-- 浏览量(PV) -->
      <el-col :span="12">
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
            <el-card shadow="never">
              <template #header>
                <div class="flex-x-between">
                  <span class="text-gray">浏览量(PV)</span>
                  <el-tag type="primary" size="small">日</el-tag>
                </div>
              </template>

              <div class="flex-x-between mt-2">
                <div class="flex-y-center">
                  <span class="text-lg">{{ visitStatsData.todayPvCount }}</span>
                  <span
                    :class="[
                      'text-xs',
                      'ml-2',
                      computeGrowthRateClass(visitStatsData.pvGrowthRate),
                    ]"
                  >
                    <el-icon>
                      <Top v-if="visitStatsData.pvGrowthRate > 0" />
                      <Bottom v-else-if="visitStatsData.pvGrowthRate < 0" />
                    </el-icon>
                    {{ formatGrowthRate(visitStatsData.pvGrowthRate) }}
                  </span>
                </div>
                <div class="i-svg:browser w-8 h-8" />
              </div>

              <div class="flex-x-between mt-2 text-sm text-gray">
                <span>总浏览量</span>
                <span>{{ visitStatsData.totalPvCount }}</span>
              </div>
            </el-card>
          </template>
        </el-skeleton>
      </el-col>
    </el-row>

    <el-row :gutter="10" class="mt-5">
      <!-- 访问趋势统计图 -->
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
      <!-- 最新动态 -->
      <el-col :xs="24" :span="8">
        <el-card>
          <template #header>
            <div class="flex-x-between">
              <span class="header-title">最新动态</span>
              <el-link
                type="primary"
                :underline="false"
                href="https://gitee.com/youlaiorg/vue3-element-admin/releases"
                target="_blank"
              >
                完整记录
                <el-icon class="link-icon"><TopRight /></el-icon>
              </el-link>
            </div>
          </template>

          <el-scrollbar height="400px">
            <el-timeline class="p-3">
              <el-timeline-item
                v-for="(item, index) in vesionList"
                :key="index"
                :timestamp="item.date"
                placement="top"
                :color="index === 0 ? '#67C23A' : '#909399'"
                :hollow="index !== 0"
                size="large"
              >
                <div class="version-item" :class="{ 'latest-item': index === 0 }">
                  <div>
                    <el-text tag="strong">{{ item.title }}</el-text>
                    <el-tag v-if="item.tag" :type="index === 0 ? 'success' : 'info'" size="small">
                      {{ item.tag }}
                    </el-tag>
                  </div>

                  <el-text class="version-content">{{ item.content }}</el-text>

                  <div v-if="item.link">
                    <el-link
                      :type="index === 0 ? 'primary' : 'info'"
                      :href="item.link"
                      target="_blank"
                      :underline="false"
                    >
                      详情
                      <el-icon class="link-icon"><TopRight /></el-icon>
                    </el-link>
                  </div>
                </div>
              </el-timeline-item>
            </el-timeline>
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

import { dayjs } from "element-plus";
import LogAPI, { VisitStatsVO, VisitTrendVO } from "@/api/system/log.api";
import { useUserStore } from "@/store/modules/user.store";
import { formatGrowthRate } from "@/utils";

interface VersionItem {
  id: string;
  title: string; // 版本标题（如：v2.4.0）
  date: string; // 发布时间
  content: string; // 版本描述
  link: string; // 详情链接
  tag?: string; // 版本标签（可选）
}

const userStore = useUserStore();

// 当前通知公告列表
const vesionList = ref<VersionItem[]>([
  {
    id: "1",
    title: "v2.4.0",
    date: "2021-09-01 00:00:00",
    content: "实现基础框架搭建，包含权限管理、路由系统等核心功能。",
    link: "https://gitee.com/youlaiorg/vue3-element-admin/releases",
    tag: "里程碑",
  },
  {
    id: "1",
    title: "v2.4.0",
    date: "2021-09-01 00:00:00",
    content: "实现基础框架搭建，包含权限管理、路由系统等核心功能。",
    link: "https://gitee.com/youlaiorg/vue3-element-admin/releases",
    tag: "里程碑",
  },
  {
    id: "1",
    title: "v2.4.0",
    date: "2021-09-01 00:00:00",
    content: "实现基础框架搭建，包含权限管理、路由系统等核心功能。",
    link: "https://gitee.com/youlaiorg/vue3-element-admin/releases",
    tag: "里程碑",
  },
]);

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
const visitStatsData = ref<VisitStatsVO>({
  todayUvCount: 0,
  uvGrowthRate: 0,
  totalUvCount: 0,
  todayPvCount: 0,
  pvGrowthRate: 0,
  totalPvCount: 0,
});

// 访问趋势日期范围（单位：天）
const visitTrendDateRange = ref(7);
// 访问趋势图表配置
const visitTrendChartOptions = ref();

/**
 * 获取访客统计数据
 */
const fetchVisitStatsData = () => {
  LogAPI.getVisitStats()
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
const updateVisitTrendChartOptions = (data: VisitTrendVO) => {
  console.log("Updating visit trend chart options");

  visitTrendChartOptions.value = {
    tooltip: {
      trigger: "axis",
    },
    legend: {
      data: ["浏览量(PV)", "访客数(UV)"],
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
        name: "访客数(UV)",
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
    return "color-[--el-color-info]";
  }
  if (growthRate > 0) {
    return "color-[--el-color-danger]";
  } else if (growthRate < 0) {
    return "color-[--el-color-success]";
  } else {
    return "color-[--el-color-info]";
  }
};

// 监听访问趋势日期范围的变化，重新获取趋势数据
watch(
  () => visitTrendDateRange.value,
  (newVal) => {
    console.log("Visit trend date range changed:", newVal);
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

  .version-item {
    padding: 16px;
    margin-bottom: 12px;
    background: var(--el-fill-color-lighter);
    border-radius: 8px;
    transition: all 0.2s;

    &.latest-item {
      background: var(--el-color-primary-light-9);
      border: 1px solid var(--el-color-primary-light-5);
    }
    &:hover {
      transform: translateX(5px);
    }
    .version-content {
      margin-bottom: 12px;
      font-size: 13px;
      line-height: 1.5;
      color: var(--el-text-color-secondary);
    }
  }
}
</style>
