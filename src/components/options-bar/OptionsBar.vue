<template>
  <div class="options-bar">
    <span v-if="hasToolOptions" class="options-bar__tool-name">{{ currentToolName }}</span>
    <span v-if="hasToolOptions" class="options-bar__separator" />
    <BrushOptions v-if="isBrushTool" />
    <ShapeOptions v-else-if="isShapeTool" />
    <TextOptions v-else-if="isTextTool" />
    <MagicWandOptions v-else-if="isMagicWand" />
    <BlurBrushOptions v-else-if="isBlurBrush" />
    <DodgeBurnOptions v-else-if="isDodgeBurn" />
    <PaintBucketOptions v-else-if="isPaintBucket" />
    <RulerOptions v-else-if="isRuler" />
    <div v-else class="options-bar__default">
      <span class="options-bar__tool-name">{{ currentToolName }}</span>
    </div>
    <template v-if="showSelectionOptions">
      <span class="options-bar__separator" />
      <SelectionOptions />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import { useToolStore } from '@/stores/useToolStore'
import { ToolEnum, TOOL_LIST } from '@/constants/tools'
import BrushOptions from './BrushOptions.vue'
import ShapeOptions from './ShapeOptions.vue'
import TextOptions from './TextOptions.vue'
import MagicWandOptions from './MagicWandOptions.vue'
import BlurBrushOptions from './BlurBrushOptions.vue'
import DodgeBurnOptions from './DodgeBurnOptions.vue'
import SelectionOptions from './SelectionOptions.vue'
import PaintBucketOptions from './PaintBucketOptions.vue'
import RulerOptions from './RulerOptions.vue'
import eventBus from '@/core/canvas/CanvasEventBus'

const toolStore = useToolStore()
const hasActiveSelection = ref(false)

function onSelectionChanged(exists: boolean) {
  hasActiveSelection.value = exists
}

onMounted(() => {
  eventBus.on('selection:changed', onSelectionChanged)
})

onBeforeUnmount(() => {
  eventBus.off('selection:changed', onSelectionChanged)
})

const isBrushTool = computed(() =>
  [ToolEnum.Brush, ToolEnum.Eraser, ToolEnum.CloneStamp].includes(toolStore.currentTool)
)

const isShapeTool = computed(() => toolStore.currentTool === ToolEnum.Shape)
const isTextTool = computed(() => toolStore.currentTool === ToolEnum.Text)
const isMagicWand = computed(() => toolStore.currentTool === ToolEnum.MagicWand)
const isBlurBrush = computed(() => toolStore.currentTool === ToolEnum.BlurBrush)
const isDodgeBurn = computed(() => toolStore.currentTool === ToolEnum.DodgeBurn)
const isPaintBucket = computed(() => toolStore.currentTool === ToolEnum.PaintBucket)
const isRuler = computed(() => toolStore.currentTool === ToolEnum.Ruler)
const isSelectionTool = computed(() =>
  [ToolEnum.RectSelection, ToolEnum.EllipseSelection, ToolEnum.Lasso, ToolEnum.PolygonalLasso, ToolEnum.MagneticLasso, ToolEnum.MagicWand].includes(toolStore.currentTool)
)

// Show SelectionOptions when a selection tool is active OR when a selection exists on canvas
const showSelectionOptions = computed(() =>
  isSelectionTool.value || hasActiveSelection.value
)

const hasToolOptions = computed(() =>
  isBrushTool.value || isShapeTool.value || isTextTool.value || isMagicWand.value || isBlurBrush.value || isDodgeBurn.value || isPaintBucket.value || isRuler.value
)

const currentToolName = computed(() =>
  TOOL_LIST.find(t => t.id === toolStore.currentTool)?.name || ''
)
</script>

<style scoped lang="scss">
.options-bar {
  display: flex;
  align-items: center;
  height: 100%;
  background: $bg-darker;
  border-bottom: 1px solid $border-color;
  padding: 0 12px;
  gap: 12px;

  &__default {
    display: flex;
    align-items: center;
  }

  &__tool-name {
    font-size: $font-size-sm;
    color: $text-secondary;
    white-space: nowrap;
  }

  &__separator {
    width: 1px;
    height: 20px;
    background: $border-color;
  }
}
</style>
