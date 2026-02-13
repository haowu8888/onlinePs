import { BaseTool } from './BaseTool'
import * as fabric from 'fabric'
import eventBus from '../canvas/CanvasEventBus'

export class ShapeTool extends BaseTool {
  readonly id = 'shape'
  readonly name = '形状工具'
  readonly cursor = 'crosshair'

  private shapeType: 'rect' | 'ellipse' | 'line' | 'polygon' | 'triangle' = 'rect'
  private fill = '#000000'
  private stroke = '#000000'
  private strokeWidth = 2
  private fillEnabled = true
  private startX = 0
  private startY = 0
  private isDrawing = false
  private currentShape: fabric.FabricObject | null = null

  setOptions(options: {
    shapeType?: 'rect' | 'ellipse' | 'line' | 'polygon' | 'triangle'
    fill?: string
    stroke?: string
    strokeWidth?: number
    fillEnabled?: boolean
  }) {
    if (options.shapeType !== undefined) this.shapeType = options.shapeType
    if (options.fill !== undefined) this.fill = options.fill
    if (options.stroke !== undefined) this.stroke = options.stroke
    if (options.strokeWidth !== undefined) this.strokeWidth = options.strokeWidth
    if (options.fillEnabled !== undefined) this.fillEnabled = options.fillEnabled
  }

  protected onActivate() {
    if (!this.canvas) return
    this.canvas.selection = false
    this.canvas.forEachObject(obj => {
      obj.set({ selectable: false, evented: false })
    })
  }

  protected onDeactivate() {
    if (!this.canvas) return
    this.canvas.selection = true
    this.canvas.forEachObject(obj => {
      if ((obj as any).name !== '__background') {
        obj.set({ selectable: true, evented: true })
      }
    })
    this.isDrawing = false
    this.currentShape = null
  }

  onMouseDown(event: fabric.TPointerEventInfo) {
    if (!this.canvas) return
    const pointer = this.canvas.getScenePoint(event.e)
    this.startX = pointer.x
    this.startY = pointer.y
    this.isDrawing = true

    const fillColor = this.fillEnabled ? this.fill : 'transparent'

    switch (this.shapeType) {
      case 'rect':
        this.currentShape = new fabric.Rect({
          left: this.startX,
          top: this.startY,
          width: 0,
          height: 0,
          fill: fillColor,
          stroke: this.stroke,
          strokeWidth: this.strokeWidth,
          selectable: false,
          evented: false,
        })
        break
      case 'ellipse':
        this.currentShape = new fabric.Ellipse({
          left: this.startX,
          top: this.startY,
          rx: 0,
          ry: 0,
          fill: fillColor,
          stroke: this.stroke,
          strokeWidth: this.strokeWidth,
          selectable: false,
          evented: false,
        })
        break
      case 'line':
        this.currentShape = new fabric.Line(
          [this.startX, this.startY, this.startX, this.startY],
          {
            stroke: this.stroke,
            strokeWidth: this.strokeWidth,
            selectable: false,
            evented: false,
          }
        )
        break
      case 'triangle':
        this.currentShape = new fabric.Triangle({
          left: this.startX,
          top: this.startY,
          width: 0,
          height: 0,
          fill: fillColor,
          stroke: this.stroke,
          strokeWidth: this.strokeWidth,
          selectable: false,
          evented: false,
        })
        break
    }

    if (this.currentShape) {
      this.canvas.add(this.currentShape)
    }
  }

  onMouseMove(event: fabric.TPointerEventInfo) {
    if (!this.isDrawing || !this.currentShape || !this.canvas) return

    const pointer = this.canvas.getScenePoint(event.e)
    const width = pointer.x - this.startX
    const height = pointer.y - this.startY

    switch (this.shapeType) {
      case 'rect':
      case 'triangle':
        this.currentShape.set({
          left: width > 0 ? this.startX : pointer.x,
          top: height > 0 ? this.startY : pointer.y,
          width: Math.abs(width),
          height: Math.abs(height),
        })
        break
      case 'ellipse':
        (this.currentShape as fabric.Ellipse).set({
          left: width > 0 ? this.startX : pointer.x,
          top: height > 0 ? this.startY : pointer.y,
          rx: Math.abs(width) / 2,
          ry: Math.abs(height) / 2,
        })
        break
      case 'line':
        (this.currentShape as fabric.Line).set({
          x2: pointer.x,
          y2: pointer.y,
        })
        break
    }

    this.canvas.renderAll()
  }

  onMouseUp(_event: fabric.TPointerEventInfo) {
    if (!this.isDrawing || !this.currentShape || !this.canvas) return
    this.isDrawing = false

    // Make shape selectable after drawing
    this.currentShape.set({
      selectable: true,
      evented: true,
    })
    this.canvas.setActiveObject(this.currentShape)
    this.canvas.renderAll()

    // Emit event for history and layer tracking
    const shapeNames: Record<string, string> = {
      rect: '矩形', ellipse: '椭圆', line: '线条', triangle: '三角形', polygon: '多边形'
    }
    eventBus.emit('tool:object-created', {
      object: this.currentShape,
      name: `绘制${shapeNames[this.shapeType] || '形状'}`,
      layerName: `${shapeNames[this.shapeType] || '形状'} 图层`,
    })

    this.currentShape = null
  }
}
