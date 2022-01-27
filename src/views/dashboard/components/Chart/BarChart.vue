<!-- 柱状图 -->
<template>
  <div
      :id="id"
      :class="className"
      :style="{height, width}"
  />
</template>

<script setup lang="ts">
import {nextTick, onActivated, onBeforeUnmount, onDeactivated, onMounted} from "vue";
import {init, EChartsOption} from 'echarts'
import resize from '@/utils/resize'

const props = defineProps({
  id: {
    type: String,
    default: 'barChart'
  },
  className: {
    type: String,
    default: ''
  },
  width: {
    type: String,
    default: '200px',
    required: true
  },
  height: {
    type: String,
    default: '200px',
    required: true
  }
})

const {
  mounted,
  chart,
  beforeDestroy,
  activated,
  deactivated
} = resize()

function initChart() {
  const barChart = init(document.getElementById(props.id) as HTMLDivElement)

  barChart.setOption({
    title: {
      show: true,
      text: '分公司业绩总览(2021年)',
      x: 'center',
      padding: 15,
      textStyle: {
        fontSize: 18,
        fontStyle: 'normal',
        fontWeight: 'bold',
        color: '#096b92'
      }
    },
    grid: {
      left: '2%',
      right: '2%',
      bottom: '10%',
      containLabel: true
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        crossStyle: {
          color: '#999'
        }
      }
    },
    legend: {
      x: 'center',
      y: 'bottom',
      data: ['收入', '毛利润', '收入增长率', '利润增长率']
    },
    xAxis: [
      {
        type: 'category',
        data: ['上海', '北京', '浙江', '广东', '深圳', '四川', '湖北', '安徽'],
        axisPointer: {
          type: 'shadow'
        }
      }
    ],
    yAxis: [
      {
        type: 'value',
        min: 0,
        max: 10000,
        interval: 2000,
        axisLabel: {
          formatter: '{value} '
        }
      },
      {
        type: 'value',
        min: 0,
        max: 100,
        interval: 20,
        axisLabel: {
          formatter: '{value}%'
        }
      }
    ],
    series: [
      {
        name: '收入',
        type: 'bar',
        data: [
          8000, 8200, 7000, 6200, 6500, 5500, 4500, 4200, 3800,
        ],
        barWidth: 20

      },
      {
        name: '毛利润',
        type: 'bar',
        data: [
          6200, 6500, 5500, 4500, 4200, 3800, 4200, 6700, 5213,
        ],
        barWidth: 20
      },
      {
        name: '收入增长率',
        type: 'line',
        yAxisIndex: 1,
        data: [42, 41, 53, 65, 67, 65, 52, 45, 43]
      },
      {
        name: '利润增长率',
        type: 'line',
        yAxisIndex: 1,
        data: [82, 81, 56, 45, 51, 65, 65, 67, 78]
      }
    ]
  } as EChartsOption)
  chart.value = barChart
}

onBeforeUnmount(() => {
  beforeDestroy()
})

onActivated(() => {
  activated()
})

onDeactivated(() => {
  deactivated()
})

onMounted(() => {
  mounted()
  nextTick(() => {
    initChart()
  })
})

</script>

<style lang="scss" scoped>

</style>