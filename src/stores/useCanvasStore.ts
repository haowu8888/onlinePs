import { defineStore } from 'pinia'
import { ref, shallowRef } from 'vue'
import type * as fabric from 'fabric'

export const useCanvasStore = defineStore('canvas', () => {
  const canvasInstance = shallowRef<fabric.Canvas | null>(null)
  const zoom = ref(1)
  const panX = ref(0)
  const panY = ref(0)
  const mouseX = ref(0)
  const mouseY = ref(0)
  const canvasReady = ref(false)

  function setCanvas(canvas: fabric.Canvas) {
    canvasInstance.value = canvas
    canvasReady.value = true
  }

  function setZoom(z: number) {
    zoom.value = z
  }

  function setPan(x: number, y: number) {
    panX.value = x
    panY.value = y
  }

  function setMousePosition(x: number, y: number) {
    mouseX.value = Math.round(x)
    mouseY.value = Math.round(y)
  }

  function clearCanvas() {
    canvasInstance.value = null
    canvasReady.value = false
  }

  return {
    canvasInstance,
    zoom,
    panX,
    panY,
    mouseX,
    mouseY,
    canvasReady,
    setCanvas,
    setZoom,
    setPan,
    setMousePosition,
    clearCanvas,
  }
})
