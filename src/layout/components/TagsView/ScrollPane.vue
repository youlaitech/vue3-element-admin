<script setup lang="ts">
import { useTagsViewStore, TagView } from "@/store/modules/tagsView";

const tagAndTagSpacing = ref(4);
const { proxy } = getCurrentInstance() as any;

const emits = defineEmits(["scroll"]);
const emitScroll = () => {
  emits("scroll");
};

const tagsViewStore = useTagsViewStore();

const scrollWrapper = computed(
  () => proxy?.$refs.scrollContainer.$refs.wrapRef
);

onMounted(() => {
  scrollWrapper.value.addEventListener("scroll", emitScroll, true);
});
onBeforeUnmount(() => {
  scrollWrapper.value.removeEventListener("scroll", emitScroll);
});

function handleScroll(e: WheelEvent) {
  const eventDelta = (e as any).wheelDelta || -e.deltaY * 40;
  scrollWrapper.value.scrollLeft =
    scrollWrapper.value.scrollLeft + eventDelta / 4;
}

function moveToTarget(currentTag: TagView) {
  const $container = proxy.$refs.scrollContainer.$el;
  const $containerWidth = $container.offsetWidth;
  const $scrollWrapper = scrollWrapper.value;

  let firstTag = null;
  let lastTag = null;

  // find first tag and last tag
  if (tagsViewStore.visitedViews.length > 0) {
    firstTag = tagsViewStore.visitedViews[0];
    lastTag = tagsViewStore.visitedViews[tagsViewStore.visitedViews.length - 1];
  }

  if (firstTag === currentTag) {
    $scrollWrapper.scrollLeft = 0;
  } else if (lastTag === currentTag) {
    $scrollWrapper.scrollLeft = $scrollWrapper.scrollWidth - $containerWidth;
  } else {
    const tagListDom = document.getElementsByClassName("tags-item");
    const currentIndex = tagsViewStore.visitedViews.findIndex(
      (item) => item === currentTag
    );
    let prevTag = null;
    let nextTag = null;
    for (const k in tagListDom) {
      if (k !== "length" && Object.hasOwnProperty.call(tagListDom, k)) {
        if (
          (tagListDom[k] as any).dataset.path ===
          tagsViewStore.visitedViews[currentIndex - 1].path
        ) {
          prevTag = tagListDom[k];
        }
        if (
          (tagListDom[k] as any).dataset.path ===
          tagsViewStore.visitedViews[currentIndex + 1].path
        ) {
          nextTag = tagListDom[k];
        }
      }
    }

    // the tag's offsetLeft after of nextTag
    const afterNextTagOffsetLeft =
      (nextTag as any).offsetLeft +
      (nextTag as any).offsetWidth +
      tagAndTagSpacing.value;

    // the tag's offsetLeft before of prevTag
    const beforePrevTagOffsetLeft =
      (prevTag as any).offsetLeft - tagAndTagSpacing.value;
    if (afterNextTagOffsetLeft > $scrollWrapper.scrollLeft + $containerWidth) {
      $scrollWrapper.scrollLeft = afterNextTagOffsetLeft - $containerWidth;
    } else if (beforePrevTagOffsetLeft < $scrollWrapper.scrollLeft) {
      $scrollWrapper.scrollLeft = beforePrevTagOffsetLeft;
    }
  }
}

defineExpose({
  moveToTarget,
});
</script>

<template>
  <el-scrollbar
    ref="scrollContainer"
    class="scroll-container"
    :vertical="false"
    @wheel.prevent="handleScroll"
  >
    <slot />
  </el-scrollbar>
</template>

<style lang="scss" scoped>
.scroll-container {
  position: relative;
  width: 100%;
  overflow: hidden;
  white-space: nowrap;

  .el-scrollbar__bar {
    bottom: 0;
  }

  .el-scrollbar__wrap {
    height: 49px;
  }
}
</style>
