import { BaseTool } from '../BaseTool'
import * as fabric from 'fabric'
import eventBus from '@/core/canvas/CanvasEventBus'

/**
 * 磁性套索工具 — edge-snapping lasso selection.
 * Click to start, move the cursor along edges, the path snaps to
 * high-contrast boundaries. Click to add anchor points, double-click
 * or click near start to close.
 *
 * Uses a Sobel-based edge map for snap guidance.
 */
export class MagneticLassoTool extends BaseTool {
  readonly id = 'magnetic-lasso'
  readonly name = '磁性套索'
  readonly cursor = 'crosshair'

  private points: Array<{ x: number; y: number }> = []
  private tempPath: fabric.Path | null = null
  private isDrawing = false
  private edgeMap: Uint8Array | null = null
  private edgeWidth = 0
  private edgeHeight = 0
  private readonly CLOSE_THRESHOLD = 12
  private readonly SNAP_RADIUS = 8 // px search radius for edge snapping

  protected onActivate() {
    if (!this.canvas) return
    this.canvas.selection = false
    this.canvas.forEachObject(obj => {
      obj.set({ selectable: false, evented: false })
    })
  }

  protected onDeactivate() {
    // Do NOT remove existing selection — let it persist.
    this.cancelDrawing()
    if (!this.canvas) return
    this.canvas.selection = true
    // Restore object interactivity
    this.canvas.forEachObject(obj => {
      const name = (obj as any).name as string | undefined
      if (name === '__background' || name === '__selection' || name === '__selection_preview') return
      obj.set({ selectable: true, evented: true })
    })
  }

  onMouseDown(event: fabric.TPointerEventInfo) {
    if (!this.canvas) return
    const pointer = this.canvas.getScenePoint(event.e)

    if (!this.isDrawing) {
      // Start new path — remove existing selection, build edge map
      this.removeExistingSelection()
      this.buildEdgeMap()
      this.points = [{ x: pointer.x, y: pointer.y }]
      this.isDrawing = true
      return
    }

    // Check close
    if (this.points.length >= 3) {
      const start = this.points[0]
      const vpt = this.canvas.viewportTransform!
      const dx = (pointer.x - start.x) * vpt[0]
      const dy = (pointer.y - start.y) * vpt[3]
      if (Math.sqrt(dx * dx + dy * dy) < this.CLOSE_THRESHOLD) {
        this.closePath()
        return
      }
    }

    // Snap point to nearest edge and add
    const snapped = this.snapToEdge(pointer)
    this.points.push(snapped)
    this.updatePath(snapped)
  }

  onMouseMove(event: fabric.TPointerEventInfo) {
    if (!this.isDrawing || !this.canvas || this.points.length === 0) return
    const pointer = this.canvas.getScenePoint(event.e)
    const snapped = this.snapToEdge(pointer)

    // Auto-add points along the path as the mouse moves (like PS magnetic lasso)
    const last = this.points[this.points.length - 1]
    const vpt = this.canvas.viewportTransform!
    const dx = (snapped.x - last.x) * vpt[0]
    const dy = (snapped.y - last.y) * vpt[3]
    const dist = Math.sqrt(dx * dx + dy * dy)
    if (dist > 15) {
      this.points.push(snapped)
    }

    this.updatePath(snapped)
  }

  onMouseUp(_event: fabric.TPointerEventInfo) {
    // Polygon built on clicks, nothing on mouse up
  }

  onKeyDown?(e: KeyboardEvent): void {
    if (e.key === 'Escape') {
      this.cancelDrawing()
    }
  }

  /**
   * Build a simple Sobel edge magnitude map from the current canvas.
   */
  private buildEdgeMap() {
    if (!this.canvas) return
    const ctx = this.canvas.getContext()
    const w = this.canvas.getWidth()
    const h = this.canvas.getHeight()
    const imgData = ctx.getImageData(0, 0, w, h)
    const data = imgData.data

    this.edgeWidth = w
    this.edgeHeight = h
    this.edgeMap = new Uint8Array(w * h)

    // Convert to grayscale luminance, then Sobel
    const gray = new Uint8Array(w * h)
    for (let i = 0; i < gray.length; i++) {
      const idx = i * 4
      gray[i] = Math.round(0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2])
    }

    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const gx =
          -gray[(y - 1) * w + (x - 1)] + gray[(y - 1) * w + (x + 1)] +
          -2 * gray[y * w + (x - 1)] + 2 * gray[y * w + (x + 1)] +
          -gray[(y + 1) * w + (x - 1)] + gray[(y + 1) * w + (x + 1)]

