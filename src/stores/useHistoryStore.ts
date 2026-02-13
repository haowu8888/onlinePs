import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ICommand, HistoryEntry } from '@/types/history'
import { v4 as uuidv4 } from 'uuid'

export const useHistoryStore = defineStore('history', () => {
  const undoStack = ref<HistoryEntry[]>([])
  const redoStack = ref<HistoryEntry[]>([])
  const maxHistory = 50

  const canUndo = computed(() => undoStack.value.length > 0)
  const canRedo = computed(() => redoStack.value.length > 0)
  const historyList = computed(() => [...undoStack.value].reverse())

  function pushCommand(command: ICommand) {
    const entry: HistoryEntry = {
      id: uuidv4(),
      name: command.name,
      timestamp: command.timestamp,
      command,
    }
    undoStack.value.push(entry)
    if (undoStack.value.length > maxHistory) {
      undoStack.value.shift()
    }
    redoStack.value = []
  }

  function undo() {
    const entry = undoStack.value.pop()
    if (!entry) return
    entry.command.undo()
    redoStack.value.push(entry)
  }

  function redo() {
    const entry = redoStack.value.pop()
    if (!entry) return
    entry.command.execute()
    undoStack.value.push(entry)
  }

  function jumpTo(index: number) {
    const targetLen = index + 1
    while (undoStack.value.length > targetLen) {
      const entry = undoStack.value.pop()!
      entry.command.undo()
      redoStack.value.push(entry)
    }
    while (undoStack.value.length < targetLen && redoStack.value.length > 0) {
      const entry = redoStack.value.pop()!
      entry.command.execute()
      undoStack.value.push(entry)
    }
  }

  function clear() {
    undoStack.value = []
    redoStack.value = []
  }

  return {
    undoStack,
    redoStack,
    canUndo,
    canRedo,
    historyList,
    pushCommand,
    undo,
    redo,
    jumpTo,
    clear,
  }
})
