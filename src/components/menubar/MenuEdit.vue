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
import * as fabric from 'fabric'

const historyStore = useHistoryStore()
const canvasStore = useCanvasStore()

function handleCommand(action: string) {
  const canvas = canvasStore.canvasInstance
  switch (action) {
    case 'undo':
      historyStore.undo()
      break
    case 'redo':
      historyStore.redo()
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
      canvas?.discardActiveObject()
      canvas?.requestRenderAll()
      break
    case 'delete':
      if (canvas) {
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

<style scoped lang="scss">
.menu-trigger {
  padding: 4px 10px;
  cursor: pointer;
  font-size: $font-size-sm;
  color: $text-primary;
  border-radius: 2px;
  &:hover { background: $bg-light; }
}
.menu-item-label { flex: 1; }
.menu-item-shortcut { margin-left: 30px; color: $text-muted; font-size: $font-size-xs; }
.menu-divider { height: 1px; background: $border-color; margin: 4px 0; }
:deep(.el-dropdown-menu__item) {
  display: flex; justify-content: space-between; align-items: center;
  min-width: 200px; padding: 6px 20px; font-size: $font-size-sm;
}
</style>
