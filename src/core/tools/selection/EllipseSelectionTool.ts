import { BaseTool } from '../BaseTool'
import * as fabric from 'fabric'

export class EllipseSelectionTool extends BaseTool {
  readonly id = 'ellipse-selection'
  readonly name = '椭圆选区'
  readonly cursor = 'crosshair'

  private selectionEllipse: fabric.Ellipse | null = null
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
    this.removeSelection()
    if (!this.canvas) return
    this.canvas.selection = true
  }

  onMouseDown(event: fabric.TPointerEventInfo) {
    if (!this.canvas) return
    this.removeSelection()

    const pointer = this.canvas.getScenePoint(event.e)
    this.startX = pointer.x
    this.startY = pointer.y
    this.isSelecting = true

    this.selectionEllipse = new fabric.Ellipse({
      left: this.startX,
      top: this.startY,
      rx: 0,
      ry: 0,
      fill: 'rgba(0,120,212,0.1)',
      stroke: '#0078d4',
      strokeWidth: 1,
      strokeDashArray: [4, 4],
      selectable: false,
      evented: false,
      name: '__selection',
    })
    this.canvas.add(this.selectionEllipse)
  }

  onMouseMove(event: fabric.TPointerEventInfo) {
    if (!this.isSelecting || !this.selectionEllipse || !this.canvas) return

    const pointer = this.canvas.getScenePoint(event.e)
    const width = pointer.x - this.startX
    const height = pointer.y - this.startY

    this.selectionEllipse.set({
      left: width > 0 ? this.startX : pointer.x,
      top: height > 0 ? this.startY : pointer.y,
      rx: Math.abs(width) / 2,
      ry: Math.abs(height) / 2,
    })
    this.canvas.renderAll()
  }

  onMouseUp(_event: fabric.TPointerEventInfo) {
    this.isSelecting = false
  }

  private removeSelection() {
    if (this.selectionEllipse && this.canvas) {
      this.canvas.remove(this.selectionEllipse)
      this.selectionEllipse = null
    }
  }
}
