<template>
  <div id="screenfull">
    <div
        v-if="isFullscreen"
        @click="click"
    >
      <svg
          class="icon"
          aria-hidden="true"
          font-size="40px"
      >
        <use xlink:href="#iconshiliangzhinengduixiang1" />
      </svg>
    </div>
    <div
        @click="click"
        v-else
    >
      <svg
          class="icon"
          aria-hidden="true"
          font-size="40px"
      >
        <use xlink:href="#iconshiliangzhinengduixiang1" />
      </svg>
    </div>
  </div>
</template>

<script>
import screenfull from 'screenfull'
import { ElMessage } from 'element-plus'
import {defineComponent,onBeforeUnmount,onMounted,reactive,toRefs} from "vue";


export default defineComponent({

  setup(){
    const state =reactive({
      isFullscreen: false,
      click:()=>{
        if (!screenfull.isEnabled) {
          ElMessage({
            message: 'you browser can not work',
            type: 'warning'
          })
          return false
        }
        screenfull.toggle()
      }
    })

    const change=()=>{
      if(screenfull.isEnabled){
        this.isFullscreen = screenfull.isFullscreen
      }
    }

    onMounted(() => {
      if (screenfull.isEnabled) {
        screenfull.on('change', change)
      }
    })

    onBeforeUnmount(() => {
      if (screenfull.isEnabled) {
        screenfull.off('change', change)
      }
    })

    return {
      ...toRefs(state)
    }
  }
})

</script>

<style scoped>
.screenfull-svg {
  display: inline-block;
  cursor: pointer;
  fill: #5a5e66;;
  width: 20px;
  height: 20px;
  vertical-align: 10px;
}
</style>
