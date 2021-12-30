<template>
  <el-scrollbar
      ref="scrollContainerRef"
      :vertical="false"
      class="scroll-container"
      @wheel.prevent="handleScroll">
    <slot/>
  </el-scrollbar>
</template>

<script setup lang="ts">
import {ref, computed, onMounted, onBeforeUnmount, getCurrentInstance} from "vue";
import {tagsViewStoreHook} from "@store/modules/tagsView";

const tagAndTagSpacing = ref(4)
const scrollContainerRef = ref(null)

const emits = defineEmits()
const emitScroll = () => {
  emits('scroll')
}

const {ctx} = getCurrentInstance()
const scrollWrapper = computed(() => {
  return (scrollContainerRef.value as any).$refs.wrap as HTMLElement
})

onMounted(() => {
  console.log('scrollWrapper', scrollWrapper.value)
  //scrollWrapper.value.addEventListener('scroll', emitScroll, true);
})

onBeforeUnmount(() => {
  // scrollWrapper.value.removeEventListener('scroll', emitScroll);
})

function handleScroll(e: WheelEvent) {
  const eventDelta = (e as any).wheelDelta || -e.deltaY * 40
  scrollWrapper.value.scrollLeft = scrollWrapper.value.scrollLeft + eventDelta / 4
}


function moveToCurrentTag(currentTag: HTMLElement) {
  const container = (scrollContainerRef.value as any).$el as HTMLElement
  const containerWidth = container.offsetWidth
  const tagList = ctx.$parent.$refs.tag as any[]

  let firstTag = null
  let lastTag = null

  if (tagList.length > 0) {
    firstTag = tagList[0]
    lastTag = tagList[tagList.length - 1]
  }

  if (firstTag === currentTag) {
    scrollWrapper.value.scrollLeft = 0
  } else if (lastTag === currentTag) {
    scrollWrapper.value.scrollLeft = scrollWrapper.value.scrollWidth - containerWidth
  } else {
    const currentIndex = tagList.findIndex(item => item === currentTag)
    const prevTag = tagList[currentIndex - 1]
    const nextTag = tagList[currentIndex + 1]

    // the tag's offsetLeft after of nextTag
    const afterNextTagOffsetLeft = nextTag.$el.offsetLeft + nextTag.$el.offsetWidth + tagAndTagSpacing.value
    // the tag's offsetLeft before of prevTag
    const beforePrevTagOffsetLeft = prevTag.$el.offsetLeft - tagAndTagSpacing.value

    if (afterNextTagOffsetLeft > scrollWrapper.value.scrollLeft + containerWidth) {
      scrollWrapper.value.scrollLeft = afterNextTagOffsetLeft - containerWidth
    } else if (beforePrevTagOffsetLeft < scrollWrapper.value.scrollLeft) {
      scrollWrapper.value.scrollLeft = beforePrevTagOffsetLeft
    }
  }
}
</script>

<style lang="scss" scoped>
.scroll-container {
  .el-scrollbar__bar {
    bottom: 0px;
  }

  .el-scrollbar__wrap {
    height: 49px;
  }
}

.scroll-container {
  white-space: nowrap;
  position: relative;
  overflow: hidden;
  width: 100%;
}
</style>
