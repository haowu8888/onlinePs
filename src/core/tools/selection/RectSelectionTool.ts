import { BaseTool } from '../BaseTool'
import * as fabric from 'fabric'

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
    this.removeSelectionRect()
    if (!this.canvas) return
    this.canvas.selection = true
  }

  onMouseDown(event: fabric.TPointerEventInfo) {
    if (!this.canvas) return
    this.removeSelectionRect()

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
    }
  }
}
