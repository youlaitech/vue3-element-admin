<script setup lang="ts">
import FileAPI from "@/api/file";

const imgUrl = ref("");
const canvas = ref();
let ctx: CanvasRenderingContext2D;

// 正在绘制中，用来控制 move 和 end 事件
let painting = false;

// 获取触发点相对被触发dom的左、上角距离
const getOffset = (event: MouseEvent | TouchEvent) => {
  let offset: [number, number];
  if ((event as MouseEvent).offsetX) {
    // pc端
    const { offsetX, offsetY } = event as MouseEvent;
    offset = [offsetX, offsetY];
  } else {
    // 移动端
    const { top, left } = canvas.value.getBoundingClientRect();
    const offsetX = (event as TouchEvent).touches[0].clientX - left;
    const offsetY = (event as TouchEvent).touches[0].clientY - top;
    offset = [offsetX, offsetY];
  }

  return offset;
};

// 绘制起点
let startX = 0,
  startY = 0;

// 鼠标/触摸 按下时，保存 触发点相对被触发dom的左、上 距离
const onEventStart = (event: MouseEvent | TouchEvent) => {
  [startX, startY] = getOffset(event);
  painting = true;
};

const onEventMove = (event: MouseEvent | TouchEvent) => {
  if (painting) {
    // 鼠标/触摸 移动时，保存 移动点相对 被触发dom的左、上 距离
    const [endX, endY] = getOffset(event);
    paint(startX, startY, endX, endY, ctx);

    // 每次绘制 或 清除结束后，起点要重置为上次的终点
    startX = endX;
    startY = endY;
  }
};

const onEventEnd = () => {
  if (painting) {
    painting = false; // 停止绘制
  }
};

onMounted(() => {
  ctx = canvas.value.getContext("2d") as CanvasRenderingContext2D;
});
const handleToFile = async () => {
  if (isCanvasBlank(canvas.value)) {
    ElMessage({
      type: "warning",
      message: "当前签名文件为空",
    });
    return;
  }
  const file = dataURLtoFile(canvas.value.toDataURL(), "签名.png");

  if (!file) return;
  const data = await FileAPI.upload(file);
  handleClearSign();
  imgUrl.value = data.url;
};
const handleClearSign = () => {
  ctx.clearRect(0, 0, canvas.value.width, canvas.value.height);
};
const isCanvasBlank = (canvas: HTMLCanvasElement) => {
  const blank = document.createElement("canvas"); //系统获取一个空canvas对象
  blank.width = canvas.width;
  blank.height = canvas.height;
  return canvas.toDataURL() == blank.toDataURL(); //比较值相等则为空
};

// 保存为图片
const handleSaveImg = () => {
  if (isCanvasBlank(canvas.value)) {
    ElMessage({
      type: "warning",
      message: "当前签名文件为空",
    });
    return;
  }
  const el = document.createElement("a");
  // 设置 href 为图片经过 base64 编码后的字符串，默认为 png 格式
  el.href = canvas.value.toDataURL();
  el.download = "签名";
  // 创建一个点击事件并对 a 标签进行触发
  const event = new MouseEvent("click");
  el.dispatchEvent(event);
};
// 转为file格式，可传递给后端
const dataURLtoFile = (dataurl: string, filename: string) => {
  const arr: string[] = dataurl.split(",");
  if (!arr.length) return;

  const mime = arr[0].match(/:(.*?);/);
  if (mime) {
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime[1] });
  }
};
// canvas 画图
function paint(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  ctx: CanvasRenderingContext2D
) {
  ctx.beginPath();
  ctx.globalAlpha = 1;
  ctx.lineWidth = 2;
  ctx.strokeStyle = "#000";
  ctx.moveTo(startX, startY);
  ctx.lineTo(endX, endY);
  ctx.closePath();
  ctx.stroke();
}
</script>
<template>
  <div class="canvas-dom">
    <h3>基于canvas实现的签名组件</h3>
    <header>
      <el-button type="primary" @click="handleSaveImg">保存为图片</el-button>
      <el-button @click="handleToFile"> 保存到后端 </el-button>
      <el-button @click="handleClearSign"> 清空签名 </el-button>
    </header>
    <canvas
      ref="canvas"
      height="200"
      width="500"
      @mousedown="onEventStart"
      @mousemove.stop.prevent="onEventMove"
      @mouseup="onEventEnd"
      @touchstart="onEventStart"
      @touchmove.stop.prevent="onEventMove"
      @touchend="onEventEnd"
    >
    </canvas>
    <img v-if="imgUrl" :src="imgUrl" alt="签名" />
  </div>
</template>
<style scoped lang="scss">
.canvas-dom {
  width: 100%;
  height: 100%;
  padding: 0 20px;
  background-color: #fff;

  canvas {
    border: 1px solid #e6e6e6;
  }

  header {
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    width: 100%;
    margin: 8px;

    .eraser-option {
      display: flex;

      label {
        white-space: nowrap;
      }
    }
  }
}
</style>
