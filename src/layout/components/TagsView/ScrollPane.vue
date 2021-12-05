<template>
  <el-scrollbar ref="scrollContainer" :vertical="false" class="scroll-container" @wheel.native.prevent="handleScroll">
    <slot/>
  </el-scrollbar>
</template>

<script lang="ts">
import {defineComponent, reactive, ref, toRefs, computed, onMounted, onBeforeUnmount, getCurrentInstance} from "vue";

export default defineComponent({
  emits: ['scroll'],
  setup(_, context) {
    const scrollContainer = ref(null)
    const scrollWrapper = computed(() => {
      return (scrollContainer.value as any).$refs.wrap as HTMLElement
    })
    const {ctx} = getCurrentInstance() as any
    const tagAndTagSpacing = 4

    const state = reactive({
      handleScroll: (e: WheelEvent) => {
        const eventDelta = (e as any).wheelDelta || -e.deltaY * 40
        scrollWrapper.value.scrollLeft = scrollWrapper.value.scrollLeft + eventDelta / 4
      },
      moveToCurrentTag: (currentTag: HTMLElement) => {
        const container = (scrollContainer.value as any).$el as HTMLElement
        const containerWidth = container.offsetWidth
        const tagList = ctx.$parent.$refs.tag as any[]
        let firstTag = null
        let lastTag = null

        // find first tag and last tag
        if (tagList.length > 0) {
          firstTag = tagList[0]
          lastTag = tagList[tagList.length - 1]
        }

        if (firstTag === currentTag) {
          scrollWrapper.value.scrollLeft = 0
        } else if (lastTag === currentTag) {
          scrollWrapper.value.scrollLeft = scrollWrapper.value.scrollWidth - containerWidth
        } else {
          // find preTag and nextTag
          const currentIndex = tagList.findIndex(item => item === currentTag)
          const prevTag = tagList[currentIndex - 1]
          const nextTag = tagList[currentIndex + 1]
          // the tag's offsetLeft after of nextTag
          const afterNextTagOffsetLeft = nextTag.$el.offsetLeft + nextTag.$el.offsetWidth + tagAndTagSpacing
          // the tag's offsetLeft before of prevTag
          const beforePrevTagOffsetLeft = prevTag.$el.offsetLeft - tagAndTagSpacing

          if (afterNextTagOffsetLeft > scrollWrapper.value.scrollLeft + containerWidth) {
            scrollWrapper.value.scrollLeft = afterNextTagOffsetLeft - containerWidth
          } else if (beforePrevTagOffsetLeft < scrollWrapper.value.scrollLeft) {
            scrollWrapper.value.scrollLeft = beforePrevTagOffsetLeft
          }
        }
      }
    })

    const emitScroll = () => {
      context.emit('scroll')
    }

    onMounted(() => {
      //scrollWrapper.value.addEventListener('scroll', emitScroll, true)
    })

    onBeforeUnmount(() => {
      //scrollWrapper.value.removeEventListener('scroll', emitScroll)
    })

    return {
      scrollContainer,
      ...toRefs(state)
    }
  }
})
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
