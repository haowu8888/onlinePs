import { BaseTool } from './BaseTool'
import * as fabric from 'fabric'

export class CropTool extends BaseTool {
  readonly id = 'crop'
  readonly name = '裁剪工具'
  readonly cursor = 'crosshair'

  private cropRect: fabric.Rect | null = null
  private startX = 0
  private startY = 0
  private isDrawing = false

  protected onActivate() {
    if (!this.canvas) return
    this.canvas.selection = false
    this.canvas.forEachObject(obj => {
      obj.set({ selectable: false, evented: false })
    })
  }

  protected onDeactivate() {
    if (!this.canvas) return
    this.removeCropRect()
    this.canvas.selection = true
    this.canvas.forEachObject(obj => {
      if ((obj as any).name !== '__background') {
        obj.set({ selectable: true, evented: true })
      }
    })
  }

  onMouseDown(event: fabric.TPointerEventInfo) {
    if (!this.canvas) return
    this.removeCropRect()

    const pointer = this.canvas.getScenePoint(event.e)
    this.startX = pointer.x
    this.startY = pointer.y
    this.isDrawing = true

    this.cropRect = new fabric.Rect({
      left: this.startX,
      top: this.startY,
      width: 0,
      height: 0,
      fill: 'rgba(0,120,212,0.15)',
      stroke: '#0078d4',
      strokeWidth: 1,
      strokeDashArray: [5, 5],
      selectable: true,
      evented: true,
      name: '__crop_rect',
    })
    this.canvas.add(this.cropRect)
  }

  onMouseMove(event: fabric.TPointerEventInfo) {
    if (!this.isDrawing || !this.cropRect || !this.canvas) return

    const pointer = this.canvas.getScenePoint(event.e)
    const width = pointer.x - this.startX
    const height = pointer.y - this.startY

    this.cropRect.set({
      left: width > 0 ? this.startX : pointer.x,
      top: height > 0 ? this.startY : pointer.y,
      width: Math.abs(width),
      height: Math.abs(height),
    })
    this.canvas.renderAll()
  }

  onMouseUp(_event: fabric.TPointerEventInfo) {
    this.isDrawing = false
    if (this.cropRect) {
      this.cropRect.set({ selectable: true, evented: true })
    }
  }

  applyCrop() {
    if (!this.canvas || !this.cropRect) return

    const left = this.cropRect.left!
    const top = this.cropRect.top!
    const width = this.cropRect.width! * (this.cropRect.scaleX || 1)
    const height = this.cropRect.height! * (this.cropRect.scaleY || 1)

    // Remove crop rect
    this.canvas.remove(this.cropRect)
    this.cropRect = null

    // Crop: export visible area and re-import
    const dataUrl = this.canvas.toDataURL({
      left,
      top,
      width,
      height,
      format: 'png',
      multiplier: 1,
    })

    return { dataUrl, left, top, width, height }
  }

  private removeCropRect() {
    if (this.cropRect && this.canvas) {
      this.canvas.remove(this.cropRect)
      this.cropRect = null
    }
  }
}
