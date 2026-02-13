import { BaseTool } from './BaseTool'
import * as fabric from 'fabric'
import tinycolor from 'tinycolor2'

export class EraserTool extends BaseTool {
  readonly id = 'eraser'
  readonly name = '橡皮擦'
  readonly cursor = 'crosshair'

  private eraserSize = 20
  private eraserOpacity = 1
  private backgroundColor = '#ffffff'

  setOptions(options: { size?: number; opacity?: number; backgroundColor?: string }) {
    if (options.size !== undefined) this.eraserSize = options.size
    if (options.opacity !== undefined) this.eraserOpacity = options.opacity
    if (options.backgroundColor !== undefined) this.backgroundColor = options.backgroundColor
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
    const alpha = this.eraserOpacity
    const color = tinycolor(this.backgroundColor).setAlpha(alpha)
    brush.color = color.toRgbString()
    this.canvas.freeDrawingBrush = brush
  }

  onMouseDown(_event: fabric.TPointerEventInfo) {}
  onMouseMove(_event: fabric.TPointerEventInfo) {}
  onMouseUp(_event: fabric.TPointerEventInfo) {}
}
