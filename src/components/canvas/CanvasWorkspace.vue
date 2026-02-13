<template>
  <div
    class="canvas-workspace"
    ref="workspaceRef"
    @dragover.prevent
    @drop.prevent="handleDrop"
  >
    <div class="canvas-workspace__inner">
      <canvas ref="canvasRef" />
    </div>
    <div v-if="!canvasStore.canvasReady" class="canvas-workspace__placeholder">
      <div class="placeholder-content">
        <el-icon :size="48"><Picture /></el-icon>
        <p>拖拽图片到此处或通过菜单新建画布</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { Picture } from '@element-plus/icons-vue'
import { canvasManager } from '@/core/canvas/CanvasManager'
import { useCanvasStore } from '@/stores/useCanvasStore'
import { useEditorStore } from '@/stores/useEditorStore'
import { useLayerStore } from '@/stores/useLayerStore'
import { useHistoryStore } from '@/stores/useHistoryStore'
import { useCanvas } from '@/composables/useCanvas'
import { AddObjectCommand } from '@/core/history/commands'
import eventBus from '@/core/canvas/CanvasEventBus'
import * as fabric from 'fabric'

const canvasRef = ref<HTMLCanvasElement>()
const workspaceRef = ref<HTMLDivElement>()
const canvasStore = useCanvasStore()
const editorStore = useEditorStore()
const layerStore = useLayerStore()
const historyStore = useHistoryStore()
const { initTools } = useCanvas()

let resizeObserver: ResizeObserver | null = null

onMounted(async () => {
  await nextTick()
  initCanvas()
  setupResizeObserver()
  setupEventListeners()
})

onUnmounted(() => {
  resizeObserver?.disconnect()
  canvasManager.dispose()
  canvasStore.clearCanvas()
})

function initCanvas() {
  if (!canvasRef.value || !workspaceRef.value) return

  const rect = workspaceRef.value.getBoundingClientRect()
  const canvas = canvasManager.init(canvasRef.value, rect.width, rect.height)
  canvasStore.setCanvas(canvas)

  // Add default white background rect to represent document
  const bgRect = new fabric.Rect({
    width: editorStore.canvasWidth,
    height: editorStore.canvasHeight,
    fill: '#ffffff',
    selectable: false,
    evented: false,
    name: '__background',
  })
  canvas.add(bgRect)
  canvas.centerObject(bgRect)
  canvas.renderAll()

  // Initialize tool system
  initTools(canvas)

  // Add default layer
  layerStore.addLayer('背景')
}

function setupResizeObserver() {
  if (!workspaceRef.value) return
  resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const { width, height } = entry.contentRect
      canvasManager.resize(width, height)
    }
  })
  resizeObserver.observe(workspaceRef.value)
}

function setupEventListeners() {
  eventBus.on('zoom:changed', (zoom) => {
    canvasStore.setZoom(zoom)
  })

  eventBus.on('pan:changed', ({ x, y }) => {
    canvasStore.setPan(x, y)
  })

  // Track mouse position
  const canvas = canvasStore.canvasInstance
  if (!canvas) return

  canvas.on('mouse:move', (opt) => {
    const pointer = canvas.getScenePoint(opt.e)
    canvasStore.setMousePosition(pointer.x, pointer.y)
  })

  // Listen for image imports
  eventBus.on('object:added', (payload: any) => {
    if (payload?.type === 'image-import') {
      importImage(payload.data, payload.name)
    }
  })

  // Track brush strokes for history
  canvas.on('path:created', (e: any) => {
    const path = e.path
    if (!path) return
    const command = new AddObjectCommand(canvas, path, '画笔绘制')
    historyStore.pushCommand(command)
    editorStore.markDirty()
  })

  // Track shape/text creation for history and layers
  eventBus.on('tool:object-created', (payload) => {
    const command = new AddObjectCommand(canvas, payload.object, payload.name)
    historyStore.pushCommand(command)
    if (payload.layerName) {
      layerStore.addLayer(payload.layerName)
    }
    editorStore.markDirty()
  })
}

function importImage(dataUrl: string, name: string) {
  const canvas = canvasStore.canvasInstance
  if (!canvas) return

  const imgEl = new Image()
  imgEl.onload = () => {
    const fabricImg = new fabric.FabricImage(imgEl, {
      left: 0,
      top: 0,
    })

    // Scale to fit canvas
    const canvasWidth = editorStore.canvasWidth
    const canvasHeight = editorStore.canvasHeight
    const scale = Math.min(canvasWidth / imgEl.width, canvasHeight / imgEl.height, 1)
    fabricImg.scale(scale)

    canvas.add(fabricImg)
    canvas.centerObject(fabricImg)
    canvas.setActiveObject(fabricImg)
    canvas.renderAll()

    layerStore.addLayer(name)
    editorStore.markDirty()
  }
  imgEl.src = dataUrl
}

function handleDrop(e: DragEvent) {
  const files = e.dataTransfer?.files
  if (!files?.length) return

  const file = files[0]
  if (!file.type.startsWith('image/')) return

  const reader = new FileReader()
  reader.onload = (ev) => {
    const dataUrl = ev.target?.result as string
    if (!canvasStore.canvasReady) {
      initCanvas()
    }
    importImage(dataUrl, file.name)
  }
  reader.readAsDataURL(file)
}
</script>

<style scoped lang="scss">
.canvas-workspace {
  width: 100%;
  height: 100%;
  background: $bg-darkest;
  position: relative;
  overflow: hidden;

  // Checkerboard pattern for transparent areas
  background-image:
    linear-gradient(45deg, #2a2a2a 25%, transparent 25%),
    linear-gradient(-45deg, #2a2a2a 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #2a2a2a 75%),
    linear-gradient(-45deg, transparent 75%, #2a2a2a 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;

  &__inner {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__placeholder {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;

    .placeholder-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      color: $text-muted;

      p {
        font-size: $font-size-base;
      }
    }
  }
}
</style>
