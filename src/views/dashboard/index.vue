<template>
  <div class="dash">
    <!-- ============================================================
    Header: greeting + links
    ============================================================ -->
    <section class="dash-header">
      <div class="card dash-header__card">
        <div class="dash-header__start">
          <div class="dash-avatar">
            <img v-if="userStore.userInfo.avatar" :src="userStore.userInfo.avatar" alt="" />
            <el-icon v-else :size="22"><User /></el-icon>
          </div>
          <div class="dash-header__text">
            <h1 class="dash-header__greeting">{{ greetings }}</h1>
            <p class="dash-header__date">{{ currentDateStr }}</p>
          </div>
        </div>
        <div class="dash-header__end">
          <a
            href="https://github.com/youlaitech/vue3-element-admin"
            target="_blank"
            title="GitHub"
            class="quick-link"
          >
            <span class="i-svg:github" />
            <span>GitHub</span>
          </a>
          <a
            href="https://gitee.com/youlaiorg/vue3-element-admin"
            target="_blank"
            title="Gitee"
            class="quick-link"
          >
            <span class="i-svg:gitee" />
            <span>Gitee</span>
          </a>
          <a
            href="https://gitcode.com/youlai/vue3-element-admin"
            target="_blank"
            title="GitCode"
            class="quick-link"
          >
            <span class="i-svg:gitcode" />
            <span>GitCode</span>
          </a>
          <a
            href="https://juejin.cn/post/7228990409909108793"
            target="_blank"
            title="文档"
            class="quick-link"
          >
            <el-icon><Document /></el-icon>
            <span>文档</span>
          </a>
          <a
            href="https://www.bilibili.com/video/BV1eFUuYyEFj"
            target="_blank"
            title="视频"
            class="quick-link"
          >
            <el-icon><VideoPlay /></el-icon>
            <span>视频</span>
          </a>
        </div>
      </div>
    </section>

    <!-- ============================================================
    Stats
    ============================================================ -->
    <section class="dash-stats">
      <div class="stat-card">
        <div class="stat-card__icon stat-card__icon--online">
          <el-icon :size="18"><Connection /></el-icon>
        </div>
        <div class="stat-card__body">
          <span class="stat-card__label">在线用户</span>
          <span class="stat-card__num">{{ onlineUserCount }}</span>
        </div>
        <span
          :class="[
            'stat-card__badge',
            isConnected ? 'stat-card__badge--on' : 'stat-card__badge--off',
          ]"
        >
          {{ isConnected ? "实时" : "离线" }}
        </span>
      </div>

      <div class="stat-card">
        <div class="stat-card__icon stat-card__icon--visitor">
          <el-icon :size="18"><User /></el-icon>
        </div>
        <div class="stat-card__body">
          <span class="stat-card__label">今日访客</span>
          <span class="stat-card__num">{{ displayTransitionUvCount }}</span>
        </div>
        <span
          v-if="uvGrowthText !== '--'"
          :class="['stat-card__trend', `stat-card__trend--${uvTrendTone}`]"
        >
          <el-icon :size="12">
            <ArrowUp v-if="uvIsUp" />
            <ArrowDown v-else />
          </el-icon>
          {{ uvGrowthText }}
        </span>
      </div>

      <div class="stat-card">
        <div class="stat-card__icon stat-card__icon--view">
          <el-icon :size="18"><View /></el-icon>
        </div>
        <div class="stat-card__body">
          <span class="stat-card__label">今日浏览量</span>
          <span class="stat-card__num">{{ displayTransitionPvCount }}</span>
        </div>
        <span
          v-if="pvGrowthText !== '--'"
          :class="['stat-card__trend', `stat-card__trend--${pvTrendTone}`]"
        >
          <el-icon :size="12">
            <ArrowUp v-if="pvIsUp" />
            <ArrowDown v-else />
          </el-icon>
          {{ pvGrowthText }}
        </span>
      </div>

      <div class="stat-card">
        <div class="stat-card__icon stat-card__icon--account">
          <span class="stat-card__svg i-svg:group" />
        </div>
        <div class="stat-card__body">
          <span class="stat-card__label">系统用户</span>
          <span class="stat-card__num">6</span>
        </div>
        <span :class="['stat-card__trend', `stat-card__trend--${systemTrendTone}`]">
          <el-icon :size="12"><ArrowUp /></el-icon>
          12.5%
        </span>
      </div>
    </section>

    <!-- ============================================================
    Chart
    ============================================================ -->
    <section class="dash-chart">
      <div class="card dash-chart__trend">
        <div class="card__head">
          <h3 class="card__title">访问趋势</h3>
          <el-radio-group v-model="visitTrendDateRange" size="small">
            <el-radio-button label="近7天" :value="7" />
            <el-radio-button label="近30天" :value="30" />
          </el-radio-group>
        </div>
        <div class="card__body card__body--chart">
          <ECharts :options="visitTrendChartOptions" height="260px" />
        </div>
      </div>

      <div class="card dash-chart__overview">
        <div class="card__head">
          <h3 class="card__title">待办概览</h3>
          <el-tag type="primary" size="small" effect="plain">5 项待处理</el-tag>
        </div>
        <div class="card__body overview-card">
          <div class="overview-summary">
            <div v-for="item in todoSummaryItems" :key="item.label" class="overview-summary__item">
              <span class="overview-summary__label">{{ item.label }}</span>
              <strong class="overview-summary__value">{{ item.value }}</strong>
            </div>
          </div>
          <div class="overview-bars">
            <div
              v-for="item in todoOverviewItems"
              :key="item.label"
              class="overview-bars__item"
              :style="{
                '--overview-percent': `${item.percent}%`,
              }"
            >
              <div class="overview-bars__meta">
                <span class="overview-bars__label">
                  <span class="overview-bars__dot" />
                  {{ item.label }}
                </span>
                <span class="overview-bars__value">{{ item.value }} 项</span>
              </div>
              <span class="overview-bars__track">
                <span class="overview-bars__bar" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================================================
    Bottom: todo + timeline
    ============================================================ -->
    <section class="dash-bottom">
      <div class="card">
        <div class="card__head">
          <h3 class="card__title">待办事项</h3>
          <el-tag size="small" round>5 项</el-tag>
        </div>
        <div class="card__body">
          <div
            v-for="todo in todoItems"
            :key="todo.id"
            class="todo-row"
            :class="{ 'todo-row--done': todo.done }"
          >
            <el-icon
              :size="16"
              :class="todo.done ? 'todo-row__icon--done' : 'todo-row__icon--pending'"
            >
              <CircleCheck v-if="todo.done" />
              <Clock v-else />
            </el-icon>
            <span class="todo-row__title">{{ todo.title }}</span>
            <el-tag
              :type="todo.done ? 'success' : todo.tag === '工单' ? 'warning' : 'info'"
              size="small"
              effect="plain"
              class="todo-row__tag"
            >
              {{ todo.tag }}
            </el-tag>
            <span class="todo-row__time">{{ todo.time }}</span>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card__head">
          <h3 class="card__title">系统动态</h3>
        </div>
        <div class="card__body card__body--scroll">
          <div class="feed">
            <div v-for="item in activities" :key="item.id" class="feed__item">
              <span class="feed__dot" />
              <span class="feed__text">{{ item.content }}</span>
              <span class="feed__time">{{ item.time }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: "Dashboard", inheritAttrs: false });

