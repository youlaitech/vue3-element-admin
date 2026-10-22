<template>
  <BaseChart ref="chart" flex-1 />
</template>
<script setup lang="ts">
import type { EChartsOption } from "echarts";
import { useTemplateRef } from "vue";
import { useKeepTicking } from "../composables/useKeepTicking";

defineOptions({ name: "RegionalOperation" });

const chartRef = useTemplateRef("chart");

onMounted(() => {
  chartRef.value?.initOptions(options);
});

/**
 * 生成一个500到3000的随机数
 */
const randomNum = () => Math.floor(Math.random() * (500 - 3000 + 1)) + 3000;

const cities = ["北京", "上海", "深圳", "广州", "杭州", "成都", "西安", "武汉", "南京", "重庆"];

/**
 * 获取数据
 */
const getDate = () =>
  Array.from({ length: cities.length }, () => randomNum()).sort((a, b) => b - a);

useKeepTicking(() => {
  chartRef.value?.updateCharts({
    series: [{ data: getDate() }],
  });
});

const options: EChartsOption = {
  backgroundColor: "transparent",
  title: {
    text: "区域运营对比",
    textStyle: {
      color: "#fff",
      fontSize: 20,
      fontFamily: "YouSheBiaoTiHei,Arial,sans-serif",
      fontWeight: "normal",
    },
    top: 0,
    left: "center",
  },
  grid: {
    left: "10%",
    right: "2%",
    top: "13%",
    bottom: 0,
  },
  xAxis: {
    type: "value",
    axisLine: { lineStyle: { color: "rgba(0, 255, 255, 0.5)" } },
    axisLabel: { color: "#ffffff" },
    splitLine: { lineStyle: { color: "rgba(0, 255, 255, 0.1)" } },
  },
  yAxis: {
    type: "category",
    data: cities,
    axisLine: { lineStyle: { color: "rgba(0, 255, 255, 0.5)" } },
    axisLabel: { color: "#ffffff" },
  },
  series: [
    {
      name: "车辆数",
      type: "bar",
      data: getDate(),
      itemStyle: {
        color: {
          type: "linear",
          x: 0,
          y: 0,
          x2: 1,
          y2: 0,
          colorStops: [
            { offset: 0, color: "#00ff7f" },
            { offset: 0.7, color: "#00b7ff" },
            { offset: 1, color: "#409eff" },
          ],
          global: false,
        },
        borderRadius: [0, 4, 4, 0],
        borderWidth: 0,
        shadowColor: "rgba(64, 158, 255, 0.5)",
        shadowBlur: 10,
      },
      label: {
        show: true,
        color: "#fff",
        fontSize: 12,
        formatter: "{c}",
      },
      barWidth: "55%",
      emphasis: {
        itemStyle: {
          shadowColor: "rgba(64, 158, 255, 0.8)",
          shadowBlur: 10,
        },
      },
    },
  ],
  tooltip: {
    trigger: "axis",
    backgroundColor: "rgba(26, 35, 50, 0.9)",
    borderColor: "rgba(0, 255, 255, 0.5)",
    textStyle: { color: "#ffffff" },
  },
};
</script>
<style scoped lang="scss"></style>
