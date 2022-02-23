<template>
  <div ref="rightPanel" :class="{show:show}" class="rightPanel-container">
    <div class="rightPanel-background"/>
    <div class="rightPanel">
       <div class="handle-button" :style="{'top':buttonTop+'px','background-color':theme}" @click="show=!show">
          <Close v-show="show"/>
          <Setting v-show="!show"/>
        </div>
        <div class="rightPanel-items">
          <slot/>
        </div>
      </div>
    </div>
</template>

<script setup lang="ts">
import {addClass, removeClass} from '@/utils/index'
import {computed, onBeforeUnmount, onMounted, ref, watchEffect} from "vue";
import {useSettingStoreHook} from "@/store/modules/settings";
import {Close, Setting} from '@element-plus/icons'

const props = defineProps({
  clickNotClose: {
    default: false,
    type: Boolean
  },
  buttonTop: {
    default: 250,
    type: Number
  }
})

const theme =  ""

const show = ref(false)

watchEffect(() => {
  if (show.value && !props.clickNotClose) {
    addEventClick()
  }
  if (show.value) {
    addClass(document.body, 'showRightPanel')
  } else {
    removeClass(document.body, 'showRightPanel')
  }
})

function addEventClick() {
  window.addEventListener('click', closeSidebar)
}

function closeSidebar(evt: any) {
  const parent = evt.target.closest('.rightPanel')
  if (!parent) {
    show.value = false
    window.removeEventListener('click', closeSidebar)
  }
}

const rightPanel = ref(null)

function insertToBody() {
  console.log('insertToBody', rightPanel)
  const elx = rightPanel.value as any
  const body = document.querySelector('body') as any
  body.insertBefore(elx, body.firstChild)
}

onMounted(() => {
  console.log('theme', useSettingStoreHook().theme)
  insertToBody()
})

onBeforeUnmount(() => {
  const elx = rightPanel.value as any
  elx.remove()
})
</script>

<style>
.showRightPanel {
  overflow: hidden;
  position: relative;
  width: calc(100% - 15px);
}
</style>

<style lang="scss" scoped>
.rightPanel-background {
  position: fixed;
  top: 0;
  left: 0;
  opacity: 0;
  transition: opacity .3s cubic-bezier(.7, .3, .1, 1);
  background: rgba(0, 0, 0, .2);
  z-index: -1;
}

.rightPanel {
  width: 100%;
  max-width: 260px;
  height: 100vh;
  position: fixed;
  top: 0;
  right: 0;
  box-shadow: 0px 0px 15px 0px rgba(0, 0, 0, .05);
  transition: all .25s cubic-bezier(.7, .3, .1, 1);
  transform: translate(100%);
  background: #fff;
  z-index: 40000;
}

.show {
  transition: all .3s cubic-bezier(.7, .3, .1, 1);

  .rightPanel-background {
    z-index: 20000;
    opacity: 1;
    width: 100%;
    height: 100%;
  }

  .rightPanel {
    transform: translate(0);
  }
}

.handle-button {
  width: 48px;
  height: 48px;
  position: absolute;
  left: -48px;
  text-align: center;
  font-size: 24px;
  border-radius: 6px 0 0 6px !important;
  z-index: 0;
  pointer-events: auto;
  cursor: pointer;
  color: #fff;
  line-height: 48px;

  i {
    font-size: 24px;
    line-height: 48px;
  }
}
</style>
