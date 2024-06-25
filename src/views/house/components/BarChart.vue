<!--  线 + 柱混合图 -->
<template>
  <el-card>
    <template #header>
      <div class="title">
        <el-text>七日平均：{{ chartData.sevenDayAverage }}</el-text>
        <el-text>半月日均：{{ chartData.fifteenDayAverage }}</el-text>
        <el-text>月日均：{{ chartData.thirtyDayAverage }}</el-text>
        <el-tooltip effect="dark" content="点击试试下载" placement="bottom">
          <i-ep-download class="download" />
        </el-tooltip>
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
      start: 70,
      end: 100,
    },
    {
      show: true,
      xAxisIndex: [0, 1],
      type: "slider",
      top: "82%",
      start: 90,
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
.title {
  display: flex;
  justify-content: space-between;

  .download {
    cursor: pointer;

    &:hover {
      color: #409eff;
    }
  }
}
</style>
