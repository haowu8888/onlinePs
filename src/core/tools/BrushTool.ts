import { BaseTool } from './BaseTool'
import * as fabric from 'fabric'
import tinycolor from 'tinycolor2'

export class BrushTool extends BaseTool {
  readonly id = 'brush'
  readonly name = '画笔工具'
  readonly cursor = 'crosshair'

  private brushSize = 10
  private brushColor = '#000000'
  private brushOpacity = 1

  setOptions(options: { size?: number; color?: string; opacity?: number }) {
    if (options.size !== undefined) this.brushSize = options.size
    if (options.color !== undefined) this.brushColor = options.color
    if (options.opacity !== undefined) this.brushOpacity = options.opacity
    this.updateBrush()
  }

  protected onActivate() {
    if (!this.canvas) return
    this.canvas.isDrawingMode = true
    this.canvas.selection = false
    this.updateBrush()
  }

  protected onDeactivate() {
    if (!this.canvas) return
    this.canvas.isDrawingMode = false
    this.canvas.selection = true
  }

  private updateBrush() {
    if (!this.canvas) return
    const brush = new fabric.PencilBrush(this.canvas)
    brush.width = this.brushSize
    // Apply opacity through RGBA color since PencilBrush doesn't have an opacity property
    const color = tinycolor(this.brushColor).setAlpha(this.brushOpacity)
    brush.color = color.toRgbString()
    this.canvas.freeDrawingBrush = brush
  }

  onMouseDown(_event: fabric.TPointerEventInfo) {}
  onMouseMove(_event: fabric.TPointerEventInfo) {}
  onMouseUp(_event: fabric.TPointerEventInfo) {}
}
