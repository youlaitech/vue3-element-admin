<!--  线 + 柱混合图 -->
<template>
  <div :id="id" :class="className" :style="{ height, width }" />
</template>

<script setup lang="ts">
import {
  nextTick,
  onActivated,
  onBeforeUnmount,
  onDeactivated,
  onMounted,
} from 'vue';
import { init, EChartsOption } from 'echarts';
import * as echarts from 'echarts';
import resize from '@/utils/resize';

const props = defineProps({
  id: {
    type: String,
    default: 'barChart',
  },
  className: {
    type: String,
    default: '',
  },
  width: {
    type: String,
    default: '200px',
    required: true,
  },
  height: {
    type: String,
    default: '200px',
    required: true,
  },
});

const { mounted, chart, beforeDestroy, activated, deactivated } = resize();

function initChart() {
  const barChart = init(document.getElementById(props.id) as HTMLDivElement);

  barChart.setOption({
    title: {
      show: true,
      text: '业绩总览',
      x: 'center',
      padding: 15,
      textStyle: {
        fontSize: 18,
        fontStyle: 'normal',
        fontWeight: 'bold',
        color: '#337ecc',
      },
    },
    grid: {
      left: '2%',
      right: '2%',
      bottom: '10%',
      containLabel: true,
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        crossStyle: {
          color: '#999',
        },
      },
    },
    legend: {
      x: 'center',
      y: 'bottom',
      data: ['收入', '毛利润', '收入增长率', '利润增长率'],
    },
    xAxis: [
      {
        type: 'category',
        data: [ '浙江', '北京', '上海', '广东','深圳'],
        axisPointer: {
          type: 'shadow',
        },
      },
    ],
    yAxis: [
      {
        type: 'value',
        min: 0,
        max: 10000,
        interval: 2000,
        axisLabel: {
          formatter: '{value} ',
        },
      },
      {
        type: 'value',
        min: 0,
        max: 100,
        interval: 20,
        axisLabel: {
          formatter: '{value}%',
        },
      },
    ],
    series: [
      {
        name: '收入',
        type: 'bar',
        data: [7000, 7100, 7200, 7300,7400],
        barWidth: 20,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#83bff6' },
            { offset: 0.5, color: '#188df0' },
            { offset: 1, color: '#188df0' },
          ]),
        },
      },
      {
        name: '毛利润',
        type: 'bar',
        data: [ 8000,8200, 8400, 8600, 8800],
        barWidth: 20,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#25d73c' },
            { offset: 0.5, color: '#1bc23d' },
            { offset: 1, color: '#179e61' },
          ]),
        },
      },
      {
        name: '收入增长率',
        type: 'line',
        yAxisIndex: 1,
        data: [  60,65, 70, 75, 80],
        itemStyle: {
          color: '#67C23A',
        },
      },
      {
        name: '利润增长率',
        type: 'line',
        yAxisIndex: 1,
        data: [  70,75, 80, 85, 90],
        itemStyle: {
          color: '#409EFF',
        },
      },
    ],
  } as EChartsOption);
  chart.value = barChart;
}

onBeforeUnmount(() => {
  beforeDestroy();
});

onActivated(() => {
  activated();
});

onDeactivated(() => {
  deactivated();
});

onMounted(() => {
  mounted();
  nextTick(() => {
    initChart();
  });
});
</script>
