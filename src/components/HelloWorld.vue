<template>
  <el-input v-model="input" placeholder="Please input" />
  <el-input-number v-model="num" :min="1" :max="10" @change="handleChange"/>
</template>

<script lang="ts">
import {defineComponent, ref} from 'vue'


export default defineComponent({
  setup() {
    const num = ref(1)
    const handleChange = (value: string) => {
      console.log(value)
    }
    return {
      input:ref(''),
      num,
      handleChange,
    }
  },
})
</script>


<style scoped>
a {
  color: #42b983;
}

label {
  margin: 0 0.5em;
  font-weight: bold;
}

code {
  background-color: #eee;
  padding: 2px 4px;
  border-radius: 4px;
  color: #304455;
}
</style>
