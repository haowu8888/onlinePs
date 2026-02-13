import { BaseTool } from '../BaseTool'
import * as fabric from 'fabric'
import eventBus from '@/core/canvas/CanvasEventBus'

/**
 * 多边形套索工具 — click-to-add-point polygon selection.
 * Single click adds a vertex; double-click (or clicking near the start point)
 * closes the polygon and creates the selection.
 */
export class PolygonalLassoTool extends BaseTool {
  readonly id = 'polygonal-lasso'
  readonly name = '多边形套索'
  readonly cursor = 'crosshair'

  private points: Array<{ x: number; y: number }> = []
  private tempPath: fabric.Path | null = null
  private isDrawing = false
  private readonly CLOSE_THRESHOLD = 10 // px distance to auto-close

  protected onActivate() {
    if (!this.canvas) return
    this.canvas.selection = false
    this.canvas.forEachObject(obj => {
      obj.set({ selectable: false, evented: false })
    })
  }

  protected onDeactivate() {
    // Do NOT remove existing selection — let it persist across tool switches.
    // Only clean up in-progress drawing state.
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
      // Start new polygon — remove any existing selection first
      this.removeExistingSelection()
      this.points = [{ x: pointer.x, y: pointer.y }]
      this.isDrawing = true
      return
    }

    // Check if clicking near the start point to close the polygon
    if (this.points.length >= 3) {
      const start = this.points[0]
      const vpt = this.canvas.viewportTransform!
      const dx = (pointer.x - start.x) * vpt[0]
      const dy = (pointer.y - start.y) * vpt[3]
      if (Math.sqrt(dx * dx + dy * dy) < this.CLOSE_THRESHOLD) {
        this.closePolygon()
        return
      }
    }

    // Add new vertex
    this.points.push({ x: pointer.x, y: pointer.y })
    this.updatePath(pointer)
  }

  onMouseMove(event: fabric.TPointerEventInfo) {
    if (!this.isDrawing || !this.canvas || this.points.length === 0) return
    const pointer = this.canvas.getScenePoint(event.e)
    this.updatePath(pointer)
  }

  onMouseUp(_event: fabric.TPointerEventInfo) {
    // Nothing on mouse up — polygon is built on clicks
  }

  onKeyDown?(e: KeyboardEvent): void {
    // Escape cancels the current polygon drawing
    if (e.key === 'Escape') {
      this.cancelDrawing()
    }
  }

  /** Double-click handler — close polygon. Called via onMouseDown detecting rapid clicks. */
  private closePolygon() {
    if (!this.canvas || this.points.length < 3) return
    this.isDrawing = false

    // Close the path
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
    // Draw line to current mouse position while drawing
    if (currentPointer && this.isDrawing) {
      pathData += ` L ${currentPointer.x} ${currentPointer.y}`
    }

    this.tempPath = new fabric.Path(pathData, {
      fill: 'rgba(0,120,212,0.05)',
      stroke: '#0078d4',
      strokeWidth: 1,
      strokeDashArray: [4, 4],
      selectable: false,
      evented: false,
      name: '__selection_preview',
    })

    this.canvas.add(this.tempPath)
    this.canvas.renderAll()
  }

  private cancelDrawing() {
    if (this.tempPath && this.canvas) {
      // Only remove if it's a preview, not a final selection
      if ((this.tempPath as any).name === '__selection_preview') {
        this.canvas.remove(this.tempPath)
        this.tempPath = null
      }
    }
    this.points = []
    this.isDrawing = false
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