import { dayjs } from "element-plus";
import { ref } from "vue";
import LogAPI from "@/api/system/log";
import type { VisitOverviewDetail, VisitTrendDetail } from "@/api/system/log";
import { useUserStore } from "@/stores/user";
import { useSettingsStore } from "@/stores/settings";
import { formatGrowthRate } from "@/utils";
import { useTransition } from "@vueuse/core";
import {
  User,
  Connection,
  View,
  ArrowUp,
  ArrowDown,
  Clock,
  CircleCheck,
  Document,
  VideoPlay,
} from "@element-plus/icons-vue";
import { useOnlineCount } from "@/composables";

const userStore = useUserStore();
const settingsStore = useSettingsStore();
const { onlineUserCount, isConnected } = useOnlineCount();

const hours = new Date().getHours();
const greetings = computed(() => {
  const n = userStore.userInfo.nickname;
  if (hours >= 6 && hours < 8) return `早安，${n}`;
  if (hours >= 8 && hours < 12) return `上午好，${n}`;
  if (hours >= 12 && hours < 18) return `下午好，${n}`;
  if (hours >= 18 && hours < 24) return `晚上好，${n}`;
  return `夜深了，${n}`;
});

const currentDateStr = computed(() => {
  const d = new Date();
  const w = ["日", "一", "二", "三", "四", "五", "六"];
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 星期${w[d.getDay()]}`;
});

interface TodoItem {
  id: number;
  title: string;
  tag: string;
  time: string;
  done: boolean;
}

const todoItems: TodoItem[] = [
  {
    id: 1,
    title: "审批：张三提交的请假申请",
    tag: "审批",
    time: "10分钟前",
    done: false,
  },
  {
    id: 2,
    title: "审核：新用户注册信息核实",
    tag: "审核",
    time: "30分钟前",
    done: false,
  },
  {
    id: 3,
    title: "发布：系统维护通知公告",
    tag: "通知",
    time: "1小时前",
    done: false,
  },
  {
    id: 4,
    title: "处理：工单 #TSK-20240509",
    tag: "工单",
    time: "2小时前",
    done: false,
  },
  {
    id: 5,
    title: "更新：用户角色权限配置",
    tag: "配置",
    time: "昨天 15:30",
    done: true,
  },
];

interface Activity {
  id: number;
  content: string;
  time: string;
}

const activities: Activity[] = [
  { id: 1, content: "管理员 admin 登录系统", time: "3分钟前" },
  { id: 2, content: "新增用户李四，角色为普通用户", time: "25分钟前" },
  { id: 3, content: "系统配置项「登录策略」已更新", time: "1小时前" },
  { id: 4, content: "数据库自动备份任务执行完成", time: "3小时前" },
  { id: 5, content: "角色权限批量修改：运营组新增导出权限", time: "昨天 16:42" },
  { id: 6, content: "SSL 证书已自动续期", time: "昨天 09:15" },
];

const todoOverviewItems = [
  { label: "审批", value: "2", percent: 40, tone: "primary" },
  { label: "审核", value: "1", percent: 20, tone: "primary" },
  { label: "通知", value: "1", percent: 20, tone: "primary" },
  { label: "工单", value: "1", percent: 20, tone: "primary" },
];

const todoSummaryItems = [
  { label: "今日新增", value: "3", tone: "primary" },
  { label: "即将超时", value: "1", tone: "primary" },
  { label: "今日完成", value: "1", tone: "success" },
];

const visitOverviewData = ref<VisitOverviewDetail>({
  todayUvCount: 0,
  uvGrowthRate: 0,
  totalUvCount: 0,
  todayPvCount: 0,
  pvGrowthRate: 0,
  totalPvCount: 0,
});

const uvGrowthText = computed(() => {
  const r = visitOverviewData.value.uvGrowthRate;
  return r == null ? "--" : formatGrowthRate(r);
});
const pvGrowthText = computed(() => {
  const r = visitOverviewData.value.pvGrowthRate;
  return r == null ? "--" : formatGrowthRate(r);
});
const uvIsUp = computed(() => (visitOverviewData.value.uvGrowthRate || 0) > 0);
const pvIsUp = computed(() => (visitOverviewData.value.pvGrowthRate || 0) > 0);
const uvTrendTone = computed(() => (uvIsUp.value ? "success" : "danger"));
const pvTrendTone = computed(() => (pvIsUp.value ? "success" : "danger"));
const systemTrendTone = "success";

const tUv = useTransition(
  computed(() => visitOverviewData.value.todayUvCount),
  {
    duration: 800,
    transition: [0.25, 0.1, 0.25, 1.0],
  }
);
const tPv = useTransition(
  computed(() => visitOverviewData.value.todayPvCount),
  {
    duration: 800,
    transition: [0.25, 0.1, 0.25, 1.0],
  }
);
const displayTransitionUvCount = computed(() => Math.round(Number(tUv.value)));
const displayTransitionPvCount = computed(() => Math.round(Number(tPv.value)));

const visitTrendDateRange = ref(7);
const visitTrendData = ref<VisitTrendDetail>();
const visitTrendChartOptions = ref({});

function getCssVar(name: string, fallback: string) {
  if (typeof window === "undefined") return fallback;

  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}

function colorWithAlpha(color: string, alpha: number) {
  const value = color.trim();

  if (value.startsWith("#")) {
    const hex =
      value.length === 4
        ? `#${value[1]}${value[1]}${value[2]}${value[2]}${value[3]}${value[3]}`
        : value;
    const rgb = Number.parseInt(hex.slice(1), 16);
    const r = (rgb >> 16) & 255;
    const g = (rgb >> 8) & 255;
    const b = rgb & 255;

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  const parts = value.match(/\d+(\.\d+)?/g);
  if (parts && parts.length >= 3) {
    return `rgba(${parts[0]}, ${parts[1]}, ${parts[2]}, ${alpha})`;
  }

  return value;
}

function fetchVisitOverviewData() {
  LogAPI.getVisitOverview().then((d) => {
    visitOverviewData.value = d;
  });
}

function fetchVisitTrendData() {
  const s = dayjs()
    .subtract(visitTrendDateRange.value - 1, "day")
    .toDate();
  LogAPI.getVisitTrend({
    startDate: dayjs(s).format("YYYY-MM-DD"),
    endDate: dayjs(new Date()).format("YYYY-MM-DD"),
  }).then((d) => {
    visitTrendData.value = d;
    updateVisitTrendChartOptions(d);
  });
}

function updateVisitTrendChartOptions(d: VisitTrendDetail) {
  const primary = getCssVar("--el-color-primary", "#409eff");
  const success = getCssVar("--el-color-success", "#67c23a");
  const textSecondary = getCssVar("--el-text-color-secondary", "#909399");
  const borderLighter = getCssVar("--el-border-color-lighter", "#ebeef5");
  const gridLine = colorWithAlpha(borderLighter, 0.72);

  visitTrendChartOptions.value = {
    tooltip: {
      trigger: "axis",
      borderWidth: 0,
      padding: [8, 12],
      extraCssText: "box-shadow: var(--el-box-shadow-light); border-radius: 6px;",
    },
    legend: {
      data: ["浏览量", "访客量"],
      bottom: 0,
      textStyle: { fontSize: 12, color: textSecondary },
      itemWidth: 10,
      itemHeight: 8,
      itemGap: 24,
    },
    grid: { left: "0%", right: "3%", bottom: "14%", top: "5%", containLabel: true },
    xAxis: {
      type: "category",
      data: d.dates,
      axisTick: { show: false },
      axisLine: { lineStyle: { color: colorWithAlpha(borderLighter, 0.82) } },
      axisLabel: { fontSize: 11, color: textSecondary },
      splitLine: { show: false },
    },
    yAxis: {
      type: "value",
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { type: "dashed", color: gridLine, width: 1 } },
      axisLabel: { fontSize: 11, color: textSecondary },
    },
    series: [
      {
        name: "浏览量",
        type: "line",
        data: d.pvList,
        smooth: true,
        symbol: "circle",
        symbolSize: 5,
        showSymbol: false,
        lineStyle: { color: primary, width: 2.2 },
        itemStyle: { color: primary },
        areaStyle: {
          opacity: 1,
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: colorWithAlpha(primary, 0.18) },
              { offset: 0.52, color: colorWithAlpha(primary, 0.08) },
              { offset: 1, color: colorWithAlpha(primary, 0.01) },
            ],
          },
        },
      },
      {
        name: "访客量",
        type: "line",
        data: d.uvList,
        smooth: true,
        symbol: "circle",
        symbolSize: 5,
        showSymbol: false,
        lineStyle: { color: colorWithAlpha(success, 0.9), width: 1.8, opacity: 0.86 },
        itemStyle: { color: success },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: colorWithAlpha(success, 0.08) },
              { offset: 1, color: colorWithAlpha(success, 0) },
            ],
          },
        },
      },
    ],
  };
}

