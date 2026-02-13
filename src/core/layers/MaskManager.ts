import * as fabric from 'fabric'

export class MaskManager {
  private canvas: fabric.Canvas

  constructor(canvas: fabric.Canvas) {
    this.canvas = canvas
  }

  applyMask(target: fabric.FabricObject, maskShape: fabric.FabricObject) {
    target.set('clipPath', maskShape)
    this.canvas.renderAll()
  }

  removeMask(target: fabric.FabricObject) {
    target.set('clipPath', undefined)
    this.canvas.renderAll()
  }

  createRectMask(left: number, top: number, width: number, height: number): fabric.Rect {
    return new fabric.Rect({
      left: left,
      top: top,
      width: width,
      height: height,
      absolutePositioned: true,
    })
  }

  createEllipseMask(left: number, top: number, rx: number, ry: number): fabric.Ellipse {
    return new fabric.Ellipse({
      left: left,
      top: top,
      rx: rx,
      ry: ry,
      absolutePositioned: true,
    })
  }
}
