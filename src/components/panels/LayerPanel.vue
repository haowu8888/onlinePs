<template>
  <div class="layer-panel">
    <div class="layer-panel__header">
      <el-select v-model="blendMode" size="small" class="blend-select" placeholder="混合模式">
        <el-option
          v-for="mode in BLEND_MODES"
          :key="mode.value"
          :label="mode.label"
          :value="mode.value"
        />
      </el-select>
      <div class="opacity-control">
        <label>不透明度</label>
        <el-slider v-model="opacity" :min="0" :max="100" :step="1" size="small" />
      </div>
    </div>

    <div class="layer-panel__list">
      <LayerItem
        v-for="layer in layerStore.layers"
        :key="layer.id"
        :layer="layer"
        :active="layer.id === layerStore.activeLayerId"
        @select="layerStore.setActiveLayer(layer.id)"
        @toggle-visibility="toggleVisibility(layer.id)"
        @toggle-lock="toggleLock(layer.id)"
      />
      <div v-if="layerStore.layers.length === 0" class="layer-panel__empty">
        暂无图层
      </div>
    </div>

    <div class="layer-panel__footer">
      <button class="icon-btn" title="新建图层" @click="layerStore.addLayer()">
        <el-icon><Plus /></el-icon>
      </button>
      <button class="icon-btn" title="复制图层" @click="duplicateActive" :disabled="!layerStore.activeLayerId">
        <el-icon><CopyDocument /></el-icon>
      </button>
      <button class="icon-btn" title="删除图层" @click="removeActive" :disabled="!layerStore.activeLayerId">
        <el-icon><Delete /></el-icon>
      </button>
      <button class="icon-btn" title="上移" @click="moveActive('up')" :disabled="!layerStore.activeLayerId">
        <el-icon><ArrowUp /></el-icon>
      </button>
      <button class="icon-btn" title="下移" @click="moveActive('down')" :disabled="!layerStore.activeLayerId">
        <el-icon><ArrowDown /></el-icon>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useLayerStore } from '@/stores/useLayerStore'
import { useCanvasStore } from '@/stores/useCanvasStore'
import { BLEND_MODES } from '@/constants/blendModes'
import { Plus, CopyDocument, Delete, ArrowUp, ArrowDown } from '@element-plus/icons-vue'
import LayerItem from './LayerItem.vue'

const layerStore = useLayerStore()
const canvasStore = useCanvasStore()
const blendMode = ref('source-over')
const opacity = ref(100)

/** Get all canvas objects belonging to a layer. */
function getLayerObjects(layerId: string) {
  const canvas = canvasStore.canvasInstance
  if (!canvas) return []
  return canvas.getObjects().filter((o: any) => o.__layerId === layerId)
}

watch(() => layerStore.activeLayer, (layer) => {
  if (layer) {
    blendMode.value = layer.blendMode
    opacity.value = Math.round(layer.opacity * 100)
  } else {
    blendMode.value = 'source-over'
    opacity.value = 100
  }
})

watch(blendMode, (val) => {
  if (!layerStore.activeLayerId) return
  layerStore.updateLayer(layerStore.activeLayerId, { blendMode: val })
  // Apply blend mode to canvas objects
  const objs = getLayerObjects(layerStore.activeLayerId)
  for (const obj of objs) {
    ;(obj as any).globalCompositeOperation = val
  }
  canvasStore.canvasInstance?.renderAll()
})

watch(opacity, (val) => {
  if (!layerStore.activeLayerId) return
  layerStore.updateLayer(layerStore.activeLayerId, { opacity: val / 100 })
  // Apply opacity to canvas objects
  const objs = getLayerObjects(layerStore.activeLayerId)
  for (const obj of objs) {
    obj.set({ opacity: val / 100 })
  }
  canvasStore.canvasInstance?.renderAll()
})

function toggleVisibility(id: string) {
  const layer = layerStore.layers.find(l => l.id === id)
  if (!layer) return
  const newVisible = !layer.visible
  layerStore.updateLayer(id, { visible: newVisible })
  // Show/hide all canvas objects in this layer
  const objs = getLayerObjects(id)
  for (const obj of objs) {
    obj.set({ visible: newVisible })
  }
  canvasStore.canvasInstance?.renderAll()
}

function toggleLock(id: string) {
  const layer = layerStore.layers.find(l => l.id === id)
  if (!layer) return
  const newLocked = !layer.locked
  layerStore.updateLayer(id, { locked: newLocked })
  // Lock/unlock all canvas objects in this layer
  const objs = getLayerObjects(id)
  for (const obj of objs) {
    // Background and selection objects are always non-interactive
    if ((obj as any).name === '__background') continue
    obj.set({ selectable: !newLocked, evented: !newLocked })
  }
  canvasStore.canvasInstance?.renderAll()
}

function duplicateActive() {
  if (layerStore.activeLayerId) layerStore.duplicateLayer(layerStore.activeLayerId)
}

function removeActive() {
  const canvas = canvasStore.canvasInstance
  const id = layerStore.activeLayerId
  if (!canvas || !id) return

  // Remove all canvas objects belonging to this layer
  const objs = getLayerObjects(id)
  objs.forEach(obj => canvas.remove(obj))
  canvas.renderAll()

  // Remove layer data
  layerStore.removeLayer(id)
}

function moveActive(dir: 'up' | 'down') {
  if (layerStore.activeLayerId) layerStore.moveLayer(layerStore.activeLayerId, dir)
}
</script>

<style scoped lang="scss">
.layer-panel {
  display: flex;
  flex-direction: column;
  height: 100%;

  &__header {
    padding: 10px;
    border-bottom: 1px solid $border-color;

    .blend-select {
      width: 100%;
      margin-bottom: 8px;
    }

    .opacity-control {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: $font-size-xs;
      color: $text-primary;

      label {
        white-space: nowrap;
      }

      .el-slider {
        flex: 1;
      }
    }
  }

  &__list {
    flex: 1;
    overflow-y: auto;
  }

  &__empty {
    padding: 24px;
    text-align: center;
    color: $text-secondary;
    font-size: $font-size-sm;
  }

  &__footer {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 8px;
    border-top: 1px solid $border-color;
    background: $bg-dark;
  }
}
</style>