watch(
  () => visitTrendDateRange.value,
  () => fetchVisitTrendData(),
  { immediate: true }
);
watch(
  () => [settingsStore.resolvedTheme, settingsStore.themeColors],
  () => {
    if (!visitTrendData.value) return;

    requestAnimationFrame(() => {
      if (visitTrendData.value) updateVisitTrendChartOptions(visitTrendData.value);
    });
  },
  { deep: true }
);
onMounted(() => {
  fetchVisitOverviewData();
});
</script>

<style lang="scss" scoped>
// Tokens
$gap: 12px;
$pad: 10px;
%card {
  overflow: hidden;
  background: var(--el-bg-color-overlay);
  border: 1px solid var(--card-border);
  border-radius: var(--card-radius);
  box-shadow: var(--card-shadow);
}

// Page
.dash {
  display: flex;
  flex-direction: column;
  gap: $gap;
  padding: $pad;
  background: var(--page-bg);
}

// Header
.dash-header {
  &__card {
    display: flex;
    flex-wrap: wrap;
    gap: 18px;
    align-items: center;
    justify-content: space-between;
    min-height: 78px;
    padding: 16px 18px;
  }

  &__start {
    display: flex;
    flex: 1;
    gap: 12px;
    align-items: center;
    min-width: 260px;
  }

  &__text {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  &__greeting {
    margin: 0;
    font-size: 18px;
    font-weight: 500;
    line-height: 1.3;
    color: var(--el-text-color-primary);
  }

  &__date {
    margin: 0;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  &__end {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
    justify-content: flex-end;
  }
}

.dash-avatar {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  overflow: hidden;
  color: var(--el-color-primary);
  background: color-mix(in srgb, var(--el-color-primary) 14%, var(--el-bg-color-overlay));
  border: 1px solid color-mix(in srgb, var(--el-color-primary) 18%, transparent);
  border-radius: 50%;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

// Quick links
.quick-link {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  justify-content: center;
  height: 30px;
  padding: 0 10px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  text-decoration: none;
  background: var(--el-fill-color-extra-light);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
  transition:
    color 0.15s,
    background-color 0.15s,
    border-color 0.15s;

  .el-icon,
  [class^="i-svg:"] {
    width: 15px;
    height: 15px;
    font-size: 15px;
    color: currentcolor;
  }

  &:hover {
    color: var(--el-color-primary);
    background: color-mix(in srgb, var(--el-color-primary) 7%, var(--el-bg-color-overlay));
    border-color: color-mix(in srgb, var(--el-color-primary) 20%, var(--el-border-color-lighter));
  }
}

// Stat cards
.dash-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: $gap;
}

.stat-card {
  display: flex;
  gap: 14px;
  align-items: center;
  min-height: 84px;
  padding: 18px;
  @extend %card;

  &__icon {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border-radius: 10px;

    &--online {
      color: var(--el-color-primary);
      background: color-mix(in srgb, var(--el-color-primary) 10%, var(--el-bg-color-overlay));
    }
    &--visitor {
      color: var(--el-color-primary);
      background: color-mix(in srgb, var(--el-color-primary) 8%, var(--el-bg-color-overlay));
    }
    &--view {
      color: var(--el-color-primary);
      background: color-mix(in srgb, var(--el-color-primary) 8%, var(--el-bg-color-overlay));
    }
    &--account {
      color: var(--el-color-primary);
      background: color-mix(in srgb, var(--el-color-primary) 8%, var(--el-bg-color-overlay));
    }
  }

  &__svg {
    width: 20px;
    height: 20px;
    font-size: 20px;
    color: currentcolor;
  }

  &__body {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-width: 0;
  }

  &__num {
    font-size: 24px;
    font-weight: 600;
    line-height: 1.15;
    color: var(--el-text-color-primary);
  }

  &__label {
    margin-bottom: 3px;
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }

  &__badge {
    flex-shrink: 0;
    font-size: 11px;
    font-weight: 500;

    &--on {
      color: var(--el-color-success);
    }
    &--off {
      color: var(--el-text-color-secondary);
    }
  }

  &__trend {
    display: inline-flex;
    flex-shrink: 0;
    gap: 3px;
    align-items: center;
    font-size: 12px;
    font-weight: 700;
    color: var(--el-text-color-secondary);

    &--success {
      color: var(--el-color-success);
    }

    &--danger {
      color: var(--el-color-danger);
    }
  }
}

// Generic card
.card {
  display: flex;
  flex-direction: column;
  @extend %card;

  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 48px;
    padding: 13px 18px;
    border-bottom: 1px solid var(--card-border);
  }

  &__title {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  &__body {
    padding: 16px 18px 18px;

    &--chart {
      padding: 14px 18px 16px;
    }

    &--scroll {
      flex: 1;
      padding: 0;
      overflow-y: auto;
    }
  }
}

.dash-header__card {
  flex-direction: row;
}

// Chart & bottom grids
.dash-chart {
  display: grid;
  grid-template-columns: minmax(0, 3fr) minmax(280px, 1fr);
  gap: $gap;
}

.dash-chart__trend,
.dash-chart__overview {
  min-width: 0;
}

.overview-card {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 20px;
  min-height: 0;
}

.overview-bars {
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: space-between;
  min-height: 142px;
  padding: 0;

  &__item {
    display: flex;
    flex-direction: column;
    gap: 7px;
  }

  &__meta {
    display: flex;
    gap: 10px;
    align-items: center;
    justify-content: space-between;
    min-width: 0;
  }

  &__label,
  &__value {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  &__value {
    flex-shrink: 0;
    text-align: right;
  }

  &__label {
    display: inline-flex;
    gap: 6px;
    align-items: center;
    min-width: 0;
  }

  &__dot {
    width: 6px;
    height: 6px;
    background: var(--el-color-primary);
    border-radius: 50%;
  }

  &__track {
    height: 5px;
    overflow: hidden;
    background: color-mix(in srgb, var(--el-color-primary) 10%, var(--el-fill-color-light));
    border-radius: 999px;
  }

  &__bar {
    display: block;
    width: var(--overview-percent);
    height: 100%;
    background: linear-gradient(90deg, var(--el-color-primary), var(--el-color-primary-light-3));
    border-radius: inherit;
  }
}

.overview-summary {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;

  &__item {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-width: 0;
    min-height: 64px;
    padding: 12px;
    overflow: hidden;
    background: color-mix(in srgb, var(--el-color-primary) 4%, var(--el-bg-color-overlay));
    border: 1px solid
      color-mix(in srgb, var(--el-color-primary) 10%, var(--el-border-color-lighter));
    border-radius: 6px;

    &:nth-child(2) {
      background: color-mix(in srgb, var(--el-color-primary) 6%, var(--el-bg-color-overlay));
      border-color: color-mix(in srgb, var(--el-color-primary) 14%, var(--el-border-color-lighter));

      &::before {
        background: color-mix(in srgb, var(--el-color-primary) 48%, transparent);
      }

      .overview-summary__value {
        color: var(--el-color-warning);
      }
    }

    &:nth-child(3) {
      background: color-mix(in srgb, var(--el-color-primary) 3%, var(--el-bg-color-overlay));
      border-color: color-mix(in srgb, var(--el-color-primary) 8%, var(--el-border-color-lighter));

      &::before {
        background: color-mix(in srgb, var(--el-color-primary) 36%, transparent);
      }

      .overview-summary__value {
        color: var(--el-color-success);
      }
    }

    &::before {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 2px;
      content: "";
      background: color-mix(in srgb, var(--el-color-primary) 62%, transparent);
    }
  }

  &__label {
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 12px;
    color: var(--el-text-color-secondary);
    white-space: nowrap;
  }

  &__value {
    flex-shrink: 0;
    margin-top: 5px;
    font-size: 18px;
    font-weight: 600;
    line-height: 1.1;
    color: var(--el-color-primary);
  }
}

.dash-bottom {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: $gap;
}

// Todo rows
.todo-row {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 11px 0;

  & + & {
    border-top: 1px solid var(--el-border-color-lighter);
  }

  &--done {
    .todo-row__title {
      color: var(--el-text-color-placeholder);
      text-decoration: line-through;
    }
  }

  &__icon--pending {
    flex-shrink: 0;
    color: var(--el-color-primary);
  }
  &__icon--done {
    flex-shrink: 0;
    color: var(--el-color-success);
  }

  &__title {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 13px;
    color: var(--el-text-color-regular);
    white-space: nowrap;
  }

  &__tag {
    flex-shrink: 0;
    color: var(--el-text-color-secondary);
    background: var(--el-fill-color-light);

    &.el-tag--warning {
      color: color-mix(in srgb, var(--el-color-warning) 78%, var(--el-text-color-primary));
      background: color-mix(in srgb, var(--el-color-warning) 9%, var(--el-bg-color-overlay));
    }

    &.el-tag--success {
      color: var(--el-color-success);
      background: color-mix(in srgb, var(--el-color-success) 8%, var(--el-bg-color-overlay));
    }
  }

  &__time {
    flex-shrink: 0;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
}

// Activity feed
.feed {
  display: flex;
  flex-direction: column;
  padding: 10px 20px 16px;

  &__item {
    position: relative;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: baseline;
    padding: 10px 0 10px 16px;

    &::before {
      position: absolute;
      top: 22px;
      bottom: -4px;
      left: 3px;
      width: 1px;
      content: "";
      background: var(--el-border-color-lighter);
    }

    &:last-child::before {
      display: none;
    }
  }

  &__dot {
    position: absolute;
    top: 12px;
    left: 0;
    width: 7px;
    height: 7px;
    background: var(--el-color-primary);
    border: 2px solid var(--el-color-primary-light-8);
    border-radius: 50%;
  }

  &__text {
    flex: 1;
    min-width: 0;
    font-size: 13px;
    line-height: 1.4;
    color: var(--el-text-color-regular);
  }

  &__time {
    flex-shrink: 0;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
}

// Responsive
@media (max-width: 1200px) {
  .dash-stats {
    grid-template-columns: repeat(2, 1fr);
  }
  .dash-header__card {
    flex-direction: column;
    align-items: flex-start;
  }

  .dash-header__end {
    justify-content: flex-start;
  }
}

@media (max-width: 992px) {
  .dash-chart {
    grid-template-columns: 1fr;
  }

  .dash-bottom {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .dash {
    gap: 10px;
    padding: 10px;
  }

  .dash-stats {
    grid-template-columns: 1fr;
  }
}
</style>
