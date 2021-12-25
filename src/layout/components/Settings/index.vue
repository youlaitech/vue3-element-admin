<template>
  <div class="drawer-container">
    <div>
      <h3 class="drawer-title">系统布局配置</h3>

      <div class="drawer-item">
        <span>主题色</span>
        <theme-picker style="float: right;height: 26px;margin: -3px 8px 0 0;" @change="themeChange"/>
      </div>

      <div class="drawer-item">
        <span>开启 Tags-View</span>
        <el-switch v-model="tagsView" class="drawer-switch"/>
      </div>

      <div class="drawer-item">
        <span>固定 Header</span>
        <el-switch v-model="fixedHeader" class="drawer-switch"/>
      </div>

      <div class="drawer-item">
        <span>侧边栏 Logo</span>
        <el-switch v-model="sidebarLogo" class="drawer-switch"/>
      </div>
    </div>
  </div>
</template>

<script>
import ThemePicker from '@/components/ThemePicker/index.vue'
import {defineComponent, reactive, toRefs, watch} from "vue"
// import {useStore} from '@/store'
import { useSettingStoreHook } from "@/store/modules/settings";
export default defineComponent({
  components: {ThemePicker},
  setup() {
    // const store = useStore()
    const state = reactive({
      fixedHeader:useSettingStoreHook().fixedHeader,
      tagsView:useSettingStoreHook().tagsView,
      sidebarLogo:useSettingStoreHook().sidebarLogo,
      themeChange: (val) => {
        useSettingStoreHook().changeSetting( { key: 'theme', val })
      }
    })
    watch(()=>state.fixedHeader,(value)=>{
      useSettingStoreHook().changeSetting( { key: 'fixedHeader', value })
    })

    watch(() => state.tagsView, (value) => {
      useSettingStoreHook().changeSetting( { key: 'showTagsView', value })
    })

    watch(() => state.sidebarLogo, (value) => {
      useSettingStoreHook().changeSetting( { key: 'sidebarLogo', value })
    })

    return {
      ...toRefs(state)
    }
  }
})
</script>

<style lang="scss" scoped>
.drawer-container {
  padding: 24px;
  font-size: 14px;
  line-height: 1.5;
  word-wrap: break-word;

  .drawer-title {
    margin-bottom: 12px;
    color: rgba(0, 0, 0, .85);
    font-size: 14px;
    line-height: 22px;
  }

  .drawer-item {
    color: rgba(0, 0, 0, .65);
    font-size: 14px;
    padding: 12px 0;
  }

  .drawer-switch {
    float: right
  }

  .job-link {
    display: block;
    position: absolute;
    width: 100%;
    left: 0;
    bottom: 0;
  }
}
</style>
