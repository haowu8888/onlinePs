import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { LayerData } from '@/types/layer'
import { v4 as uuidv4 } from 'uuid'

export const useLayerStore = defineStore('layer', () => {
  const layers = ref<LayerData[]>([])
  const activeLayerId = ref<string | null>(null)

  const activeLayer = computed(() =>
    layers.value.find(l => l.id === activeLayerId.value) || null
  )

  const visibleLayers = computed(() =>
    layers.value.filter(l => l.visible)
  )

  function addLayer(name?: string): LayerData {
    const layer: LayerData = {
      id: uuidv4(),
      name: name || `图层 ${layers.value.length + 1}`,
      visible: true,
      locked: false,
      opacity: 1,
      blendMode: 'source-over',
      thumbnail: '',
      groupIndex: layers.value.length,
      hasMask: false,
      maskEnabled: false,
    }
    layers.value.unshift(layer)
    activeLayerId.value = layer.id
    return layer
  }

  function removeLayer(id: string) {
    const idx = layers.value.findIndex(l => l.id === id)
    if (idx === -1) return
    layers.value.splice(idx, 1)
    if (activeLayerId.value === id) {
      activeLayerId.value = layers.value[0]?.id || null
    }
  }

  function setActiveLayer(id: string) {
    activeLayerId.value = id
  }

  function updateLayer(id: string, updates: Partial<LayerData>) {
    const layer = layers.value.find(l => l.id === id)
    if (layer) {
      Object.assign(layer, updates)
    }
  }

  function duplicateLayer(id: string): LayerData | null {
    const source = layers.value.find(l => l.id === id)
    if (!source) return null
    const copy: LayerData = {
      ...source,
      id: uuidv4(),
      name: `${source.name} 副本`,
    }
    const idx = layers.value.findIndex(l => l.id === id)
    layers.value.splice(idx, 0, copy)
    activeLayerId.value = copy.id
    return copy
  }

  function reorderLayers(newOrder: LayerData[]) {
    layers.value = newOrder
  }

  function moveLayer(id: string, direction: 'up' | 'down') {
    const idx = layers.value.findIndex(l => l.id === id)
    if (idx === -1) return
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1
    if (targetIdx < 0 || targetIdx >= layers.value.length) return
    const temp = layers.value[idx]
    layers.value[idx] = layers.value[targetIdx]
    layers.value[targetIdx] = temp
  }

  function clearLayers() {
    layers.value = []
    activeLayerId.value = null
  }

  return {
    layers,
    activeLayerId,
    activeLayer,
    visibleLayers,
    addLayer,
    removeLayer,
    setActiveLayer,
    updateLayer,
    duplicateLayer,
    reorderLayers,
    moveLayer,
    clearLayers,
  }
})
