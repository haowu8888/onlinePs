import { BaseTool } from './BaseTool'
import * as fabric from 'fabric'

export class EraserTool extends BaseTool {
  readonly id = 'eraser'
  readonly name = '橡皮擦'
  readonly cursor = 'crosshair'

  private eraserSize = 20
  private eraserOpacity = 1

  setOptions(options: { size?: number; opacity?: number }) {
    if (options.size !== undefined) this.eraserSize = options.size
    if (options.opacity !== undefined) this.eraserOpacity = options.opacity
    this.updateEraser()
  }

  protected onActivate() {
    if (!this.canvas) return
    this.canvas.isDrawingMode = true
    this.canvas.selection = false
    this.updateEraser()
  }

  protected onDeactivate() {
    if (!this.canvas) return
    this.canvas.isDrawingMode = false
    this.canvas.selection = true
  }

  private updateEraser() {
    if (!this.canvas) return
    const brush = new fabric.PencilBrush(this.canvas)
    brush.width = this.eraserSize
    // Use background-matching color with opacity
    // White for default white canvas backgrounds
    const alpha = this.eraserOpacity
    brush.color = `rgba(255, 255, 255, ${alpha})`
    this.canvas.freeDrawingBrush = brush
  }

  onMouseDown(_event: fabric.TPointerEventInfo) {}
  onMouseMove(_event: fabric.TPointerEventInfo) {}
  onMouseUp(_event: fabric.TPointerEventInfo) {}
}
