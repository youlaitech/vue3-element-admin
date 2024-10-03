<template>
  <div class="dashboard-container">
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
              <span class="text-[var(--el-text-color-secondary)]">
                在线用户
              </span>
              <el-tag type="success" size="small">-</el-tag>
            </div>
          </template>

          <div class="flex-x-between mt-2">
            <span class="text-lg">{{ onlineUserCount }}</span>
            <svg-icon icon-class="user" size="2em" />
          </div>
          <div
            class="flex-x-between mt-2 text-sm text-[var(--el-text-color-secondary)]"
          >
            <span>总用户数</span>
            <span>5</span>
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
        <el-skeleton :loading="visitStatsLoading" :rows="5" animated>
          <template #template>
            <el-card>
              <template #header>
                <div>
                  <el-skeleton-item variant="h3" style="width: 40%" />
                  <el-skeleton-item
                    variant="rect"
                    style="float: right; width: 1em; height: 1em"
                  />
                </div>
              </template>

              <div class="flex-x-between">
                <el-skeleton-item variant="text" style="width: 30%" />
                <el-skeleton-item
                  variant="circle"
                  style="width: 2em; height: 2em"
                />
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
                  <span class="text-[var(--el-text-color-secondary)]">
                    {{ item.title }}
                  </span>
                  <el-tag :type="item.tagType" size="small">
                    {{ item.granularity }}
                  </el-tag>
                </div>
              </template>

              <div class="flex-x-between mt-2">
                <div class="flex-y-center">
                  <span class="text-lg">{{ item.todayCount }}</span>
                  <span
                    :class="[
                      'text-xs',
                      'ml-2',
                      getGrowthRateClass(item.growthRate),
                    ]"
                  >
                    <i-ep-top v-if="item.growthRate > 0" />
                    <i-ep-bottom v-else-if="item.growthRate < 0" />
                    {{ formatGrowthRate(item.growthRate) }}
                  </span>
                </div>
                <svg-icon :icon-class="item.icon" size="2em" />
              </div>

              <div
                class="flex-x-between mt-2 text-sm text-[var(--el-text-color-secondary)]"
              >
                <span>总{{ item.title }}</span>
                <span>{{ item.totalCount }}</span>
              </div>
            </el-card>
          </template>
        </el-skeleton>
      </el-col>
    </el-row>

    <el-row :gutter="10" class="mt-5">
      <el-col :xs="24" :span="16">
        <!-- 访问趋势统计图 -->
        <VisitTrend id="VisitTrend" width="100%" height="400px" />
      </el-col>
      <el-col :xs="24" :span="8">
        <el-card>
          <template #header>
            <div class="flex-x-between">
              <div class="flex-y-center">
                通知公告
                <el-icon class="ml-1"><Notification /></el-icon>
              </div>
              <el-link type="primary">
                <span class="text-xs">查看更多</span>
                <el-icon class="text-xs"><ArrowRight /></el-icon>
              </el-link>
            </div>
          </template>

          <el-scrollbar height="400px">
            <div
              v-for="(item, index) in notices"
              :key="index"
              class="flex-y-center py-3"
            >
              <el-tag :type="getNoticeLevelTag(item.level)" size="small">
                {{ getNoticeLabel(item.type) }}
              </el-tag>
              <el-text
                truncated
                class="!mx-2 flex-1 !text-xs !text-[var(--el-text-color-secondary)]"
              >
                {{ item.title }}
              </el-text>
              <el-link>
                <el-icon class="text-sm"><View /></el-icon>
              </el-link>
            </div>
          </el-scrollbar>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import WebSocketManager from "@/utils/socket";

defineOptions({
  name: "Dashboard",
  inheritAttrs: false,
});

import { useUserStore } from "@/store/modules/user";
import { NoticeTypeEnum, getNoticeLabel } from "@/enums/NoticeTypeEnum";
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
    iconClass: "todo",
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

const onlineUserCount = ref(0);

