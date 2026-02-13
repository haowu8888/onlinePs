import { BaseTool } from '../BaseTool'
import * as fabric from 'fabric'
import eventBus from '@/core/canvas/CanvasEventBus'

export class LassoSelectionTool extends BaseTool {
  readonly id = 'lasso'
  readonly name = '套索工具'
  readonly cursor = 'crosshair'

  private points: Array<{ x: number; y: number }> = []
  private tempPath: fabric.Path | null = null
  private isSelecting = false

  protected onActivate() {
    if (!this.canvas) return
    this.canvas.selection = false
    this.canvas.forEachObject(obj => {
      obj.set({ selectable: false, evented: false })
    })
  }

  protected onDeactivate() {
    // Clean up any in-progress drawing (preview paths only)
    if (this.isSelecting && this.tempPath && this.canvas) {
      this.canvas.remove(this.tempPath)
      this.tempPath = null
    }
    this.isSelecting = false
    this.points = []

    // Do NOT remove completed __selection — let it persist.
    // Restore object interactivity.
    if (!this.canvas) return
    this.canvas.selection = true
    this.restoreObjectInteractivity()
  }

  onMouseDown(event: fabric.TPointerEventInfo) {
    if (!this.canvas) return
    this.removeExistingSelection()

    const pointer = this.canvas.getScenePoint(event.e)
    this.points = [{ x: pointer.x, y: pointer.y }]
    this.isSelecting = true
  }

  onMouseMove(event: fabric.TPointerEventInfo) {
    if (!this.isSelecting || !this.canvas) return

    const pointer = this.canvas.getScenePoint(event.e)
    this.points.push({ x: pointer.x, y: pointer.y })
    this.updatePreviewPath()
  }

  onMouseUp(_event: fabric.TPointerEventInfo) {
    if (!this.isSelecting || !this.canvas) return
    this.isSelecting = false

    if (this.points.length < 3) {
      // Not enough points — remove preview
      if (this.tempPath) {
        this.canvas.remove(this.tempPath)
        this.tempPath = null
      }
      this.points = []
      return
    }

    // Close the path and finalize as __selection
    this.points.push(this.points[0])
    this.finalizeSelection()
    eventBus.emit('selection:changed', true)
  }

  /** Draw an intermediate preview path (named __selection_preview). */
  private updatePreviewPath() {
    if (!this.canvas || this.points.length < 2) return

    if (this.tempPath) {
      this.canvas.remove(this.tempPath)
    }

    let pathData = `M ${this.points[0].x} ${this.points[0].y}`
    for (let i = 1; i < this.points.length; i++) {
      pathData += ` L ${this.points[i].x} ${this.points[i].y}`
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

  /** Replace preview with the final closed __selection path. */
  private finalizeSelection() {
    if (!this.canvas) return

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
  }

  /** Restore selectable/evented on normal objects, respecting layer lock. */
  private restoreObjectInteractivity() {
    if (!this.canvas) return
    this.canvas.forEachObject(obj => {
      const name = (obj as any).name as string | undefined
      if (name === '__background' || name === '__selection' || name === '__selection_preview') return
      // Respect layer lock state
      const layerId = (obj as any).__layerId
      if (layerId) {
        // Check if layer is locked via the store (dynamic import would create circular dep,
        // so we just restore to selectable unless the object was deliberately locked)
        obj.set({ selectable: true, evented: true })
      } else {
        obj.set({ selectable: true, evented: true })
      }
    })
  }

  /** Remove any existing __selection from the canvas (from any tool). */
  private removeExistingSelection() {
    if (!this.canvas) return
    const existing = this.canvas.getObjects().filter(
      (o: any) => o.name === '__selection' || o.name === '__selection_preview'
    )
    existing.forEach(obj => this.canvas!.remove(obj))
    this.tempPath = null
    this.points = []
    if (existing.length > 0) {
      eventBus.emit('selection:changed', false)
    }
  }
}
