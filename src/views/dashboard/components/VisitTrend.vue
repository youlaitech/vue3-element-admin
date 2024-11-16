<!--  线 + 柱混合图 -->
<template>
  <el-card>
    <template #header>
      <div class="flex-x-between">
        <div class="flex-y-center">
          访问趋势
          <el-tooltip effect="dark" content="点击试试下载" placement="bottom">
            <el-icon
              class="cursor-pointer hover:color-#4080FF ml-1"
              name="el-icon-download"
              @click="handleDownloadChart"
            >
              <Download />
            </el-icon>
          </el-tooltip>
        </div>

        <el-radio-group v-model="dataRange" size="small" @change="handleDateRangeChange">
          <el-radio-button label="近7天" :value="1" />
          <el-radio-button label="近30天" :value="2" />
        </el-radio-group>
      </div>
    </template>

    <div :id="id" :class="className" :style="{ height, width }" />
  </el-card>
</template>

<script setup lang="ts">
import * as echarts from "echarts";
import LogAPI, { VisitTrendVO, VisitTrendQuery } from "@/api/system/log";

const dataRange = ref(1);
const chart: Ref<echarts.ECharts | null> = ref(null);

const props = defineProps({
  id: {
    type: String,
    default: "VisitTrend",
  },
  className: {
    type: String,
    default: "",
  },
  width: {
    type: String,
    default: "200px",
    required: true,
  },
  height: {
    type: String,
    default: "200px",
    required: true,
  },
});

/** 设置图表  */
const setChartOptions = (data: VisitTrendVO) => {
  if (!chart.value) {
    return;
  }

  const options = {
    tooltip: {
      trigger: "axis",
    },
    legend: {
      data: ["浏览量(PV)", "IP"],
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
        name: "IP",
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

  chart.value.setOption(options);
};

/** 计算起止时间范围 */
const calculateDateRange = () => {
  const now = new Date();

  const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const days = dataRange.value === 1 ? 7 : 30;
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - days);

  // 手动调整日期为当地时间的 23:59:59
  const adjustDateToLocal = (date: Date) => {
    date.setHours(23, 59, 59, 999);
    return date;
  };

  const adjustedEndDate = adjustDateToLocal(new Date(endDate));
  const adjustedStartDate = adjustDateToLocal(new Date(startDate));
  const formattedStartDate = adjustedStartDate.toISOString().split("T")[0];
  const formattedEndDate = adjustedEndDate.toISOString().split("T")[0];

  return { startDate: formattedStartDate, endDate: formattedEndDate };
};

/** 加载数据 */
const loadData = () => {
  const { startDate, endDate } = calculateDateRange();
  LogAPI.getVisitTrend({
    startDate,
    endDate,
  } as VisitTrendQuery).then((data) => {
    setChartOptions(data);
  });
};

const handleDateRangeChange = () => {
  loadData();
};

/** 下载图表 */
const handleDownloadChart = () => {
  if (!chart.value) {
    return;
  }

  // 获取画布图表地址信息
  const img = new Image();
  img.src = chart.value.getDataURL({
    type: "png",
    pixelRatio: 1,
    backgroundColor: "#fff",
  });
  // 当图片加载完成后，生成 URL 并下载
  img.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(img, 0, 0, img.width, img.height);
      const link = document.createElement("a");
      link.download = "访问趋势.png";
      link.href = canvas.toDataURL("image/png", 0.9);
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
  };
};

/** 窗口大小变化时，重置图表大小 */
const handleResize = () => {
  setTimeout(() => {
    if (chart.value) {
      chart.value.resize();
    }
  }, 100);
};
/** 初始化图表  */
onMounted(() => {
  chart.value = markRaw(echarts.init(document.getElementById(props.id) as HTMLDivElement));
  loadData();

  window.addEventListener("resize", handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize);
});

onActivated(() => {
  handleResize();
});
</script>
<style lang="scss" scoped></style>
