<template>
  <EditorLayout />
  <NewCanvasDialog v-model="showNewCanvas" @create="handleNewCanvas" />
  <ExportDialog v-model="showExport" />
  <CanvasResizeDialog v-model="showCanvasResize" @resize="handleCanvasResize" />
  <ImageResizeDialog v-model="showImageResize" @resize="handleImageResize" />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import EditorLayout from '@/components/layout/EditorLayout.vue'
import NewCanvasDialog from '@/components/dialogs/NewCanvasDialog.vue'
import ExportDialog from '@/components/dialogs/ExportDialog.vue'
import CanvasResizeDialog from '@/components/dialogs/CanvasResizeDialog.vue'
import ImageResizeDialog from '@/components/dialogs/ImageResizeDialog.vue'
import { useShortcuts } from '@/composables/useShortcuts'
import { useEditorStore } from '@/stores/useEditorStore'
import { useCanvasStore } from '@/stores/useCanvasStore'
import { useLayerStore } from '@/stores/useLayerStore'
import { canvasManager } from '@/core/canvas/CanvasManager'
import eventBus from '@/core/canvas/CanvasEventBus'
import * as fabric from 'fabric'

useShortcuts()

const editorStore = useEditorStore()
const canvasStore = useCanvasStore()
const layerStore = useLayerStore()

const showNewCanvas = ref(false)
const showExport = ref(false)
const showCanvasResize = ref(false)
const showImageResize = ref(false)

// Listen for dialog open events
eventBus.on('dialog:new-canvas', () => { showNewCanvas.value = true })
eventBus.on('dialog:export', () => { showExport.value = true })
eventBus.on('dialog:canvas-size', () => { showCanvasResize.value = true })
eventBus.on('dialog:image-size', () => { showImageResize.value = true })

function handleNewCanvas(config: { name: string; width: number; height: number; bgColor: string }) {
  editorStore.setDocumentName(config.name)
  editorStore.setCanvasSize(config.width, config.height)

  const canvas = canvasStore.canvasInstance
  if (!canvas) return

  // Clear existing objects
  canvas.clear()
  layerStore.clearLayers()

  // Add new background
  const bgRect = new fabric.Rect({
    width: config.width,
    height: config.height,
    fill: config.bgColor,
    selectable: false,
    evented: false,
    name: '__background',
  })
  canvas.add(bgRect)
  canvas.centerObject(bgRect)
  canvas.renderAll()

  layerStore.addLayer('背景')
  editorStore.markClean()
}

function handleCanvasResize(size: { width: number; height: number }) {
  editorStore.setCanvasSize(size.width, size.height)
  const canvas = canvasStore.canvasInstance
  if (!canvas) return

  // Update background rect
  const bg = canvas.getObjects().find((o: any) => o.name === '__background')
  if (bg) {
    bg.set({ width: size.width, height: size.height })
    canvas.centerObject(bg)
    canvas.renderAll()
  }
}

function handleImageResize(size: { width: number; height: number }) {
  const canvas = canvasStore.canvasInstance
  if (!canvas) return

  const oldW = editorStore.canvasWidth
  const oldH = editorStore.canvasHeight
  if (oldW <= 0 || oldH <= 0) return

  const scaleX = size.width / oldW
  const scaleY = size.height / oldH

  editorStore.setCanvasSize(size.width, size.height)

  // Scale all objects proportionally
  canvas.getObjects().forEach((obj: any) => {
    if (obj.name === '__background') {
      obj.set({ width: size.width, height: size.height })
    } else {
      obj.set({
        left: (obj.left ?? 0) * scaleX,
        top: (obj.top ?? 0) * scaleY,
        scaleX: (obj.scaleX ?? 1) * scaleX,
        scaleY: (obj.scaleY ?? 1) * scaleY,
      })
      obj.setCoords()
    }
  })

  canvas.getObjects().forEach((obj: any) => {
    if (obj.name === '__background') {
      canvas.centerObject(obj)
    }
  })

  canvas.renderAll()
  editorStore.markDirty()
}

// Warn before leaving if dirty
onMounted(() => {
  window.addEventListener('beforeunload', handleBeforeUnload)
})

onUnmounted(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
})

function handleBeforeUnload(e: BeforeUnloadEvent) {
  if (editorStore.isDirty) {
    e.preventDefault()
    e.returnValue = ''
  }
}
</script>
