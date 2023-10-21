<script setup lang="ts">
import SvgIcon from "@/components/SvgIcon/index.vue";
import { translateRouteTitle } from "@/utils/i18n";

const props = defineProps({
  icon: {
    type: String,
    default: "",
  },
  title: {
    type: String,
    default: "",
  },
});

const vnodes: any[] = [];
if (props.icon) {
  if (props.icon.includes("el-icon")) {
    vnodes.push(h("i", { class: [props.icon, "sub-el-icon"] }));
  } else {
    vnodes.push(h(SvgIcon, { "icon-class": props.icon }));
  }
}

if (props.title) {
  vnodes.push(h("span", { slot: "title" }, translateRouteTitle(props.title)));
}
const render = h("div", vnodes);
</script>

<template>
  <render />
</template>

<style scoped>
.sub-el-icon {
  width: 1em;
  height: 1em;
  color: currentcolor;
}
</style>
