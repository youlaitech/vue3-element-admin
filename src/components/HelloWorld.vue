<template>
  <el-input v-model="num"/>
  <el-button @click="handleClick">点击+1</el-button>
</template>

<script  lang="ts">
import {defineComponent, computed} from 'vue'
import {userStore} from '@/store';

export default defineComponent({
  setup() {
    const store = userStore()
    const num = computed(()=>{
      return store.state.count
    })
    const handleClick = () => {
      store.commit('increment')
    }
    return {
      num,
      handleClick
    }
  },
})
</script>


