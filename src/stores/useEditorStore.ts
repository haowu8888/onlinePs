import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useEditorStore = defineStore('editor', () => {
  const documentName = ref('未命名')
  const isDirty = ref(false)
  const foregroundColor = ref('#000000')
  const backgroundColor = ref('#ffffff')
  const canvasWidth = ref(1200)
  const canvasHeight = ref(800)

  function setForegroundColor(color: string) {
    foregroundColor.value = color
  }

  function setBackgroundColor(color: string) {
    backgroundColor.value = color
  }

  function swapColors() {
    const temp = foregroundColor.value
    foregroundColor.value = backgroundColor.value
    backgroundColor.value = temp
  }

  function resetColors() {
    foregroundColor.value = '#000000'
    backgroundColor.value = '#ffffff'
  }

  function setDocumentName(name: string) {
    documentName.value = name
  }

  function markDirty() {
    isDirty.value = true
  }

  function markClean() {
    isDirty.value = false
  }

  function setCanvasSize(width: number, height: number) {
    canvasWidth.value = width
    canvasHeight.value = height
  }

  return {
    documentName,
    isDirty,
    foregroundColor,
    backgroundColor,
    canvasWidth,
    canvasHeight,
    setForegroundColor,
    setBackgroundColor,
    swapColors,
    resetColors,
    setDocumentName,
    markDirty,
    markClean,
    setCanvasSize,
  }
})
