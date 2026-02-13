import { BaseTool } from './BaseTool'
import * as fabric from 'fabric'

export class TransformTool extends BaseTool {
  readonly id = 'transform'
  readonly name = '变换工具'
  readonly cursor = 'default'

  protected onActivate() {
    if (!this.canvas) return
    this.canvas.selection = true
    const active = this.canvas.getActiveObject()
    if (active) {
      active.set({
        hasControls: true,
        hasBorders: true,
        lockRotation: false,
        lockScalingX: false,
        lockScalingY: false,
      })
      this.canvas.renderAll()
    }
  }

  protected onDeactivate() {}

  onMouseDown(_event: fabric.TPointerEventInfo) {}
  onMouseMove(_event: fabric.TPointerEventInfo) {}
  onMouseUp(_event: fabric.TPointerEventInfo) {}
}
