import { BaseTool } from '../BaseTool'
import * as fabric from 'fabric'

export class LassoSelectionTool extends BaseTool {
  readonly id = 'lasso'
  readonly name = '套索工具'
  readonly cursor = 'crosshair'

  private points: Array<{ x: number; y: number }> = []
  private tempPath: fabric.Path | null = null
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
    this.points = [{ x: pointer.x, y: pointer.y }]
    this.isSelecting = true
  }

  onMouseMove(event: fabric.TPointerEventInfo) {
    if (!this.isSelecting || !this.canvas) return

    const pointer = this.canvas.getScenePoint(event.e)
    this.points.push({ x: pointer.x, y: pointer.y })
    this.updatePath()
  }

  onMouseUp(_event: fabric.TPointerEventInfo) {
    if (!this.isSelecting || !this.canvas) return
    this.isSelecting = false

    // Close the path
    if (this.points.length > 2) {
      this.points.push(this.points[0])
      this.updatePath()
    }
  }

  private updatePath() {
    if (!this.canvas || this.points.length < 2) return

    if (this.tempPath) {
      this.canvas.remove(this.tempPath)
    }

    let pathData = `M ${this.points[0].x} ${this.points[0].y}`
    for (let i = 1; i < this.points.length; i++) {
      pathData += ` L ${this.points[i].x} ${this.points[i].y}`
    }

    this.tempPath = new fabric.Path(pathData, {
      fill: 'rgba(0,120,212,0.1)',
      stroke: '#0078d4',
      strokeWidth: 1,
      strokeDashArray: [4, 4],
      selectable: false,
      evented: false,
      name: '__selection',
    })

    this.canvas.add(this.tempPath)
    this.canvas.renderAll()
  }

  private removeSelection() {
    if (this.tempPath && this.canvas) {
      this.canvas.remove(this.tempPath)
      this.tempPath = null
    }
    this.points = []
  }
}
