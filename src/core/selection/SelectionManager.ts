import * as fabric from 'fabric'

export class SelectionManager {
  private canvas: fabric.Canvas
  private selectionShape: fabric.FabricObject | null = null

  constructor(canvas: fabric.Canvas) {
    this.canvas = canvas
  }

  setSelection(shape: fabric.FabricObject) {
    this.clearSelection()
    shape.set({
      selectable: false,
      evented: false,
      name: '__selection',
    })
    this.selectionShape = shape
    this.canvas.add(shape)
    this.canvas.renderAll()
  }

  clearSelection() {
    if (this.selectionShape) {
      this.canvas.remove(this.selectionShape)
      this.selectionShape = null
      this.canvas.renderAll()
    }
  }

  getSelection(): fabric.FabricObject | null {
    return this.selectionShape
  }

  hasSelection(): boolean {
    return this.selectionShape !== null
  }

  getSelectionBounds() {
    if (!this.selectionShape) return null
    return {
      left: this.selectionShape.left || 0,
      top: this.selectionShape.top || 0,
      width: (this.selectionShape.width || 0) * (this.selectionShape.scaleX || 1),
      height: (this.selectionShape.height || 0) * (this.selectionShape.scaleY || 1),
    }
  }

  selectAll() {
    this.clearSelection()
    const rect = new fabric.Rect({
      left: 0,
      top: 0,
      width: this.canvas.getWidth(),
      height: this.canvas.getHeight(),
      fill: 'rgba(0,120,212,0.1)',
      stroke: '#0078d4',
      strokeWidth: 1,
      strokeDashArray: [4, 4],
    })
    this.setSelection(rect)
  }
}
