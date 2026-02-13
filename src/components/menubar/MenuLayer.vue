<template>
  <el-dropdown trigger="click" @command="handleCommand" :teleported="true">
    <span class="menu-trigger">图层</span>
    <template #dropdown>
      <el-dropdown-menu>
        <template v-for="item in LAYER_MENU" :key="item.label">
          <el-dropdown-item v-if="!item.divider" :command="item.action">
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
import { LAYER_MENU } from '@/constants/menu'
import { useLayerStore } from '@/stores/useLayerStore'
import { useCanvasStore } from '@/stores/useCanvasStore'
import { ElMessage } from 'element-plus'

const layerStore = useLayerStore()
const canvasStore = useCanvasStore()

function handleCommand(action: string) {
  switch (action) {
    case 'new-layer':
      layerStore.addLayer()
      break
    case 'duplicate-layer':
      if (layerStore.activeLayerId) {
        layerStore.duplicateLayer(layerStore.activeLayerId)
      }
      break
    case 'delete-layer':
      if (layerStore.activeLayerId) {
        removeLayerWithObjects(layerStore.activeLayerId)
      }
      break
    case 'merge-down':
      mergeDown()
      break
    case 'merge-visible':
      mergeVisible()
      break
    case 'flatten':
      flattenImage()
      break
  }
}

function removeLayerWithObjects(id: string) {
  const canvas = canvasStore.canvasInstance
  if (!canvas) return
  const objs = canvas.getObjects().filter((o: any) => o.__layerId === id)
  objs.forEach(obj => canvas.remove(obj))
  canvas.renderAll()
  layerStore.removeLayer(id)
}

function mergeDown() {
  const canvas = canvasStore.canvasInstance
  if (!canvas || !layerStore.activeLayerId) return
  const layers = layerStore.layers
  const idx = layers.findIndex(l => l.id === layerStore.activeLayerId)
  // In the layer list, "down" means the next item (lower in stack)
  if (idx < 0 || idx >= layers.length - 1) {
    ElMessage.warning('没有下方图层可合并')
    return
  }
  const targetLayer = layers[idx + 1]
  // Move all objects from active layer to the target layer
  const objs = canvas.getObjects().filter((o: any) => o.__layerId === layerStore.activeLayerId)
  objs.forEach((obj: any) => {
    obj.__layerId = targetLayer.id
  })
  // Remove the active layer data
  layerStore.removeLayer(layerStore.activeLayerId!)
  layerStore.setActiveLayer(targetLayer.id)
  canvas.renderAll()
  ElMessage.success('图层已合并')
}

function mergeVisible() {
  const canvas = canvasStore.canvasInstance
  if (!canvas) return
  const visibleLayers = layerStore.layers.filter(l => l.visible)
  if (visibleLayers.length < 2) {
    ElMessage.warning('至少需要两个可见图层')
    return
  }
  // Merge all visible layers into the bottom-most visible layer
  const targetLayer = visibleLayers[visibleLayers.length - 1]
  for (const layer of visibleLayers) {
    if (layer.id === targetLayer.id) continue
    const objs = canvas.getObjects().filter((o: any) => o.__layerId === layer.id)
    objs.forEach((obj: any) => {
      obj.__layerId = targetLayer.id
    })
    layerStore.removeLayer(layer.id)
  }
  layerStore.setActiveLayer(targetLayer.id)
  canvas.renderAll()
  ElMessage.success('可见图层已合并')
}

function flattenImage() {
  const canvas = canvasStore.canvasInstance
  if (!canvas) return
  if (layerStore.layers.length < 2) return
  // Merge all layers into the bottom layer
  const targetLayer = layerStore.layers[layerStore.layers.length - 1]
  const layersToRemove = layerStore.layers.filter(l => l.id !== targetLayer.id)
  for (const layer of layersToRemove) {
    const objs = canvas.getObjects().filter((o: any) => o.__layerId === layer.id)
    objs.forEach((obj: any) => {
      obj.__layerId = targetLayer.id
    })
  }
  // Remove all layers except the target
  for (const layer of layersToRemove) {
    layerStore.removeLayer(layer.id)
  }
  layerStore.setActiveLayer(targetLayer.id)
  layerStore.updateLayer(targetLayer.id, { name: '背景' })
  canvas.renderAll()
  ElMessage.success('图层已拼合')
}
</script>

