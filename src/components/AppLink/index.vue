<template>
  <component :is="linkType" v-bind="linkProps(to)" @click="handleClick">
    <slot />
  </component>
</template>

<script setup lang="ts">
import { isExternal } from "@/utils/index";

defineOptions({
  name: "AppLink",
  inheritAttrs: false,
});

interface AppLinkTo {
  path: string;
  meta?: {
    externalUrl?: string;
    type?: string;
  };
  query?: Record<string, unknown> | null;
}

const props = defineProps<{
  to: AppLinkTo;
}>();

const externalUrl = computed(() => {
  return isExternal(props.to.path || "") ? props.to.path : "";
});

const isExternalLink = computed(() => {
  return Boolean(externalUrl.value);
});

const linkType = computed(() => (isExternalLink.value ? "a" : "router-link"));

/**
 * 拼接链接属性：外链给 a 标签，内链交给 router-link
 */
const linkProps = (to: AppLinkTo) => {
  if (isExternalLink.value) {
    return {
      href: externalUrl.value,
      target: "_blank",
      rel: "noopener noreferrer",
    };
  }

  const { meta, ...routeTo } = to;
  void meta;
  return { to: routeTo };
};

/**
 * 外链点击自行处理跳转，不走 router-link 的默认行为
 */
function handleClick(event: MouseEvent) {
  if (!isExternalLink.value) return;

  event.preventDefault();
  event.stopPropagation();
  window.open(externalUrl.value, "_blank", "noopener,noreferrer");
}
</script>
