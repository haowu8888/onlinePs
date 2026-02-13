<template>
  <div class="statusbar">
    <div class="statusbar__left">
      <span class="statusbar__item">
        坐标: {{ canvasStore.mouseX }}, {{ canvasStore.mouseY }}
      </span>
      <span class="statusbar__divider" />
      <span class="statusbar__item">
        画布: {{ editorStore.canvasWidth }} × {{ editorStore.canvasHeight }}
      </span>
    </div>
    <div class="statusbar__right">
      <span class="statusbar__item">
        {{ currentToolName }}
      </span>
      <span class="statusbar__divider" />
      <span class="statusbar__item">
        缩放: {{ zoomPercentage }}%
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCanvasStore } from '@/stores/useCanvasStore'
import { useEditorStore } from '@/stores/useEditorStore'
import { useToolStore } from '@/stores/useToolStore'
import { TOOL_LIST } from '@/constants/tools'

const canvasStore = useCanvasStore()
const editorStore = useEditorStore()
const toolStore = useToolStore()

const currentToolName = computed(() =>
  TOOL_LIST.find(t => t.id === toolStore.currentTool)?.name || ''
)

const zoomPercentage = computed(() =>
  Math.round(canvasStore.zoom * 100)
)
</script>

<style scoped lang="scss">
.statusbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  background: $bg-darker;
  border-top: 1px solid $border-color;
  padding: 0 12px;
  font-size: $font-size-xs;
  color: $text-secondary;

  &__left, &__right {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__item {
    white-space: nowrap;
  }

  &__divider {
    width: 1px;
    height: 12px;
    background: $border-color;
  }
}
</style>
