<template>
  <svg aria-hidden="true"  class="svg-icon">
    <use :xlink:href="symbolId" :fill="color" />
  </svg>
</template>

<script>
import { defineComponent, computed } from 'vue';

export default defineComponent({
  name: 'SvgIcon',
  props: {
    prefix: {
      type: String,
      default: 'icon',
    },
    iconClass: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      default: '#FFF',
    },
  },
  setup(props) {
    const symbolId = computed(() => `#${props.prefix}-${props.iconClass}`);
    return { symbolId };
  },
});
</script>

<style scoped>
.svg-icon {
  width: 1em;
  height: 1em;
  vertical-align: -0.15em;
  overflow: hidden;
  fill: currentColor;
}
</style>