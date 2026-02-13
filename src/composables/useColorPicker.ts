import { computed } from 'vue'
import { useEditorStore } from '@/stores/useEditorStore'

export function useColorPicker() {
  const editorStore = useEditorStore()

  function setForeground(color: string) {
    editorStore.setForegroundColor(color)
  }

  function setBackground(color: string) {
    editorStore.setBackgroundColor(color)
  }

  function swap() {
    editorStore.swapColors()
  }

  function reset() {
    editorStore.resetColors()
  }

  return {
    foregroundColor: computed(() => editorStore.foregroundColor),
    backgroundColor: computed(() => editorStore.backgroundColor),
    setForeground,
    setBackground,
    swap,
    reset,
  }
}
