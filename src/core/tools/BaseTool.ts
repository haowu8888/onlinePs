import type * as fabric from 'fabric'

export abstract class BaseTool {
  abstract readonly id: string
  abstract readonly name: string
  abstract readonly cursor: string

  protected canvas: fabric.Canvas | null = null
  protected isActive = false

  setCanvas(canvas: fabric.Canvas) {
    this.canvas = canvas
  }

  activate() {
    this.isActive = true
    if (this.canvas) {
      this.canvas.defaultCursor = this.cursor
      this.canvas.hoverCursor = this.cursor
    }
    this.onActivate()
  }

  deactivate() {
    this.isActive = false
    this.onDeactivate()
  }

  protected onActivate() {}
  protected onDeactivate() {}

  abstract onMouseDown(event: fabric.TPointerEventInfo): void
  abstract onMouseMove(event: fabric.TPointerEventInfo): void
  abstract onMouseUp(event: fabric.TPointerEventInfo): void

  onKeyDown?(e: KeyboardEvent): void
  onKeyUp?(e: KeyboardEvent): void
}
