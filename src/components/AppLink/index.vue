<template>
  <component :is="linkType" v-bind="linkProps(to)">
    <slot />
  </component>
</template>

<script setup lang="ts">
defineOptions({
  name: "AppLink",
  inheritAttrs: false,
});

import { isExternal } from "@/utils/index";

const props = defineProps({
  to: {
    type: Object,
    required: true,
  },
});

const isExternalLink = computed(() => {
  return isExternal(props.to.path || "");
});

const linkType = computed(() => (isExternalLink.value ? "a" : "router-link"));

const linkProps = (to: any) => {
  if (isExternalLink.value) {
    return {
      href: to.path,
      target: "_blank",
      rel: "noopener noreferrer",
    };
  }
  return { to };
};
</script>
