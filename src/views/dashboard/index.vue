<script lang="ts">
export default { name: 'Dashboard' };
</script>

<script setup lang="ts">
// 组件引用
import GithubCorner from '@/components/GithubCorner/index.vue';
import SvgIcon from '@/components/SvgIcon/index.vue';
import BarChart from './components/BarChart.vue';
import PieChart from './components/PieChart.vue';
import RadarChart from './components/RadarChart.vue';

import CountUp from 'vue-countup-v3';
</script>

<template>
  <div class="dashboard-container">
    <!--github-->
    <github-corner class="github-corner" />

    <!-- 数据 -->
    <el-row :gutter="40" class="mb-[12px]">
      <!--访问数-->
      <el-col :xs="24" :sm="12" :lg="6" class="mb-[12px]">
        <div class="data-box">
          <div
            class="text-[#40c9c6] hover:!text-white hover:bg-[#40c9c6] p-3 rounded"
          >
            <svg-icon icon-class="uv" size="3em" />
          </div>
          <div class="flex flex-col space-y-3">
            <div class="text-[var(--el-text-color-secondary)]">访问数</div>
            <div class="text-lg">
              <count-up :end-val="2000"></count-up>
            </div>
          </div>
        </div>
      </el-col>

      <!--消息数-->
      <el-col :xs="24" :sm="12" :lg="6" class="mb-[12px]">
        <div class="data-box">
          <div
            class="text-[#36a3f7] hover:!text-white hover:bg-[#36a3f7] p-3 rounded"
          >
            <svg-icon icon-class="message" size="3em" />
          </div>
          <div class="flex flex-col space-y-3">
            <div class="text-[var(--el-text-color-secondary)]">消息数</div>
            <div class="text-lg">
              <count-up :end-val="2000"></count-up>
            </div>
          </div>
        </div>
      </el-col>

      <el-col :xs="24" :sm="12" :lg="6" class="mb-[12px]">
        <div class="data-box">
          <div
            class="text-[#f4516c] hover:!text-white hover:bg-[#f4516c] p-3 rounded"
          >
            <svg-icon icon-class="money" size="3em" />
          </div>
          <div class="flex flex-col space-y-3">
            <div class="text-[var(--el-text-color-secondary)]">收入金额</div>
            <div class="text-lg">
              <count-up :end-val="2000"></count-up>
            </div>
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :lg="6" class="mb-[12px]">
        <div class="data-box">
          <div
            class="text-[#34bfa3] hover:!text-white hover:bg-[#34bfa3] p-3 rounded"
          >
            <svg-icon icon-class="shopping" size="3em" />
          </div>
          <div class="flex flex-col space-y-3">
            <div class="text-[var(--el-text-color-secondary)]">订单数</div>
            <div class="text-lg">
              <count-up :end-val="2000"></count-up>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- Echarts 图表 -->
    <el-row :gutter="40" style="margin-top: 20px">
      <el-col :sm="24" :lg="8" class="mb-[12px]">
        <BarChart
          id="barChart"
          height="400px"
          width="100%"
          class="bg-[var(--el-bg-color-overlay)]"
        />
      </el-col>

      <el-col :xs="24" :sm="12" :lg="8" class="mb-[12px]">
        <PieChart
          id="pieChart"
          height="400px"
          width="100%"
          class="bg-[var(--el-bg-color-overlay)]"
        />
      </el-col>

      <el-col :xs="24" :sm="12" :lg="8" class="mb-[12px]">
        <RadarChart
          id="radarChart"
          height="400px"
          width="100%"
          class="bg-[var(--el-bg-color-overlay)]"
        />
      </el-col>
    </el-row>
  </div>
</template>

<style lang="scss" scoped>
.dashboard-container {
  padding: 24px;
  position: relative;

  .github-corner {
    position: absolute;
    top: 0px;
    border: 0;
    right: 0;
    z-index: 99;
  }

  .data-box {
    font-weight: bold;
    padding: 20px;
    cursor: pointer;
    color: var(--el-text-color-regular);
    background: var(--el-bg-color-overlay);
    box-shadow: var(--el-box-shadow-dark);
    border-color: var(--el-border-color);
    display: flex;
    justify-content: space-between;
  }
}
</style>
