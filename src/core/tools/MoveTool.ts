import { BaseTool } from './BaseTool'
import type * as fabric from 'fabric'

export class MoveTool extends BaseTool {
  readonly id = 'move'
  readonly name = '移动工具'
  readonly cursor = 'move'

  protected onActivate() {
    if (!this.canvas) return
    this.canvas.selection = false
    this.canvas.forEachObject(obj => {
      if ((obj as any).name !== '__background') {
        obj.set({ selectable: true, evented: true })
      }
    })
  }

  protected onDeactivate() {
    if (!this.canvas) return
    this.canvas.selection = true
  }

  onMouseDown(_event: fabric.TPointerEventInfo) {}
  onMouseMove(_event: fabric.TPointerEventInfo) {}
  onMouseUp(_event: fabric.TPointerEventInfo) {}
}
