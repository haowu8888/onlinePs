import { BaseTool } from './BaseTool'
import * as fabric from 'fabric'
import type { RulerMeasurement } from '@/types/tool'

export class RulerTool extends BaseTool {
  readonly id = 'ruler'
  readonly name = '标尺工具'
  readonly cursor = 'crosshair'

  private isDragging = false
  private startPoint: { x: number; y: number } | null = null
  private rulerLine: fabric.Line | null = null
  private onMeasure: ((measurement: RulerMeasurement) => void) | null = null

  setMeasureCallback(callback: (measurement: RulerMeasurement) => void) {
    this.onMeasure = callback
  }

  protected onActivate() {
    if (!this.canvas) return
    this.canvas.selection = false
    this.canvas.forEachObject(obj => {
      obj.set({ selectable: false, evented: false })
    })
  }

  protected onDeactivate() {
    this.removeRulerLine()
    this.isDragging = false
    this.startPoint = null
    if (this.onMeasure) {
      this.onMeasure(null as unknown as RulerMeasurement)
    }
    if (!this.canvas) return
    this.canvas.selection = true
    this.canvas.forEachObject(obj => {
      if ((obj as any).name !== '__background' && (obj as any).name !== '__selection') {
        obj.set({ selectable: true, evented: true })
      }
    })
  }

  onMouseDown(event: fabric.TPointerEventInfo) {
    if (!this.canvas) return
    this.removeRulerLine()

    const pointer = this.canvas.getScenePoint(event.e)
    this.startPoint = { x: pointer.x, y: pointer.y }
    this.isDragging = true

    this.rulerLine = new fabric.Line(
      [pointer.x, pointer.y, pointer.x, pointer.y],
      {
        stroke: '#0078d4',
        strokeWidth: 2,
        selectable: false,
        evented: false,
        name: '__ruler',
        strokeDashArray: [6, 3],
      }
    )
    this.canvas.add(this.rulerLine)
  }

  onMouseMove(event: fabric.TPointerEventInfo) {
    if (!this.canvas || !this.isDragging || !this.startPoint || !this.rulerLine) return

    const pointer = this.canvas.getScenePoint(event.e)
    this.rulerLine.set({ x2: pointer.x, y2: pointer.y })
    this.canvas.renderAll()

    this.emitMeasurement(pointer.x, pointer.y)
  }

  onMouseUp(event: fabric.TPointerEventInfo) {
    if (!this.canvas || !this.isDragging || !this.startPoint) return
    this.isDragging = false

    const pointer = this.canvas.getScenePoint(event.e)
    this.emitMeasurement(pointer.x, pointer.y)
  }

  private emitMeasurement(endX: number, endY: number) {
    if (!this.startPoint || !this.onMeasure) return

    const x1 = this.startPoint.x
    const y1 = this.startPoint.y
    const x2 = endX
    const y2 = endY
    const dx = x2 - x1
    const dy = y2 - y1
    const distance = Math.sqrt(dx * dx + dy * dy)
    const angle = Math.atan2(dy, dx) * (180 / Math.PI)

    this.onMeasure({
      x1: Math.round(x1),
      y1: Math.round(y1),
      x2: Math.round(x2),
      y2: Math.round(y2),
      width: Math.round(Math.abs(dx)),
      height: Math.round(Math.abs(dy)),
      distance: Math.round(distance * 100) / 100,
      angle: Math.round(angle * 100) / 100,
    })
  }

  private removeRulerLine() {
    if (this.rulerLine && this.canvas) {
      this.canvas.remove(this.rulerLine)
      this.rulerLine = null
    }
  }
}