const visitStatsLoading = ref(true);
const visitStatsList = ref<VisitStats[] | null>(Array(3).fill({}));
interface VisitStats {
  title: string;
  icon: string;
  tagType: "primary" | "success" | "warning";
  growthRate: number;
  /** 粒度 */
  granularity: string;
  /** 今日数量输出文档  */
  todayCount: number;
  totalCount: number;
}
/** 加载访问统计数据 */
const loadVisitStatsData = async () => {
  const list: VisitStatsVO[] = await StatsAPI.getVisitStats();

  if (list) {
    const tagTypes: ("primary" | "success" | "warning")[] = [
      "primary",
      "success",
      "warning",
    ];
    const transformedList: VisitStats[] = list.map((item, index) => ({
      title: item.title,
      icon: getVisitStatsIcon(item.type),
      tagType: tagTypes[index % tagTypes.length],
      growthRate: item.growthRate,
      granularity: "日",
      todayCount: item.todayCount,
      totalCount: item.totalCount,
    }));
    visitStatsList.value = transformedList;
    visitStatsLoading.value = false;
  }
};

/** 格式化增长率 */
const formatGrowthRate = (growthRate: number): string => {
  if (growthRate === 0) {
    return "-";
  }

  const formattedRate = Math.abs(growthRate * 100)
    .toFixed(2)
    .replace(/\.?0+$/, "");
  return formattedRate + "%";
};

/** 获取增长率文本颜色类 */
const getGrowthRateClass = (growthRate: number): string => {
  if (growthRate > 0) {
    return "color-[--el-color-danger]";
  } else if (growthRate < 0) {
    return "color-[--el-color-success]";
  } else {
    return "color-[--el-color-info]";
  }
};

/** 获取访问统计图标 */
const getVisitStatsIcon = (type: string) => {
  switch (type) {
    case "pv":
      return "pv";
    case "uv":
      return "uv";
    case "ip":
      return "ip";
    default:
      return "pv";
  }
};

const notices = ref([
  {
    level: 2,
    type: NoticeTypeEnum.SYSTEM_UPGRADE,
    title: "v2.12.0 新增系统日志，访问趋势统计功能。",
  },
  {
    level: 0,
    type: NoticeTypeEnum.COMPANY_NEWS,
    title: "公司将在 7 月 1 日举办年中总结大会，请各部门做好准备。",
  },
  {
    level: 3,
    type: NoticeTypeEnum.HOLIDAY_NOTICE,
    title: "端午节假期从 6 月 12 日至 6 月 14 日放假，共 3 天。",
  },

  {
    level: 2,
    type: NoticeTypeEnum.SECURITY_ALERT,
    title: "最近发现一些钓鱼邮件，请大家提高警惕，不要点击陌生链接。",
  },
  {
    level: 2,
    type: NoticeTypeEnum.SYSTEM_MAINTENANCE,
    title: "系统将于本周六凌晨 2 点进行维护，预计维护时间为 2 小时。",
  },
  {
    level: 0,
    type: NoticeTypeEnum.OTHER,
    title: "公司新规章制度发布，请大家及时查阅。",
  },
  {
    level: 3,
    type: NoticeTypeEnum.HOLIDAY_NOTICE,
    title: "中秋节假期从 9 月 22 日至 9 月 24 日放假，共 3 天。",
  },
  {
    level: 1,
    type: NoticeTypeEnum.COMPANY_NEWS,
    title: "公司将在 10 月 15 日举办新产品发布会，敬请期待。",
  },
  {
    level: 2,
    type: NoticeTypeEnum.SECURITY_ALERT,
    title:
      "请注意，近期有恶意软件通过即时通讯工具传播，请勿下载不明来源的文件。",
  },
  {
    level: 2,
    type: NoticeTypeEnum.SYSTEM_MAINTENANCE,
    title: "系统将于下周日凌晨 3 点进行升级，预计维护时间为 1 小时。",
  },
  {
    level: 3,
    type: NoticeTypeEnum.OTHER,
    title: "公司年度体检通知已发布，请各位员工按时参加。",
  },
]);

const getNoticeLevelTag = (type: number) => {
  switch (type) {
    case 0:
      return "danger";
    case 1:
      return "warning";
    case 2:
      return "primary";
    default:
      return "success";
  }
};

function connectWebSocket() {
  WebSocketManager.getOrCreateClient("/topic/onlineUserCount", (message) => {
    onlineUserCount.value = JSON.parse(message);
  });
}

onMounted(() => {
  loadVisitStatsData();
  connectWebSocket();
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
