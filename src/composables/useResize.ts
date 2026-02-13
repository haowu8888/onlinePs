import { onMounted, onUnmounted } from 'vue'
import { canvasManager } from '@/core/canvas/CanvasManager'
import { useCanvasStore } from '@/stores/useCanvasStore'

export function useResize() {
  const canvasStore = useCanvasStore()

  function handleResize() {
    const canvas = canvasStore.canvasInstance
    if (!canvas) return

    const wrapper = canvas.getElement()?.parentElement?.parentElement
    if (!wrapper) return

    const rect = wrapper.getBoundingClientRect()
    canvasManager.resize(rect.width, rect.height)
  }

  onMounted(() => {
    window.addEventListener('resize', handleResize)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
  })

  return { handleResize }
}
