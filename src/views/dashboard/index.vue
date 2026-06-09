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
          <div class="brand-group">
            <span class="brand-group__label" style="color: #e67e22">
              <el-icon :size="13"><Folder /></el-icon>
              <span>仓库</span>
            </span>
            <span class="brand-group__icons">
              <a
                href="https://gitee.com/youlaiorg/vue3-element-admin"
                target="_blank"
                title="Gitee"
                class="brand-icon"
                style="color: #c71d23"
              >
                <span class="i-svg:gitee" />
              </a>
              <a
                href="https://github.com/youlaitech/vue3-element-admin"
                target="_blank"
                title="GitHub"
                class="brand-icon"
                style="color: #0969da"
              >
                <span class="i-svg:github" />
              </a>
              <a
                href="https://gitcode.com/youlai/vue3-element-admin"
                target="_blank"
                title="GitCode"
                class="brand-icon"
                style="color: #f36d26"
              >
                <span class="i-svg:gitcode" />
              </a>
            </span>
          </div>
          <div class="brand-group">
            <span class="brand-group__label" style="color: #409eff">
              <el-icon :size="13"><Document /></el-icon>
              <span>文档</span>
            </span>
            <span class="brand-group__icons">
              <a
                href="https://juejin.cn/post/7228990409909108793"
                target="_blank"
                title="掘金"
                class="brand-icon"
                style="color: #1e80ff"
              >
                <span class="i-svg:juejin" />
              </a>
              <a
                href="https://youlai.blog.csdn.net/article/details/130191394"
                target="_blank"
                title="CSDN"
                class="brand-icon"
                style="color: #fc5531"
              >
                <span class="i-svg:csdn" />
              </a>
              <a
                href="https://www.cnblogs.com/haoxianrui/p/17331952.html"
                target="_blank"
                title="博客园"
                class="brand-icon"
                style="color: #f68a1e"
              >
                <span class="i-svg:cnblogs" />
              </a>
            </span>
          </div>
          <div class="brand-group">
            <span class="brand-group__label" style="color: #e74c3c">
              <el-icon :size="13"><VideoCamera /></el-icon>
              <span>视频</span>
            </span>
            <span class="brand-group__icons">
              <a
                href="https://www.bilibili.com/video/BV1eFUuYyEFj"
                target="_blank"
                title="Bilibili"
                class="brand-icon"
                style="color: #fb7299"
              >
                <span class="i-svg:bilibili" />
              </a>
            </span>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================================================
    Stats: 4 cards, no border, shadow only
    ============================================================ -->
    <section class="dash-stats">
      <div class="stat-card">
        <div class="stat-card__icon stat-card__icon--blue">
          <el-icon :size="18"><User /></el-icon>
        </div>
        <div class="stat-card__body">
          <span class="stat-card__num">{{ onlineUserCount }}</span>
          <span class="stat-card__label">在线用户</span>
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
        <div class="stat-card__icon stat-card__icon--green">
          <el-icon :size="18"><Avatar /></el-icon>
        </div>
        <div class="stat-card__body">
          <span class="stat-card__num">{{ displayTransitionUvCount }}</span>
          <span class="stat-card__label">今日访客</span>
        </div>
        <span v-if="uvGrowthText !== '--'" class="stat-card__trend">
          <el-icon :size="12">
            <ArrowUp v-if="uvIsUp" />
            <ArrowDown v-else />
          </el-icon>
          {{ uvGrowthText }}
        </span>
      </div>

      <div class="stat-card">
        <div class="stat-card__icon stat-card__icon--orange">
          <el-icon :size="18"><Monitor /></el-icon>
        </div>
        <div class="stat-card__body">
          <span class="stat-card__num">{{ displayTransitionPvCount }}</span>
          <span class="stat-card__label">今日浏览量</span>
        </div>
        <span v-if="pvGrowthText !== '--'" class="stat-card__trend">
          <el-icon :size="12">
            <ArrowUp v-if="pvIsUp" />
            <ArrowDown v-else />
          </el-icon>
          {{ pvGrowthText }}
        </span>
      </div>

      <div class="stat-card">
        <div class="stat-card__icon stat-card__icon--purple">
          <el-icon :size="18"><Star /></el-icon>
        </div>
        <div class="stat-card__body">
          <span class="stat-card__num">1,286</span>
          <span class="stat-card__label">系统用户</span>
        </div>
        <span class="stat-card__trend stat-card__trend--up">
          <el-icon :size="12"><ArrowUp /></el-icon>
          12.5%
        </span>
      </div>
    </section>

    <!-- ============================================================
    Chart
    ============================================================ -->
    <section class="dash-chart">
      <div class="card">
        <div class="card__head">
          <h3 class="card__title">访问趋势</h3>
          <el-radio-group v-model="visitTrendDateRange" size="small">
            <el-radio-button label="近7天" :value="7" />
            <el-radio-button label="近30天" :value="30" />
          </el-radio-group>
        </div>
        <div class="card__body">
          <ECharts :options="visitTrendChartOptions" height="310px" />
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
            <el-tag :type="todo.tagType" size="small" effect="plain" class="todo-row__tag">
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
              <span :class="['feed__dot', `feed__dot--${item.color}`]" />
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
import { formatGrowthRate } from "@/utils";
import { useTransition } from "@vueuse/core";
import {
  User,
  Avatar,
  Monitor,
  Star,
  Folder,
  Document,
  VideoCamera,
  ArrowUp,
  ArrowDown,
  Clock,
  CircleCheck,
} from "@element-plus/icons-vue";
import { useOnlineCount } from "@/composables";

