<template>
  <el-dialog
    v-model="isShowModal"
    title="裁剪图片"
    width="50%"
    :close-on-press-escape="false"
    :close-on-click-modal="false"
    align-center
    @close="cancel"
  >
    <div class="modal-content">
      <VuePictureCropper
        :img="pic"
        :boxStyle="corpBoxStyle"
        :options="corpOptions"
        :presetMode="corpPresetMode"
        @ready="ready"
      />
    </div>
    <div class="m-t-10 btns">
      <el-button class="default-btn" @click="cancel">取消</el-button>
      <el-button v-if="showClear" class="default-btn" @click="clear">关闭</el-button>
      <el-button v-if="showReset" class="default-btn" @click="reset">重置</el-button>
      <el-button class="default-btn primary" @click="getResult">确定</el-button>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
// 组件文档：https://cropper.chengpeiquan.com/zh/quick-start.html
import VuePictureCropper, { cropper } from "vue-picture-cropper";
import { PhotoCompress } from "./compressUtil.js";

const props = defineProps({
  visible: {
    type: Boolean,
  },
  image: {
    type: [String, File],
  },
  presetMode: {
    type: Object,
  },
  options: {
    type: Object,
  },
  boxStyle: {
    type: Object,
  },
  showClear: {
    // 是否显示 Clear 按钮
    type: Boolean,
  },
  showReset: {
    // 是否显示 Reset 按钮
    type: Boolean,
  },
  isCompress: {
    // 是否压缩裁剪后的图片大小
    type: Boolean,
  },
  compressSize: {
    // 压缩图片大小限制
    type: Object,
    default: {
      maxSize: 0.3 * 1024 * 1024, // 300k
      minSize: 0.03 * 1024 * 1024, // 30k
    },
  },
});

/** 裁剪组件属性配置 */
const corpOptions = computed(() => {
  return {
    viewMode: 1, // 裁剪框范围 1-只能在图片区域内活动
    dragMode: "move", // 可选值 crop(可绘制裁剪框) | move(仅移动)
    // aspectRatio: 1 / 1,// 裁剪框的宽高比
    cropBoxResizable: false, // 是否可以调整裁剪区的大小
    ...props.options,
  };
});
/** 裁剪区域的样式 */
const corpBoxStyle = computed(() => {
  return {
    width: "auto",
    height: "400px",
    backgroundColor: "#f8f8f8",
    margin: "auto",
    ...props.boxStyle,
  };
});

/** 预设模式配置 */
const corpPresetMode = computed(() => {
  return {
    mode: "fixedSize",
    width: 200,
    height: 200,
    ...props.presetMode,
  };
});
const emits = defineEmits(["close"]);

watch(
  () => props.visible,
  (val) => {
    isShowModal.value = val;
    if (!val) {
      pic.value = "";
      result.dataURL = "";
      result.blobURL = "";
      reset();
    }
  }
);

watch(
  () => props.image,
  (val) => {
    pic.value = val;
  }
);

const isShowModal = ref(false);
const pic = ref("");
const result = reactive({
  dataURL: "",
  blobURL: "",
});

async function getResult() {
  if (!cropper) return;
  const base64 = cropper.getDataURL();
  const blob = await cropper.getBlob();
  if (!blob) return;

  let file = await cropper.getFile({
    fileName: "locales.fileName",
  });

  result.dataURL = base64;
  result.blobURL = URL.createObjectURL(blob);
  const { minSize, maxSize } = props.compressSize;
  // console.log(file.size, maxSize)
  // 是否限制文件大小
  if (props.isCompress && file.size > maxSize) {
    // console.log("compress")
    const photoCompress = new PhotoCompress(minSize, maxSize);
    photoCompress.compress(file, function (f) {
      const r = new FileReader();
      r.readAsDataURL(f);
      r.onload = function (e) {
        emits("close", { result, file: f });
      };
    });
  } else {
    // console.log("crop")
    emits("close", { result, file });
  }
}

/**
 * Clear the crop box
 */
function clear() {
  if (!cropper) return;
  cropper.clear();
}

/**
 * Reset the default cropping area
 */
function reset() {
  if (!cropper) return;
  cropper.reset();
}

/**
 * The ready event passed to Cropper.js
 */
function ready() {
  // console.log('Cropper is ready.')
}

function cancel() {
  emits("close");
}
</script>

<style lang="scss" scoped>
.modal-wrap {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 99;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.btns {
  display: flex;
  justify-content: flex-end;
}
</style>
