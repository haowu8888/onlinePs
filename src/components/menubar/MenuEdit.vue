<template>
  <el-dropdown trigger="click" @command="handleCommand" :teleported="true">
    <span class="menu-trigger">编辑</span>
    <template #dropdown>
      <el-dropdown-menu>
        <template v-for="item in EDIT_MENU" :key="item.label">
          <el-dropdown-item v-if="!item.divider" :command="item.action" :disabled="item.disabled">
            <span class="menu-item-label">{{ item.label }}</span>
            <span v-if="item.shortcut" class="menu-item-shortcut">{{ item.shortcut }}</span>
          </el-dropdown-item>
          <div v-else class="menu-divider" />
        </template>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
import { EDIT_MENU } from '@/constants/menu'
import { useHistoryStore } from '@/stores/useHistoryStore'
import { useCanvasStore } from '@/stores/useCanvasStore'
import { useEditorStore } from '@/stores/useEditorStore'
import { copyFromSelection, extractSelection, pasteSelectionClipboard, deleteInSelection } from '@/core/selection/SelectionOperations'
import eventBus from '@/core/canvas/CanvasEventBus'
import * as fabric from 'fabric'

const historyStore = useHistoryStore()
const canvasStore = useCanvasStore()
const editorStore = useEditorStore()

function handleCommand(action: string) {
  const canvas = canvasStore.canvasInstance
  switch (action) {
    case 'undo':
      historyStore.undo()
      break
    case 'redo':
      historyStore.redo()
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
    case 'select-all':
      if (canvas) {
        canvas.discardActiveObject()
        const objs = canvas.getObjects().filter((o: any) => o.name !== '__background' && o.name !== '__selection')
        if (objs.length > 0) {
          const sel = new fabric.ActiveSelection(objs, { canvas })
          canvas.setActiveObject(sel)
        }
        canvas.requestRenderAll()
      }
      break
    case 'deselect':
      if (canvas) {
        // Remove selection overlays
        const selObjs = canvas.getObjects().filter(
          (o: any) => o.name === '__selection' || o.name === '__selection_preview'
        )
        selObjs.forEach(obj => canvas.remove(obj))
        if (selObjs.length > 0) {
          eventBus.emit('selection:changed', false)
        }
        canvas.discardActiveObject()
        canvas.requestRenderAll()
      }
      break
    case 'delete':
      if (canvas) {
        const selObjDel = canvas.getObjects().find((o: any) => o.name === '__selection')
        if (selObjDel) {
          deleteInSelection(canvas, editorStore.backgroundColor)
          break
        }
        const active = canvas.getActiveObjects()
        active.forEach((obj: any) => {
          if (obj.name !== '__background') canvas.remove(obj)
        })
        canvas.discardActiveObject()
        canvas.requestRenderAll()
      }
      break
  }
}
</script>