const userStore = useUserStore();
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
  tagType: "primary" | "success" | "warning" | "danger" | "info";
  time: string;
  done: boolean;
}

const todoItems: TodoItem[] = [
  {
    id: 1,
    title: "审批：张三提交的请假申请",
    tag: "审批",
    tagType: "warning",
    time: "10分钟前",
    done: false,
  },
  {
    id: 2,
    title: "审核：新用户注册信息核实",
    tag: "审核",
    tagType: "primary",
    time: "30分钟前",
    done: false,
  },
  {
    id: 3,
    title: "发布：系统维护通知公告",
    tag: "通知",
    tagType: "info",
    time: "1小时前",
    done: false,
  },
  {
    id: 4,
    title: "处理：工单 #TSK-20240509",
    tag: "工单",
    tagType: "danger",
    time: "2小时前",
    done: false,
  },
  {
    id: 5,
    title: "更新：用户角色权限配置",
    tag: "配置",
    tagType: "success",
    time: "昨天 15:30",
    done: true,
  },
];

interface Activity {
  id: number;
  content: string;
  time: string;
  color: "blue" | "green" | "orange" | "purple" | "grey";
}

const activities: Activity[] = [
  { id: 1, content: "管理员 admin 登录系统", time: "3分钟前", color: "blue" },
  { id: 2, content: "新增用户李四，角色为普通用户", time: "25分钟前", color: "green" },
  { id: 3, content: "系统配置项「登录策略」已更新", time: "1小时前", color: "orange" },
  { id: 4, content: "数据库自动备份任务执行完成", time: "3小时前", color: "purple" },
  { id: 5, content: "角色权限批量修改：运营组新增导出权限", time: "昨天 16:42", color: "orange" },
  { id: 6, content: "SSL 证书已自动续期", time: "昨天 09:15", color: "green" },
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
const displayTransitionUvCount = computed(() => Math.round(Number((tUv as any)?.value ?? tUv)));
const displayTransitionPvCount = computed(() => Math.round(Number((tPv as any)?.value ?? tPv)));

const visitTrendDateRange = ref(7);
const visitTrendChartOptions = ref({});

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
    updateVisitTrendChartOptions(d);
  });
}

