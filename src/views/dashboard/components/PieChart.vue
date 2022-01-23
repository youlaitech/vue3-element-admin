<!-- 饼图 -->
<template>
  <div
      :id="id"
      :class="className"
      :style="{height, width}"
  />
</template>

<script setup lang="ts">
import {nextTick, onMounted} from "vue";
import {init, EChartsOption} from 'echarts'

const props = defineProps({
  id: {
    type: String,
    default: 'pieChart'
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

function initChart() {
  const pieChart = init(document.getElementById(props.id) as HTMLDivElement)

  pieChart.setOption({
    title: {
      show: true,
      text: '产品品类分部总览南丁格尔饼图',
      x: 'center',
      padding: 15,
      textStyle: {
        fontSize: 18,
        fontStyle: 'normal',
        fontWeight: 'bold',
        color:'#096b92'
      }
    },
    grid: {
      left: '2%',
      right: '2%',
      bottom: '10%',
      containLabel: true
    },
    legend: {
      top: 'bottom'
    },
    series: [
      {
        name: 'Nightingale Chart',
        type: 'pie',
        radius: [50, 180],
        center: ['50%', '50%'],
        roseType: 'area',
        itemStyle: {
          borderRadius: 8
        },
        data: [
          { value: 22, name: 'rose 1' },
          { value: 24, name: 'rose 2' },
          { value: 32, name: 'rose 3' },
          { value: 30, name: 'rose 4' },
          { value: 28, name: 'rose 5' },
          { value: 26, name: 'rose 6' },
          { value: 22, name: 'rose 7' },
          { value: 18, name: 'rose 8' }
        ]
      }
    ]
  })
}

onMounted(() => {
  nextTick(() => {
    initChart()
  })
})
</script>

<style lang="scss" scoped>

</style>