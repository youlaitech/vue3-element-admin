<template>
  <div ref="containerRef" class="bpmn-viewer" />
</template>

<script setup lang="ts">
import Viewer from "bpmn-js/lib/NavigatedViewer";

/** 画布服务调用子集（diagram-js Canvas，pnpm 严格模式下不可直接引用其类型） */
interface CanvasLike {
  zoom(scale: number | "fit-viewport"): number;
  addMarker(id: string, marker: string): void;
}

defineOptions({
  name: "BpmnViewer",
  inheritAttrs: false,
});

/**
 * BPMN 流程图查看器
 *
 * @description 渲染 BPMN XML 并按节点状态高亮：已办节点标记走过路径、
 * 进行中节点标记当前待办；缩放平移由 NavigatedViewer 自带滚轮/空格拖拽支持
 */
const props = defineProps<{
  /** BPMN 2.0 XML */
  xml: string;
  /** 已办节点ID列表（走过路径高亮） */
  executedActivityIds?: string[];
  /** 进行中节点ID列表（当前待办高亮） */
  activeActivityIds?: string[];
}>();

const containerRef = ref<HTMLElement | null>(null);
const viewer = shallowRef<Viewer>();

/**
 * 导入 XML 并叠加高亮标记
 *
 * @param xml BPMN XML
 * @param executedIds 已办节点ID列表
 * @param activeIds 进行中节点ID列表
 */
async function renderDiagram(
  xml: string,
  executedIds?: string[],
  activeIds?: string[]
): Promise<void> {
  if (!xml || !viewer.value) return;
  const canvas = viewer.value.get("canvas") as CanvasLike;
  try {
    await viewer.value.importXML(xml);
    canvas.zoom("fit-viewport");
    executedIds?.forEach((id) => canvas.addMarker(id, "bpmn-viewer__executed"));
    activeIds?.forEach((id) => canvas.addMarker(id, "bpmn-viewer__active"));
  } catch (error) {
    console.error("BPMN 流程图渲染失败:", error);
  }
}

// 后续 props 变化时重新渲染（post：待组件树更新完毕再执行）
watch(
  () => [props.xml, props.executedActivityIds, props.activeActivityIds],
  ([xml, executedIds, activeIds]) =>
    renderDiagram(
      xml as string,
      executedIds as string[] | undefined,
      activeIds as string[] | undefined
    ),
  { flush: "post" }
);

onMounted(() => {
  viewer.value = new Viewer({
    container: containerRef.value!,
    // 高亮样式挂在父级容器上，作用域仅本组件
  });
  // 动态挂载场景（v-if）：挂载时 xml 已是初始值而非变化，watch 不会触发，
  // 必须主动渲染一次，否则弹窗流程图空白
  if (props.xml) {
    renderDiagram(props.xml, props.executedActivityIds, props.activeActivityIds);
  }
});

onBeforeUnmount(() => {
  viewer.value?.destroy();
});
</script>

<style lang="scss">
.bpmn-viewer {
  width: 100%;
  height: 100%;

  // 已办节点：绿色描边，表示已走过的路径
  .bpmn-viewer__executed:not(.djs-connection) .djs-visual > :nth-child(1) {
    fill: var(--el-color-success-light-9) !important;
    stroke: var(--el-color-success) !important;
  }

  .bpmn-viewer__executed.djs-connection .djs-visual > :nth-child(1) {
    stroke: var(--el-color-success) !important;
  }

  // 进行中节点：橙色加粗描边，表示当前待办节点
  .bpmn-viewer__active:not(.djs-connection) .djs-visual > :nth-child(1) {
    fill: var(--el-color-warning-light-9) !important;
    stroke: var(--el-color-warning) !important;
    stroke-width: 2.5px !important;
  }
}
</style>
