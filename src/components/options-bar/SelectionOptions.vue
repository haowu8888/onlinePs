<template>
  <div class="selection-options">
    <el-button
      size="small"
      :disabled="!hasSelection"
      @click="handleFillForeground"
    >
      填充前景色
    </el-button>
    <el-button
      size="small"
      :disabled="!hasSelection"
      @click="handleFillBackground"
    >
      填充背景色
    </el-button>
    <el-button
      size="small"
      :disabled="!hasSelection"
      @click="handleDelete"
    >
      删除
    </el-button>
    <el-button
      size="small"
      :disabled="!hasSelection"
      @click="handleStroke"
    >
      描边
    </el-button>
    <el-button
      size="small"
      type="primary"
      :disabled="!hasSelection"
      @click="handleContentAwareFill"
    >
      去水印
    </el-button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useCanvasStore } from '@/stores/useCanvasStore'
import { useEditorStore } from '@/stores/useEditorStore'
import { ContentAwareFill } from '@/core/selection/ContentAwareFill'
import { fillInSelection, deleteInSelection, strokeSelection } from '@/core/selection/SelectionOperations'
import eventBus from '@/core/canvas/CanvasEventBus'

const canvasStore = useCanvasStore()
const editorStore = useEditorStore()
const hasSelection = ref(false)

function onSelectionChanged(exists: boolean) {
  hasSelection.value = exists
}

function handleFillForeground() {
  const canvas = canvasStore.canvasInstance
  if (!canvas) return
  fillInSelection(canvas, editorStore.foregroundColor)
}

function handleFillBackground() {
  const canvas = canvasStore.canvasInstance
  if (!canvas) return
  fillInSelection(canvas, editorStore.backgroundColor)
}

function handleDelete() {
  const canvas = canvasStore.canvasInstance
  if (!canvas) return
  deleteInSelection(canvas, editorStore.backgroundColor)
}

function handleStroke() {
  const canvas = canvasStore.canvasInstance
  if (!canvas) return
  strokeSelection(canvas, editorStore.foregroundColor, 2)
}

function handleContentAwareFill() {
  const canvas = canvasStore.canvasInstance
  if (!canvas) return
  ContentAwareFill.execute(canvas)
}

onMounted(() => {
  eventBus.on('selection:changed', onSelectionChanged)
})

onBeforeUnmount(() => {
  eventBus.off('selection:changed', onSelectionChanged)
})
</script>

<style scoped lang="scss">
.selection-options {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 100%;
}
</style>
