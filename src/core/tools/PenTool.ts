import { BaseTool } from './BaseTool'
import * as fabric from 'fabric'
import eventBus from '../canvas/CanvasEventBus'

export class PenTool extends BaseTool {
  readonly id = 'pen'
  readonly name = '钢笔工具'
  readonly cursor = 'crosshair'

  private points: fabric.Point[] = []
  private tempPath: fabric.Path | null = null
  private strokeColor = '#000000'
  private strokeWidth = 2
  private isDrawing = false

  setOptions(options: { strokeColor?: string; strokeWidth?: number }) {
    if (options.strokeColor !== undefined) this.strokeColor = options.strokeColor
    if (options.strokeWidth !== undefined) this.strokeWidth = options.strokeWidth
  }

  protected onActivate() {
    if (!this.canvas) return
    this.canvas.selection = false
    this.points = []
  }

  protected onDeactivate() {
    this.finalizePath()
    if (!this.canvas) return
    this.canvas.selection = true
  }

  onMouseDown(event: fabric.TPointerEventInfo) {
    if (!this.canvas) return
    const pointer = this.canvas.getScenePoint(event.e)
    this.points.push(new fabric.Point(pointer.x, pointer.y))
    this.isDrawing = true
    this.updateTempPath()
  }

  onMouseMove(_event: fabric.TPointerEventInfo) {}

  onMouseUp(_event: fabric.TPointerEventInfo) {}

  onKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === 'Escape') {
      this.finalizePath()
    }
  }

  private updateTempPath() {
    if (!this.canvas || this.points.length < 2) return

    if (this.tempPath) {
      this.canvas.remove(this.tempPath)
    }

    let pathData = `M ${this.points[0].x} ${this.points[0].y}`
    for (let i = 1; i < this.points.length; i++) {
      pathData += ` L ${this.points[i].x} ${this.points[i].y}`
    }

    this.tempPath = new fabric.Path(pathData, {
      fill: 'transparent',
      stroke: this.strokeColor,
      strokeWidth: this.strokeWidth,
      selectable: false,
      evented: false,
    })

    this.canvas.add(this.tempPath)
    this.canvas.renderAll()
  }

  private finalizePath() {
    if (!this.canvas) return

    if (this.tempPath && this.points.length >= 2) {
      this.tempPath.set({ selectable: true, evented: true })
      this.canvas.setActiveObject(this.tempPath)
      this.canvas.renderAll()

      // Emit event for history tracking
      eventBus.emit('tool:object-created', {
        object: this.tempPath,
        name: '钢笔路径',
      })
    }

    this.points = []
    this.tempPath = null
    this.isDrawing = false
  }
}
