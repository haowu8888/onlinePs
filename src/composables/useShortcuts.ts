import { onMounted, onUnmounted } from 'vue'
import hotkeys from 'hotkeys-js'
import { useToolStore } from '@/stores/useToolStore'
import { useEditorStore } from '@/stores/useEditorStore'
import { useHistoryStore } from '@/stores/useHistoryStore'
import { useLayerStore } from '@/stores/useLayerStore'
import { useCanvasStore } from '@/stores/useCanvasStore'
import { canvasManager } from '@/core/canvas/CanvasManager'
import { ToolEnum, findSlotForTool } from '@/constants/tools'
import { SHORTCUTS } from '@/constants/shortcuts'
import eventBus from '@/core/canvas/CanvasEventBus'
import { deleteInSelection, copyFromSelection, extractSelection, pasteSelectionClipboard } from '@/core/selection/SelectionOperations'
import * as fabric from 'fabric'

export function useShortcuts() {
  const toolStore = useToolStore()
  const editorStore = useEditorStore()
  const historyStore = useHistoryStore()
  const layerStore = useLayerStore()
  const canvasStore = useCanvasStore()

  function handleToolShortcut(targetTool: ToolEnum) {
    const slot = findSlotForTool(targetTool)
    if (!slot) {
      toolStore.setTool(targetTool)
      return
    }

    // If current tool is in the same slot, cycle to the next tool
    if (slot.tools.includes(toolStore.currentTool)) {
      const currentIdx = slot.tools.indexOf(toolStore.currentTool)
      const nextIdx = (currentIdx + 1) % slot.tools.length
      toolStore.setSlotTool(slot.id, slot.tools[nextIdx])
    } else {
      // Switch to the slot's currently active tool
      toolStore.setTool(toolStore.getSlotTool(slot.id))
    }
  }

  function handleShortcut(action: string) {
    // Tool shortcuts
    const toolMap: Record<string, ToolEnum> = {
      'move': ToolEnum.Move,
      'rect-selection': ToolEnum.RectSelection,
      'lasso': ToolEnum.Lasso,
      'magic-wand': ToolEnum.MagicWand,
      'crop': ToolEnum.Crop,
      'eyedropper': ToolEnum.Eyedropper,
      'brush': ToolEnum.Brush,
      'eraser': ToolEnum.Eraser,
      'clone-stamp': ToolEnum.CloneStamp,
      'blur-brush': ToolEnum.BlurBrush,
      'dodge-burn': ToolEnum.DodgeBurn,
      'gradient': ToolEnum.Gradient,
      'text': ToolEnum.Text,
      'shape': ToolEnum.Shape,
      'pen': ToolEnum.Pen,
      'transform': ToolEnum.Transform,
    }

    if (toolMap[action]) {
      handleToolShortcut(toolMap[action])
      return
    }

    const canvas = canvasStore.canvasInstance

    switch (action) {
      case 'undo':
        historyStore.undo()
        break
      case 'redo':
        historyStore.redo()
        break
      case 'swap-colors':
        editorStore.swapColors()
        break
      case 'default-colors':
        editorStore.resetColors()
        break
      case 'zoom-in':
        canvasManager.viewportManager?.zoomIn()
        break
      case 'zoom-out':
        canvasManager.viewportManager?.zoomOut()
        break
      case 'zoom-fit':
        canvasManager.viewportManager?.zoomToFit()
        break
      case 'zoom-100':
        canvasManager.viewportManager?.resetView()
        break
      case 'new':
        eventBus.emit('dialog:new-canvas')
        break
      case 'export':
        eventBus.emit('dialog:export')
        break
      case 'copy':
        if (canvas) {
          const selObjCopy = canvas.getObjects().find((o: any) => o.name === '__selection')
          if (selObjCopy) {
            copyFromSelection(canvas)
            break
          }
          const active = canvas.getActiveObject()
          if (active) {
            active.clone().then((cloned: any) => {
              (window as any).__clipboard = cloned
            })
          }
        }
        break
      case 'paste':
        if (canvas) {
          if ((window as any).__selectionClipboard) {
            pasteSelectionClipboard(canvas)
            break
          }
          if ((window as any).__clipboard) {
            (window as any).__clipboard.clone().then((cloned: any) => {
              cloned.set({ left: (cloned.left || 0) + 10, top: (cloned.top || 0) + 10 })
              canvas.add(cloned)
              canvas.setActiveObject(cloned)
              canvas.renderAll()
              editorStore.markDirty()
            })
          }
        }
        break
      case 'cut':
        if (canvas) {
          const selObjCut = canvas.getObjects().find((o: any) => o.name === '__selection')
          if (selObjCut) {
            extractSelection(canvas, editorStore.backgroundColor)
            break
          }
          const active = canvas.getActiveObject()
          if (active) {
            active.clone().then((cloned: any) => {
              (window as any).__clipboard = cloned
            })
            canvas.remove(active)
            canvas.renderAll()
            editorStore.markDirty()
          }
        }
        break
      case 'delete':
        if (canvas) {
          const selObjDel = canvas.getObjects().find((o: any) => o.name === '__selection')
          if (selObjDel) {
            deleteInSelection(canvas, editorStore.backgroundColor)
            break
          }
          const active = canvas.getActiveObject()
          if (active && (active as any).name !== '__background') {
            canvas.remove(active)
            canvas.renderAll()
            editorStore.markDirty()
          }
        }
        break
      case 'select-all':
        if (canvas) {
          const objs = canvas.getObjects().filter((o: any) => o.name !== '__background' && o.name !== '__selection')
          if (objs.length > 0) {
            canvas.discardActiveObject()
            const sel = new (fabric as any).ActiveSelection(objs, { canvas })
            canvas.setActiveObject(sel)
            canvas.renderAll()
          }
        }
        break
      case 'deselect':
        if (canvas) {
          // Remove selection overlays (__selection objects)
          const selObjs = canvas.getObjects().filter(
            (o: any) => o.name === '__selection' || o.name === '__selection_preview'
          )
          selObjs.forEach(obj => canvas.remove(obj))
          if (selObjs.length > 0) {
            eventBus.emit('selection:changed', false)
          }
          canvas.discardActiveObject()
          canvas.renderAll()
        }
        break
      case 'new-layer':
        layerStore.addLayer()
        break
      case 'quick-mask':
        editorStore.toggleQuickMask()
        break
    }
  }

  onMounted(() => {
    // Allow shortcuts to work even when input is focused
    hotkeys.filter = () => true

    // Register all shortcuts
    for (const [key, action] of Object.entries(SHORTCUTS)) {
      hotkeys(key, (e) => {
        // Don't intercept shortcuts when editing text
        const target = e.target as HTMLElement
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
          // Only allow Ctrl-based shortcuts in text inputs
          if (!e.ctrlKey && !e.metaKey) return
        }
        e.preventDefault()
        handleShortcut(action)
      })
    }
  })

  onUnmounted(() => {
    hotkeys.unbind()
  })
}
