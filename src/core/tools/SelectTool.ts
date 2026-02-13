import { BaseTool } from './BaseTool'
import type * as fabric from 'fabric'

export class SelectTool extends BaseTool {
  readonly id = 'select'
  readonly name = '选择工具'
  readonly cursor = 'default'

  protected onActivate() {
    if (!this.canvas) return
    this.canvas.selection = true
    this.canvas.forEachObject(obj => {
      if ((obj as any).name !== '__background') {
        obj.set({ selectable: true, evented: true })
      }
    })
  }

  protected onDeactivate() {}

  onMouseDown(_event: fabric.TPointerEventInfo) {}
  onMouseMove(_event: fabric.TPointerEventInfo) {}
  onMouseUp(_event: fabric.TPointerEventInfo) {}
}
