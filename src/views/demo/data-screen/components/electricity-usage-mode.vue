<template>
  <div class="electricityUsageMode" style="--height: 195px; --width: 280px">
    <BaseChart ref="chart" @onload="highlightItem" />
  </div>
</template>
<script setup lang="ts">
import type { EChartsOption } from "echarts";
import { EChartsType } from "echarts/core";
import { useTemplateRef } from "vue";
import { useKeepTicking } from "../composables/useKeepTicking";

defineOptions({ name: "ElectricityUsageMode" });

const chartRef = useTemplateRef("chart");

onMounted(() => {
  chartRef.value?.initOptions(options);
});

const data = ref([
  { value: 1048, name: "快充", itemStyle: { color: "#00E676" } }, // 荧光绿
  { value: 835, name: "慢充", itemStyle: { color: "#FF4081" } }, // 玫红色
  { value: 515, name: "换电", itemStyle: { color: "#536DFE" } }, // 亮蓝色
  { value: 178, name: "其他", itemStyle: { color: "#FFD600" } }, // 黄色
]);

const options: EChartsOption = {
  tooltip: { trigger: "item" },
  legend: {
    bottom: 0,
    left: "center",
    textStyle: { color: "white" },
  },
  series: [
    {
      type: "pie",
      radius: ["40%", "70%"],
      center: ["50%", "40%"],
      padAngle: 5,
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 4 },
      label: { show: false, position: "center" },
      emphasis: {
        label: {
          show: true,
          color: "#fff",
          fontSize: 16,
          fontWeight: "bold",
        },
      },
      labelLine: { show: false },
      data: data.value,
    },
  ],
};

const currentIndex = ref(0);
const chartInstance = ref<EChartsType>();

/**
 * 高亮指定图表
 */
const highlightItem = (chart: EChartsType) => {
  chartInstance.value = chart;
};

useKeepTicking(() => {
  if (!chartInstance.value) return;

  // 取消之前的高亮
  chartInstance.value.dispatchAction({ type: "downplay" });

  chartInstance.value.dispatchAction({
    type: "highlight",
    seriesIndex: 0,
    dataIndex: currentIndex.value,
  });

  // 更新索引
  currentIndex.value = (currentIndex.value + 1) % data.value.length;
});
</script>
<style scoped lang="scss">
.electricityUsageMode {
  position: absolute;
  top: calc(-1 * var(--height) - 12px); /* 通过 calc 计算为负值 */
  left: -1px;
  width: var(--width);
  height: var(--height);
  margin-bottom: 10px;
}
</style>
