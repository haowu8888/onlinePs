<template>
  <el-dropdown trigger="click" @command="handleCommand" :teleported="true">
    <span class="menu-trigger">图像</span>
    <template #dropdown>
      <el-dropdown-menu>
        <template v-for="item in IMAGE_MENU" :key="item.label">
          <el-dropdown-item v-if="!item.divider" :command="item.action">
            <span class="menu-item-label">{{ item.label }}</span>
          </el-dropdown-item>
          <div v-else class="menu-divider" />
        </template>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
import { IMAGE_MENU } from '@/constants/menu'
import { useCanvasStore } from '@/stores/useCanvasStore'
import eventBus from '@/core/canvas/CanvasEventBus'
import { applyAutoEffect } from '@/core/filters/AutoEnhance'
import { ContentAwareFill } from '@/core/selection/ContentAwareFill'
import { ElMessage } from 'element-plus'
import * as fabric from 'fabric'

const canvasStore = useCanvasStore()

function handleCommand(action: string) {
  const canvas = canvasStore.canvasInstance
  if (!canvas) return

  switch (action) {
    case 'canvas-size':
      eventBus.emit('dialog:canvas-size')
      break
    case 'auto-levels':
    case 'auto-contrast':
    case 'auto-enhance':
      applyAutoToSelection(action)
      break
    case 'content-aware-fill':
      executeContentAwareFill()
      break
    case 'flip-h':
      flipCanvas('horizontal')
      break
    case 'flip-v':
      flipCanvas('vertical')
      break
    case 'rotate-cw':
      rotateCanvas(90)
      break
    case 'rotate-ccw':
      rotateCanvas(-90)
      break
  }
}

function applyAutoToSelection(effect: 'auto-levels' | 'auto-contrast' | 'auto-enhance') {
  const canvas = canvasStore.canvasInstance
  if (!canvas) return

  const activeObj = canvas.getActiveObject()
  if (activeObj && activeObj instanceof fabric.FabricImage) {
    applyAutoEffect(canvas, activeObj, effect)
    ElMessage.success('效果已应用')
    return
  }

  // If no selection, try to find the first image object
  const images = canvas.getObjects().filter(obj => obj instanceof fabric.FabricImage)
  if (images.length > 0) {
    applyAutoEffect(canvas, images[0] as fabric.FabricImage, effect)
    ElMessage.success('效果已应用')
  } else {
    ElMessage.warning('请先导入一张图片')
  }
}

function executeContentAwareFill() {
  const canvas = canvasStore.canvasInstance
  if (!canvas) return
  ContentAwareFill.execute(canvas)
}

function flipCanvas(direction: 'horizontal' | 'vertical') {
  const canvas = canvasStore.canvasInstance
  if (!canvas) return
  const objects = canvas.getObjects()
  objects.forEach(obj => {
    if (direction === 'horizontal') {
      obj.set({ flipX: !obj.flipX })
    } else {
      obj.set({ flipY: !obj.flipY })
    }
  })
  canvas.requestRenderAll()
}

function rotateCanvas(angle: number) {
  const canvas = canvasStore.canvasInstance
  if (!canvas) return
  const objects = canvas.getObjects()
  objects.forEach(obj => {
    obj.rotate((obj.angle || 0) + angle)
  })
  canvas.requestRenderAll()
}
</script>

<style scoped lang="scss">
.menu-trigger {
  padding: 4px 10px; cursor: pointer; font-size: $font-size-sm;
  color: $text-primary; border-radius: 2px;
  &:hover { background: $bg-light; }
}
.menu-item-label { flex: 1; }
.menu-divider { height: 1px; background: $border-color; margin: 4px 0; }
:deep(.el-dropdown-menu__item) {
  display: flex; justify-content: space-between; align-items: center;
  min-width: 200px; padding: 6px 20px; font-size: $font-size-sm;
}
</style>