function updateVisitTrendChartOptions(d: VisitTrendDetail) {
  visitTrendChartOptions.value = {
    tooltip: {
      trigger: "axis",
      borderWidth: 0,
      padding: [8, 12],
      extraCssText: "box-shadow: 0 2px 12px rgba(0,0,0,0.08); border-radius: 8px;",
    },
    legend: {
      data: ["浏览量", "访客量"],
      bottom: 0,
      textStyle: { fontSize: 12 },
      itemWidth: 10,
      itemHeight: 8,
      itemGap: 24,
    },
    grid: { left: "0%", right: "4%", bottom: "14%", top: "4%", containLabel: true },
    xAxis: {
      type: "category",
      data: d.dates,
      axisTick: { show: false },
      axisLabel: { fontSize: 11 },
    },
    yAxis: {
      type: "value",
      splitLine: { lineStyle: { type: "dashed" } },
      axisLabel: { fontSize: 11 },
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
        lineStyle: { color: "#409EFF", width: 2.5 },
        itemStyle: { color: "#409EFF" },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(64,158,255,0.12)" },
              { offset: 1, color: "rgba(64,158,255,0.0)" },
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
        lineStyle: { color: "#67C23A", width: 2.5 },
        itemStyle: { color: "#67C23A" },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(103,194,58,0.12)" },
              { offset: 1, color: "rgba(103,194,58,0.0)" },
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
onMounted(() => {
  fetchVisitOverviewData();
});
</script>

<style lang="scss" scoped>
// ============================================================
// Tokens
// ============================================================
$gap: 16px;
$pad: 16px;
$radius: 10px;

// Card: shadow instead of border for premium feel.
// In dark mode the shadow is hidden — the border-color
// takes over.
%card {
  overflow: hidden;
  background: var(--content-bg);
  border: 1px solid var(--border-color);
  border-radius: $radius;
}

// ============================================================
// Page
// ============================================================

.dash {
  display: flex;
  flex-direction: column;
  gap: $gap;
  padding: $pad;
}

// ============================================================
// Header
// ============================================================

.dash-header {
  &__card {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
  }

  &__start {
    display: flex;
    gap: 14px;
    align-items: center;
  }

  &__text {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  &__greeting {
    margin: 0;
    font-size: 20px;
    font-weight: 400;
    line-height: 1.3;
    color: var(--el-text-color-primary);
    letter-spacing: -0.01em;
  }

  &__date {
    margin: 0;
    font-size: 12px;
    color: var(--el-text-color-placeholder);
  }

  &__end {
    display: flex;
    gap: 16px;
    align-items: center;
    padding: 10px 14px;
    background: var(--el-color-primary-light-9);
    border-radius: 8px;
  }
}

.dash-avatar {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  overflow: hidden;
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  border-radius: 50%;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

// ============================================================
// Brand link groups
// ============================================================

.brand-group {
  display: flex;
  flex-direction: column;
  gap: 4px;

  &__label {
    display: inline-flex;
    gap: 4px;
    align-items: center;
    font-size: 11px;
    font-weight: 500;
    color: var(--el-text-color-secondary);
    letter-spacing: 0.03em;
  }

  &__icons {
    display: flex;
    gap: 1px;
    align-items: center;
  }
}

.brand-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  font-size: 18px;
  border-radius: 6px;
  transition:
    color 0.15s,
    background-color 0.15s;

  &:hover {
    background: var(--el-color-primary-light-9);
  }
}

// ============================================================
// Stat cards
// ============================================================

.dash-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: $gap;
}

.stat-card {
  display: flex;
  gap: 16px;
  align-items: center;
  padding: 24px;
  @extend %card;

  &__icon {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    border-radius: 12px;

    &--blue {
      color: var(--el-color-primary);
      background: var(--el-color-primary-light-9);
    }
    &--green {
      color: var(--el-color-success);
      background: var(--el-color-success-light-9);
    }
    &--orange {
      color: var(--el-color-warning);
      background: var(--el-color-warning-light-9);
    }
    &--purple {
      color: var(--el-color-primary-light-3);
      background: var(--el-color-primary-light-9);
    }
  }

  &__body {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-width: 0;
  }

  &__num {
    font-size: 28px;
    font-weight: 600;
    line-height: 1.2;
    color: var(--el-text-color-primary);
    letter-spacing: -0.02em;
  }

  &__label {
    font-size: 12px;
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
      color: var(--el-color-danger);
    }
  }

  &__trend {
    display: inline-flex;
    flex-shrink: 0;
    gap: 2px;
    align-items: center;
    font-size: 12px;
    font-weight: 500;
    color: var(--el-text-color-secondary);

    &--up {
      color: var(--el-color-danger);
    }
  }
}

// ============================================================
// Generic card
// ============================================================

.card {
  @extend %card;

  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 20px;
  }

  &__title {
    margin: 0;
    font-size: 14px;
    font-weight: 500;
    color: var(--el-text-color-primary);
  }

  &__body {
    padding: 0 20px 20px;

    &--scroll {
      flex: 1;
      padding: 0;
      overflow-y: auto;
    }
  }
}

// ============================================================
// Chart & bottom grids
// ============================================================

.dash-bottom {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: $gap;
}

// ============================================================
// Todo rows
// ============================================================

.todo-row {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 10px 0;

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
    color: var(--el-color-warning);
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
  }

  &__time {
    flex-shrink: 0;
    font-size: 12px;
    color: var(--el-text-color-placeholder);
  }
}

// ============================================================
// Activity feed
// ============================================================

.feed {
  display: flex;
  flex-direction: column;
  padding: 8px 20px 16px;

  &__item {
    position: relative;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: baseline;
    padding: 9px 0 9px 16px;

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
    border-radius: 50%;

    &--blue {
      background: var(--el-color-primary);
    }
    &--green {
      background: var(--el-color-success);
    }
    &--orange {
      background: var(--el-color-warning);
    }
    &--purple {
      background: var(--el-color-primary-light-3);
    }
    &--grey {
      background: var(--el-text-color-placeholder);
    }
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
    color: var(--el-text-color-placeholder);
  }
}

// ============================================================
// Responsive
// ============================================================

@media (max-width: 1200px) {
  .dash-stats {
    grid-template-columns: repeat(2, 1fr);
  }
  .dash-header__card {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 992px) {
  .dash-bottom {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .dash {
    gap: 14px;
    padding: 14px;
  }

  .dash-stats {
    grid-template-columns: 1fr;
  }
}
</style>
