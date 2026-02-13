import { BaseTool } from '../BaseTool'
import * as fabric from 'fabric'
import eventBus from '@/core/canvas/CanvasEventBus'

export class RectSelectionTool extends BaseTool {
  readonly id = 'rect-selection'
  readonly name = '矩形选区'
  readonly cursor = 'crosshair'

  private selectionRect: fabric.Rect | null = null
  private startX = 0
  private startY = 0
  private isSelecting = false

  protected onActivate() {
    if (!this.canvas) return
    this.canvas.selection = false
    this.canvas.forEachObject(obj => {
      obj.set({ selectable: false, evented: false })
    })
  }

  protected onDeactivate() {
    // Do NOT remove selection — let it persist across tool switches.
    this.isSelecting = false
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
    this.removeExistingSelection()

    const pointer = this.canvas.getScenePoint(event.e)
    this.startX = pointer.x
    this.startY = pointer.y
    this.isSelecting = true

    this.selectionRect = new fabric.Rect({
      left: this.startX,
      top: this.startY,
      width: 0,
      height: 0,
      fill: 'rgba(0,120,212,0.1)',
      stroke: '#0078d4',
      strokeWidth: 1,
      strokeDashArray: [4, 4],
      selectable: false,
      evented: false,
      name: '__selection',
    })
    this.canvas.add(this.selectionRect)
  }

  onMouseMove(event: fabric.TPointerEventInfo) {
    if (!this.isSelecting || !this.selectionRect || !this.canvas) return

    const pointer = this.canvas.getScenePoint(event.e)
    const width = pointer.x - this.startX
    const height = pointer.y - this.startY

    this.selectionRect.set({
      left: width > 0 ? this.startX : pointer.x,
      top: height > 0 ? this.startY : pointer.y,
      width: Math.abs(width),
      height: Math.abs(height),
    })
    this.canvas.renderAll()
  }

  onMouseUp(_event: fabric.TPointerEventInfo) {
    this.isSelecting = false
    eventBus.emit('selection:changed', true)
  }

  getSelectionBounds() {
    if (!this.selectionRect) return null
    return {
      left: this.selectionRect.left!,
      top: this.selectionRect.top!,
      width: this.selectionRect.width! * (this.selectionRect.scaleX || 1),
      height: this.selectionRect.height! * (this.selectionRect.scaleY || 1),
    }
  }

  private removeSelectionRect() {
    if (this.selectionRect && this.canvas) {
      this.canvas.remove(this.selectionRect)
      this.selectionRect = null
      eventBus.emit('selection:changed', false)
    }
  }

  /** Remove any existing __selection from the canvas (from any tool). */
  private removeExistingSelection() {
    if (!this.canvas) return
    const existing = this.canvas.getObjects().filter(
      (o: any) => o.name === '__selection' || o.name === '__selection_preview'
    )
    existing.forEach(obj => this.canvas!.remove(obj))
    this.selectionRect = null
    if (existing.length > 0) {
      eventBus.emit('selection:changed', false)
    }
  }
}
