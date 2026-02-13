import { BaseTool } from './BaseTool'
import type * as fabric from 'fabric'

export class EyedropperTool extends BaseTool {
  readonly id = 'eyedropper'
  readonly name = '吸管工具'
  readonly cursor = 'crosshair'

  private onColorPicked: ((color: string) => void) | null = null

  setColorCallback(callback: (color: string) => void) {
    this.onColorPicked = callback
  }

  protected onActivate() {
    if (!this.canvas) return
    this.canvas.selection = false
  }

  protected onDeactivate() {
    if (!this.canvas) return
    this.canvas.selection = true
  }

  onMouseDown(event: fabric.TPointerEventInfo) {
    if (!this.canvas) return

    const pointer = this.canvas.getScenePoint(event.e)
    const ctx = this.canvas.getContext()
    const vpt = this.canvas.viewportTransform!
    // Convert scene coordinates to canvas pixel coordinates
    const pixelX = pointer.x * vpt[0] + vpt[4]
    const pixelY = pointer.y * vpt[3] + vpt[5]

    const pixel = ctx.getImageData(Math.round(pixelX), Math.round(pixelY), 1, 1).data
    const hex = `#${pixel[0].toString(16).padStart(2, '0')}${pixel[1].toString(16).padStart(2, '0')}${pixel[2].toString(16).padStart(2, '0')}`

    if (this.onColorPicked) {
      this.onColorPicked(hex)
    }
  }

  onMouseMove(_event: fabric.TPointerEventInfo) {}
  onMouseUp(_event: fabric.TPointerEventInfo) {}
}
