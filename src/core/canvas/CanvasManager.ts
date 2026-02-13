import * as fabric from 'fabric'
import eventBus from './CanvasEventBus'
import { ViewportManager } from './ViewportManager'

export class CanvasManager {
  canvas: fabric.Canvas | null = null
  viewportManager: ViewportManager | null = null
  private container: HTMLCanvasElement | null = null

  init(canvasEl: HTMLCanvasElement, width: number, height: number): fabric.Canvas {
    this.container = canvasEl

    this.canvas = new fabric.Canvas(canvasEl, {
      width,
      height,
      backgroundColor: '#ffffff',
      selection: true,
      preserveObjectStacking: true,
      stopContextMenu: true,
      fireRightClick: true,
    })

    this.viewportManager = new ViewportManager(this.canvas)
    this.setupEvents()

    return this.canvas
  }

  private setupEvents() {
    if (!this.canvas) return

    this.canvas.on('object:added', (e) => eventBus.emit('object:added', e))
    this.canvas.on('object:modified', (e) => eventBus.emit('object:modified', e))
    this.canvas.on('object:removed', (e) => eventBus.emit('object:removed', e))
    this.canvas.on('selection:created', (e) => eventBus.emit('selection:created', e))
    this.canvas.on('selection:updated', (e) => eventBus.emit('selection:updated', e))
    this.canvas.on('selection:cleared', (e) => eventBus.emit('selection:cleared', e))

    this.canvas.on('mouse:down', (e) => eventBus.emit('mouse:down', e))
    this.canvas.on('mouse:move', (e) => eventBus.emit('mouse:move', e))
    this.canvas.on('mouse:up', (e) => eventBus.emit('mouse:up', e))

    this.canvas.on('after:render', () => eventBus.emit('canvas:rendered'))
  }

  resize(width: number, height: number) {
    if (!this.canvas) return
    this.canvas.setDimensions({ width, height })
    this.canvas.renderAll()
  }

  getCanvas(): fabric.Canvas {
    if (!this.canvas) throw new Error('Canvas not initialized')
    return this.canvas
  }

  dispose() {
    if (this.canvas) {
      this.canvas.dispose()
      this.canvas = null
    }
    this.viewportManager = null
  }
}

export const canvasManager = new CanvasManager()
