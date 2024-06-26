<!--  线 + 柱混合图 -->
<template>
  <el-card>
    <template #header>
      <div class="title">
        <b>{{ chartData.title.text }}</b>
      </div>
      <div class="title">
        <el-text v-if="displayTitle"
          >七日：{{ chartData.sevenDayAverage }}</el-text
        >
        <el-text v-if="displayTitle"
          >半月：{{ chartData.fifteenDayAverage }}</el-text
        >
        <el-text v-if="displayTitle"
          >近月：{{ chartData.thirtyDayAverage }}</el-text
        >
        <el-text>单位：{{ chartData.title.unit }}</el-text>
      </div>
    </template>
    <div :id="id" :class="className" :style="{ height, width }"></div>
  </el-card>
</template>

<script setup lang="ts">
import * as echarts from "echarts";
import { ChartHouseDataVO } from "@/api/house/model";

const props = defineProps({
  id: {
    type: String,
    default: "barChart",
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
  data: {
    type: Object,
    required: true,
  },
});
const chartData: ChartHouseDataVO = props.data as ChartHouseDataVO;
const displayTitle = ref(false);
console.log(chartData);
const options = {
  grid: {
    left: "2%",
    right: "2%",
    height: "75%",
    bottom: "20%",
    containLabel: true,
  },
  toolbox: {
    show: false,
    feature: {
      dataZoom: {
        yAxisIndex: false,
      },
      brush: {
        type: [],
      },
    },
  },
  tooltip: {
    trigger: "axis",
    axisPointer: {
      type: "cross",
      crossStyle: {
        color: "#999",
      },
    },
  },
  dataZoom: [
    {
      type: "inside",
      xAxisIndex: [0, 1],
      start: chartData.series[0].chatData.length < 30 ? 0 : 70,
      end: 100,
    },
    {
      show: true,
      xAxisIndex: [0, 1],
      type: "slider",
      top: "82%",
      start: chartData.series[0].chatData.length < 30 ? 0 : 70,
      end: 100,
    },
  ],
  legend: {
    x: "center",
    y: "bottom",
    data: [chartData.series[0].chartName, chartData.series[1].chartName],
    textStyle: {
      color: "#999",
    },
  },
  xAxis: [
    {
      type: "category",
      data: chartData.xaxis,
      axisPointer: {
        type: "shadow",
      },
    },
  ],
  yAxis: [
    {
      type: "value",
      min: chartData.yaxis.min,
      max: chartData.yaxis.max,
      interval: chartData.yaxis.interval,
      axisLabel: {
        formatter: "{value} ",
      },
    },
    {
      type: "value",
      min: chartData.zaxis.min,
      max: chartData.zaxis.max,
      interval: chartData.zaxis.interval,
      axisLabel: {
        formatter: "{value}%",
      },
    },
  ],
  series: [
    {
      name: chartData.series[0].chartName,
      type: chartData.series[0].chartType,
      data: chartData.series[0].chatData,
      barWidth: "70%",
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: "#83bff6" },
          { offset: 0.5, color: "#188df0" },
          { offset: 1, color: "#188df0" },
        ]),
      },
    },
    {
      name: chartData.series[1].chartName,
      type: chartData.series[1].chartType,
      data: chartData.series[1].chatData,
      yAxisIndex: 1,
      itemStyle: {
        color: "#67C23A",
      },
    },
  ],
};

// const downloadEchart = () => {
//   // 获取画布图表地址信息
//   const img = new Image();
//   img.src = chart.value.getDataURL({
//     type: "png",
//     pixelRatio: 1,
//     backgroundColor: "#fff",
//   });
//   // 当图片加载完成后，生成 URL 并下载
//   img.onload = () => {
//     const canvas = document.createElement("canvas");
//     canvas.width = img.width;
//     canvas.height = img.height;
//     const ctx = canvas.getContext("2d");
//     if (ctx) {
//       ctx.drawImage(img, 0, 0, img.width, img.height);
//       const link = document.createElement("a");
//       link.download = `业绩柱状图.png`;
//       link.href = canvas.toDataURL("image/png", 0.9);
//       document.body.appendChild(link);
//       link.click();
//       link.remove();
//     }
//   };
// };

const chart = ref<any>("");
onMounted(() => {
  console.log("图表初始化");
  // 是否初始化标题统计
  if (chartData.sevenDayAverage > 0) {
    displayTitle.value = true;
  }
  // 图表初始化
  chart.value = markRaw(
    echarts.init(document.getElementById(props.id) as HTMLDivElement)
  );

  chart.value.setOption(options);

  // 大小自适应
  window.addEventListener("resize", () => {
    chart.value.resize();
  });
});

onActivated(() => {
  if (chart.value) {
    chart.value.resize();
  }
});
</script>
<style lang="scss" scoped>
.elBody {
  text-align: center;
}

.title {
  display: flex;
  place-content: center space-between;
  align-items: center;
  align-self: center;
  text-align: center;

  .download {
    cursor: pointer;

    &:hover {
      color: #409eff;
    }
  }
}
</style>