        const gy =
          -gray[(y - 1) * w + (x - 1)] - 2 * gray[(y - 1) * w + x] - gray[(y - 1) * w + (x + 1)] +
          gray[(y + 1) * w + (x - 1)] + 2 * gray[(y + 1) * w + x] + gray[(y + 1) * w + (x + 1)]

        const mag = Math.min(255, Math.sqrt(gx * gx + gy * gy))
        this.edgeMap[y * w + x] = mag
      }
    }
  }

  /**
   * Snap a scene-coordinate point to the nearest strong edge within SNAP_RADIUS.
   */
  private snapToEdge(pointer: { x: number; y: number }): { x: number; y: number } {
    if (!this.canvas || !this.edgeMap) return pointer

    const vpt = this.canvas.viewportTransform!
    const px = Math.round(pointer.x * vpt[0] + vpt[4])
    const py = Math.round(pointer.y * vpt[3] + vpt[5])
    const r = this.SNAP_RADIUS
    const w = this.edgeWidth
    const h = this.edgeHeight

    let bestX = px
    let bestY = py
    let bestMag = 0

    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        const sx = px + dx
        const sy = py + dy
        if (sx < 0 || sx >= w || sy < 0 || sy >= h) continue
        const mag = this.edgeMap![sy * w + sx]
        if (mag > bestMag) {
          bestMag = mag
          bestX = sx
          bestY = sy
        }
      }
    }

    // If no strong edge found (threshold), return original
    if (bestMag < 30) return pointer

    // Convert screen pixel back to scene coordinates
    return {
      x: (bestX - vpt[4]) / vpt[0],
      y: (bestY - vpt[5]) / vpt[3],
    }
  }

  private closePath() {
    if (!this.canvas || this.points.length < 3) return
    this.isDrawing = false
    this.edgeMap = null

    this.points.push(this.points[0])

    if (this.tempPath) {
      this.canvas.remove(this.tempPath)
    }

    let pathData = `M ${this.points[0].x} ${this.points[0].y}`
    for (let i = 1; i < this.points.length; i++) {
      pathData += ` L ${this.points[i].x} ${this.points[i].y}`
    }
    pathData += ' Z'

    this.tempPath = new fabric.Path(pathData, {
      fill: 'rgba(0,120,212,0.1)',
      stroke: '#0078d4',
      strokeWidth: 1,
      strokeDashArray: [4, 4],
      selectable: false,
      evented: false,
      name: '__selection',
    })

    this.canvas.add(this.tempPath)
    this.canvas.renderAll()
    eventBus.emit('selection:changed', true)
  }

  private updatePath(currentPointer?: { x: number; y: number }) {
    if (!this.canvas || this.points.length < 1) return

    if (this.tempPath) {
      this.canvas.remove(this.tempPath)
    }

    let pathData = `M ${this.points[0].x} ${this.points[0].y}`
    for (let i = 1; i < this.points.length; i++) {
      pathData += ` L ${this.points[i].x} ${this.points[i].y}`
    }
    if (currentPointer && this.isDrawing) {
      pathData += ` L ${currentPointer.x} ${currentPointer.y}`
    }

    this.tempPath = new fabric.Path(pathData, {
      fill: 'rgba(0,120,212,0.05)',
      stroke: '#00cc66',
      strokeWidth: 1.5,
      strokeDashArray: [3, 3],
      selectable: false,
      evented: false,
      name: '__selection_preview',
    })

    this.canvas.add(this.tempPath)
    this.canvas.renderAll()
  }

  private cancelDrawing() {
    if (this.tempPath && this.canvas) {
      if ((this.tempPath as any).name === '__selection_preview') {
        this.canvas.remove(this.tempPath)
        this.tempPath = null
      }
    }
    this.points = []
    this.isDrawing = false
    this.edgeMap = null
  }

  private removeExistingSelection() {
    if (!this.canvas) return
    const existing = this.canvas.getObjects().filter(
      (o: any) => o.name === '__selection' || o.name === '__selection_preview'
    )
    existing.forEach(obj => this.canvas!.remove(obj))
    if (existing.length > 0) {
      this.tempPath = null
      eventBus.emit('selection:changed', false)
    }
  }
}
