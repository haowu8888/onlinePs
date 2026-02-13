import { BaseTool } from './BaseTool'
import * as fabric from 'fabric'

export class GradientTool extends BaseTool {
  readonly id = 'gradient'
  readonly name = '渐变工具'
  readonly cursor = 'crosshair'

  private startX = 0
  private startY = 0
  private isDrawing = false
  private gradientType: 'linear' | 'radial' = 'linear'
  private colorStops = [
    { offset: 0, color: '#000000' },
    { offset: 1, color: '#ffffff' },
  ]

  setOptions(options: {
    type?: 'linear' | 'radial'
    colorStops?: Array<{ offset: number; color: string }>
  }) {
    if (options.type !== undefined) this.gradientType = options.type
    if (options.colorStops !== undefined) this.colorStops = options.colorStops
  }

  protected onActivate() {
    if (!this.canvas) return
    this.canvas.selection = false
  }

  protected onDeactivate() {
    if (!this.canvas) return
    this.canvas.selection = true
  }

  onMouseDown(event: fabric.TPointerEventInfo) {
    if (!this.canvas) return
    const pointer = this.canvas.getScenePoint(event.e)
    this.startX = pointer.x
    this.startY = pointer.y
    this.isDrawing = true
  }

  onMouseMove(_event: fabric.TPointerEventInfo) {}

  onMouseUp(event: fabric.TPointerEventInfo) {
    if (!this.isDrawing || !this.canvas) return
    this.isDrawing = false

    const pointer = this.canvas.getScenePoint(event.e)
    const active = this.canvas.getActiveObject()

    if (active) {
      const gradient = this.createGradient(active, pointer.x, pointer.y)
      active.set('fill', gradient)
      this.canvas.renderAll()
    } else {
      // Create a gradient rect if no object selected
      const width = Math.abs(pointer.x - this.startX) || 200
      const height = Math.abs(pointer.y - this.startY) || 200
      const rect = new fabric.Rect({
        left: Math.min(this.startX, pointer.x),
        top: Math.min(this.startY, pointer.y),
        width,
        height,
      })

      const gradient = this.createGradient(rect, pointer.x, pointer.y)
      rect.set('fill', gradient)
      this.canvas.add(rect)
      this.canvas.setActiveObject(rect)
      this.canvas.renderAll()
    }
  }

  private createGradient(obj: fabric.FabricObject, endX: number, endY: number): fabric.Gradient<'linear' | 'radial'> {
    const objLeft = obj.left || 0
    const objTop = obj.top || 0
    const objWidth = (obj.width || 1) * (obj.scaleX || 1)
    const objHeight = (obj.height || 1) * (obj.scaleY || 1)

    const coords = this.gradientType === 'linear'
      ? {
          x1: (this.startX - objLeft) / objWidth,
          y1: (this.startY - objTop) / objHeight,
          x2: (endX - objLeft) / objWidth,
          y2: (endY - objTop) / objHeight,
        }
      : {
          x1: (this.startX - objLeft) / objWidth,
          y1: (this.startY - objTop) / objHeight,
          x2: (this.startX - objLeft) / objWidth,
          y2: (this.startY - objTop) / objHeight,
          r1: 0,
          r2: Math.sqrt(
            Math.pow(endX - this.startX, 2) + Math.pow(endY - this.startY, 2)
          ) / Math.max(objWidth, objHeight),
        }

    return new fabric.Gradient({
      type: this.gradientType,
      gradientUnits: 'percentage',
      coords: coords as any,
      colorStops: this.colorStops.map(cs => ({
        offset: cs.offset,
        color: cs.color,
      })),
    })
  }
}
