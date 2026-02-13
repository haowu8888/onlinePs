import * as fabric from 'fabric'
import { Layer } from './Layer'
import eventBus from '../canvas/CanvasEventBus'

export class LayerManager {
  private canvas: fabric.Canvas
  private layers: Layer[] = []
  private activeLayerId: string | null = null

  constructor(canvas: fabric.Canvas) {
    this.canvas = canvas
  }

  addLayer(name?: string): Layer {
    const layer = new Layer(name || `图层 ${this.layers.length + 1}`, this.canvas)
    this.layers.unshift(layer)
    this.activeLayerId = layer.id
    eventBus.emit('layer:changed', layer.id)
    return layer
  }

  removeLayer(id: string) {
    const idx = this.layers.findIndex(l => l.id === id)
    if (idx === -1) return
    this.layers.splice(idx, 1)
    if (this.activeLayerId === id) {
      this.activeLayerId = this.layers[0]?.id || null
    }
    eventBus.emit('layer:changed', this.activeLayerId || '')
  }

  getLayer(id: string): Layer | undefined {
    return this.layers.find(l => l.id === id)
  }

  getActiveLayer(): Layer | undefined {
    return this.layers.find(l => l.id === this.activeLayerId)
  }

  setActiveLayer(id: string) {
    this.activeLayerId = id
    eventBus.emit('layer:changed', id)
  }

  getLayers(): Layer[] {
    return this.layers
  }

  reorderLayers(ids: string[]) {
    const reordered: Layer[] = []
    for (const id of ids) {
      const layer = this.layers.find(l => l.id === id)
      if (layer) reordered.push(layer)
    }
    this.layers = reordered
  }

  duplicateLayer(id: string): Layer | null {
    const source = this.layers.find(l => l.id === id)
    if (!source) return null
    const copy = new Layer(`${source.name} 副本`, this.canvas)
    copy.visible = source.visible
    copy.opacity = source.opacity
    copy.blendMode = source.blendMode

    const idx = this.layers.findIndex(l => l.id === id)
    this.layers.splice(idx, 0, copy)
    this.activeLayerId = copy.id
    eventBus.emit('layer:changed', copy.id)
    return copy
  }

  clear() {
    this.layers = []
    this.activeLayerId = null
  }
}
