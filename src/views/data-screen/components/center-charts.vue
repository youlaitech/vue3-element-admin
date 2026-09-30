<template>
  <div class="centerChart">
    <!-- 文字滚动 -->
    <TextCarousel />
    <div class="vehicleCharging">
      <!-- 充电数据 -->
      <VehicleChargingChart />
    </div>
  </div>
</template>
<script lang="ts" setup>
defineOptions({ name: "CenterCharts" });
</script>
