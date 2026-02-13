<template>
  <div class="selection-options">
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
import { ContentAwareFill } from '@/core/selection/ContentAwareFill'

const canvasStore = useCanvasStore()
const hasSelection = ref(false)

function checkSelection() {
  const canvas = canvasStore.canvasInstance
  if (!canvas) {
    hasSelection.value = false
    return
  }
  hasSelection.value = canvas.getObjects().some((obj: any) => obj.name === '__selection')
}

function handleContentAwareFill() {
  const canvas = canvasStore.canvasInstance
  if (!canvas) return
  ContentAwareFill.execute(canvas)
  hasSelection.value = false
}

let intervalId: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  intervalId = setInterval(checkSelection, 500)
})

onBeforeUnmount(() => {
  if (intervalId) clearInterval(intervalId)
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
