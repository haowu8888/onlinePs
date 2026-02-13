import { BaseTool } from './BaseTool'
import * as fabric from 'fabric'
import eventBus from '../canvas/CanvasEventBus'

export class TextTool extends BaseTool {
  readonly id = 'text'
  readonly name = '文字工具'
  readonly cursor = 'text'

  private fontFamily = 'Arial'
  private fontSize = 24
  private fontWeight = 'normal'
  private fontStyle = 'normal'
  private textColor = '#000000'
  private underline = false

  setOptions(options: {
    fontFamily?: string
    fontSize?: number
    fontWeight?: string
    fontStyle?: string
    color?: string
    underline?: boolean
  }) {
    if (options.fontFamily !== undefined) this.fontFamily = options.fontFamily
    if (options.fontSize !== undefined) this.fontSize = options.fontSize
    if (options.fontWeight !== undefined) this.fontWeight = options.fontWeight
    if (options.fontStyle !== undefined) this.fontStyle = options.fontStyle
    if (options.color !== undefined) this.textColor = options.color
    if (options.underline !== undefined) this.underline = options.underline
  }

  protected onActivate() {
    if (!this.canvas) return
    this.canvas.selection = false
    this.canvas.defaultCursor = 'text'
  }

  protected onDeactivate() {
    if (!this.canvas) return
    this.canvas.selection = true
  }

  onMouseDown(event: fabric.TPointerEventInfo) {
    if (!this.canvas) return

    // Don't add text if clicking on an existing text object
    const target = this.canvas.findTarget(event.e)
    if (target && target instanceof fabric.IText) return

    const pointer = this.canvas.getScenePoint(event.e)
    const text = new fabric.IText('输入文字', {
      left: pointer.x,
      top: pointer.y,
      fontFamily: this.fontFamily,
      fontSize: this.fontSize,
      fontWeight: this.fontWeight as any,
      fontStyle: this.fontStyle as any,
      fill: this.textColor,
      underline: this.underline,
      editable: true,
    })

    this.canvas.add(text)
    this.canvas.setActiveObject(text)
    text.enterEditing()
    text.selectAll()
    this.canvas.renderAll()

    // Emit event for history and layer tracking
    eventBus.emit('tool:object-created', {
      object: text,
      name: '添加文字',
      layerName: '文字图层',
    })
  }

  onMouseMove(_event: fabric.TPointerEventInfo) {}
  onMouseUp(_event: fabric.TPointerEventInfo) {}
}
