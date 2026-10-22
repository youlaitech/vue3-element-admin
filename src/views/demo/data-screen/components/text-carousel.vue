<template>
  <!-- 文字轮播 -->
  <div class="text-carousel">
    <transition-group name="carousel" tag="div" class="carousel-container">
      <div :key="currentIdx" class="text-carousel-item">
        {{ carouselData[currentIdx] }}
      </div>
    </transition-group>
  </div>
</template>
<script setup lang="ts">
import { useKeepTicking } from "../composables/useKeepTicking";

defineOptions({ name: "TextCarousel" });
// 所有轮播数据
const carouselData = ref([
  "全国新能源车在线数量：125945 辆，当前充电中车辆占比 36%",
  "今日新增行程 67454 公里，减少碳排放 1120 吨",
  "合肥充电需求飙升！当前 1258 辆车排队等待充电",
  "实时处理电池异常告警 52 例，安全响应率99.8%",
  "安徽车辆在线率突破 82%，续航达标率行业领先",
  "10分钟内完成2510次远程诊断，高效护航出行",
]);

// 当前显示项目索引
const currentIdx = ref(0);

useKeepTicking(() => {
  currentIdx.value = (currentIdx.value + 1) % carouselData.value.length;
}, 5000);
</script>

<style lang="scss" scoped>
.text-carousel {
  height: 52px;
  overflow: hidden;
  font-family: DIN, Arial, sans-serif;
  font-size: 18px;
  color: #fff;
  background: linear-gradient(90deg, rgb(64 158 255 / 60%), rgb(64 158 255 / 0%));
  border-radius: 4px;
}

.carousel-container {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
}

.text-carousel-item {
  position: absolute;
  box-sizing: border-box;
  width: 100%;
  padding: 0 20px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  opacity: 1;
  transform: translateY(0);
}

// 轮播动画样式
.carousel-enter-active,
.carousel-leave-active {
  transition: all 0.5s ease-in-out;
}

.carousel-enter-from {
  opacity: 0;
  transform: translateY(100%);
}

.carousel-leave-to {
  opacity: 0;
  transform: translateY(-100%);
}

.carousel-enter-to,
.carousel-leave-from {
  opacity: 1;
  transform: translateY(0);
}
</style>
