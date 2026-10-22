<template>
  <BaseChart ref="chart" h-300px @onload="highlightItem">
    <template #before>
      <div pt-10px pb-8px>
        <div class="digital-display">
          <div class="digit-item">
            <span class="digit-value">12,580</span>
            <span class="digit-label">接入车辆总数</span>
          </div>
          <div class="digit-item">
            <span class="digit-value online">11,245</span>
            <span class="digit-label">在线车辆数</span>
          </div>
          <div class="digit-item">
            <span class="digit-value offline">1,335</span>
            <span class="digit-label">离线车辆数</span>
          </div>
        </div>
      </div>
    </template>
  </BaseChart>
</template>
<script lang="ts" setup>
import { useTemplateRef } from "vue";
import { useKeepTicking } from "../composables/useKeepTicking";
import { EChartsOption } from "echarts";
import { EChartsType } from "echarts/core";

defineOptions({ name: "RealTimeStatus" });

const chartRef = useTemplateRef("chart");

onMounted(() => {
  chartRef.value?.initOptions(options);
});

const data = [
  { value: 89.4, name: "在线率" },
  { value: 10.6, name: "离线率" },
];

const currentIndex = ref(0);
const chartInstance = ref<EChartsType>();

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
  currentIndex.value = (currentIndex.value + 1) % data.length;
});

const options: EChartsOption = {
  tooltip: { trigger: "item" },
  legend: {
    top: "center",
    right: "10%",
    orient: "vertical",
    textStyle: { color: "white" },
  },
  series: [
    {
      type: "pie",
      radius: ["60%", "80%"],
      center: ["40%", "50%"],
      startAngle: 90,
      data,
      label: { color: "white" },
    },
  ],
};
</script>
<style scoped lang="scss">
/* 数字翻牌器 */
.digital-display {
  display: flex;
  justify-content: space-around;
  margin-bottom: 15px;

  .digit-item {
    flex: 1;
    text-align: center;

    .digit-value {
      display: block;
      margin-bottom: 5px;
      font-family: YouSheBiaoTiHei, Arial, sans-serif;
      font-size: 1.6rem;
      color: #fff;
      text-shadow: 0 0 10px rgb(255 255 255 / 50%);
      animation: pulse 2s ease-in-out infinite;

      &.online {
        color: #00ff7f;
        text-shadow: 0 0 10px rgb(0 255 127 / 50%);
      }

      &.offline {
        color: #ff6b6b;
        text-shadow: 0 0 10px rgb(255 107 107 / 50%);
      }
    }

    .digit-label {
      font-size: 0.85rem;
      font-weight: 300;
      color: #e0e0e0;
    }
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.7;
  }
}
</style>
