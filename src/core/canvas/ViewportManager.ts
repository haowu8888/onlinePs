import * as fabric from 'fabric'
import eventBus from './CanvasEventBus'

export class ViewportManager {
  private canvas: fabric.Canvas
  private _zoom = 1
  private _panX = 0
  private _panY = 0
  private isPanning = false
  private lastPosX = 0
  private lastPosY = 0
  private minZoom = 0.05
  private maxZoom = 50

  constructor(canvas: fabric.Canvas) {
    this.canvas = canvas
    this.setupZoom()
    this.setupPan()
  }

  get zoom() { return this._zoom }
  get panX() { return this._panX }
  get panY() { return this._panY }

  private setupZoom() {
    this.canvas.on('mouse:wheel', (opt) => {
      const e = opt.e as WheelEvent
      e.preventDefault()
      e.stopPropagation()

      const delta = e.deltaY
      let zoom = this._zoom * (1 - delta / 300)
      zoom = Math.min(Math.max(zoom, this.minZoom), this.maxZoom)

      const point = new fabric.Point(e.offsetX, e.offsetY)
      this.canvas.zoomToPoint(point, zoom)
      this._zoom = zoom
      this.updatePanFromVpt()
      eventBus.emit('zoom:changed', zoom)
    })
  }

  private setupPan() {
    this.canvas.on('mouse:down', (opt) => {
      const e = opt.e as MouseEvent
      // Middle mouse button or space+click for panning
      if (e.button === 1 || (e.altKey && e.button === 0)) {
        this.isPanning = true
        this.lastPosX = e.clientX
        this.lastPosY = e.clientY
        this.canvas.selection = false
        this.canvas.setCursor('grabbing')
      }
    })

    this.canvas.on('mouse:move', (opt) => {
      if (!this.isPanning) return
      const e = opt.e as MouseEvent
      const vpt = this.canvas.viewportTransform!
      vpt[4] += e.clientX - this.lastPosX
      vpt[5] += e.clientY - this.lastPosY
      this.lastPosX = e.clientX
      this.lastPosY = e.clientY
      this.updatePanFromVpt()
      this.canvas.requestRenderAll()
      eventBus.emit('pan:changed', { x: this._panX, y: this._panY })
    })

    this.canvas.on('mouse:up', () => {
      if (this.isPanning) {
        this.isPanning = false
        this.canvas.selection = true
        this.canvas.setCursor('default')
      }
    })
  }

  private updatePanFromVpt() {
    const vpt = this.canvas.viewportTransform!
    this._panX = vpt[4]
    this._panY = vpt[5]
  }

  setZoom(zoom: number) {
    zoom = Math.min(Math.max(zoom, this.minZoom), this.maxZoom)
    const center = this.canvas.getCenterPoint()
    this.canvas.zoomToPoint(center, zoom)
    this._zoom = zoom
    this.updatePanFromVpt()
    eventBus.emit('zoom:changed', zoom)
  }

  zoomIn() { this.setZoom(this._zoom * 1.2) }
  zoomOut() { this.setZoom(this._zoom / 1.2) }

  zoomToFit() {
    const canvasWidth = this.canvas.getWidth()
    const canvasHeight = this.canvas.getHeight()
    // Find the background rect to determine document size
    const bgRect = this.canvas.getObjects().find((o: any) => o.name === '__background')
    let docWidth = canvasWidth
    let docHeight = canvasHeight

    if (bgRect) {
      docWidth = (bgRect.width || canvasWidth) * (bgRect.scaleX || 1)
      docHeight = (bgRect.height || canvasHeight) * (bgRect.scaleY || 1)
    }

    const zoomX = canvasWidth / docWidth
    const zoomY = canvasHeight / docHeight
    const zoom = Math.min(zoomX, zoomY, 1) * 0.9

    // Reset viewport before zooming to avoid compound transformations
    this.canvas.setViewportTransform([1, 0, 0, 1, 0, 0])
    const center = this.canvas.getCenterPoint()
    this.canvas.zoomToPoint(center, zoom)
    this._zoom = zoom
    this.updatePanFromVpt()
    eventBus.emit('zoom:changed', zoom)
  }

  resetView() {
    this.canvas.setViewportTransform([1, 0, 0, 1, 0, 0])
    this._zoom = 1
    this._panX = 0
    this._panY = 0
    eventBus.emit('zoom:changed', 1)
    eventBus.emit('pan:changed', { x: 0, y: 0 })
  }
}
