import { BaseTool } from '../BaseTool'
import * as fabric from 'fabric'
import { createSelectionFromMask } from '@/core/selection/MaskToSelection'
import eventBus from '@/core/canvas/CanvasEventBus'

export class MagicWandTool extends BaseTool {
  readonly id = 'magic-wand'
  readonly name = '魔术棒'
  readonly cursor = 'crosshair'

  private tolerance = 30
  private selectionPath: fabric.Path | null = null

  setOptions(options: { tolerance?: number }) {
    if (options.tolerance !== undefined) this.tolerance = options.tolerance
  }

  getTolerance(): number {
    return this.tolerance
  }

  protected onActivate() {
    if (!this.canvas) return
    this.canvas.selection = false
    this.canvas.forEachObject(obj => {
      obj.set({ selectable: false, evented: false })
    })
  }

  protected onDeactivate() {
    // Do NOT remove selection — let it persist across tool switches.
    if (!this.canvas) return
    this.canvas.selection = true
    // Restore object interactivity
    this.canvas.forEachObject(obj => {
      const name = (obj as any).name as string | undefined
      if (name === '__background' || name === '__selection' || name === '__selection_preview') return
      obj.set({ selectable: true, evented: true })
    })
  }

  onMouseDown(event: fabric.TPointerEventInfo) {
    if (!this.canvas) return
    this.removeExistingSelection()

    const pointer = this.canvas.getScenePoint(event.e)
    const vpt = this.canvas.viewportTransform!
    const pixelX = Math.round(pointer.x * vpt[0] + vpt[4])
    const pixelY = Math.round(pointer.y * vpt[3] + vpt[5])

    const canvasWidth = this.canvas.getWidth()
    const canvasHeight = this.canvas.getHeight()

    if (pixelX < 0 || pixelX >= canvasWidth || pixelY < 0 || pixelY >= canvasHeight) return

    const ctx = this.canvas.getContext()
    const imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight)
    const mask = this.floodFill(imageData, pixelX, pixelY, canvasWidth, canvasHeight)

    this.createSelectionFromMask(mask, canvasWidth, canvasHeight, vpt)
  }

  onMouseMove(_event: fabric.TPointerEventInfo) {}
  onMouseUp(_event: fabric.TPointerEventInfo) {}

  /**
   * Scanline flood fill - significantly more efficient than per-pixel stack.
   * Uses Uint8Array for O(1) visited checks, processes entire horizontal spans
   * at once so the queue size stays proportional to perimeter, not area.
   */
  private floodFill(
    imageData: ImageData,
    startX: number,
    startY: number,
    width: number,
    height: number
  ): Uint8Array {
    const data = imageData.data
    const mask = new Uint8Array(width * height)
    const tol = this.tolerance * 3

    const si = (startY * width + startX) * 4
    const tR = data[si]
    const tG = data[si + 1]
    const tB = data[si + 2]

    // Check if pixel at (x,y) matches target color and is not yet in mask
    const match = (x: number, y: number): boolean => {
      const idx = y * width + x
      if (mask[idx]) return false
      const i = idx * 4
      return (
        Math.abs(data[i] - tR) +
        Math.abs(data[i + 1] - tG) +
        Math.abs(data[i + 2] - tB)
      ) <= tol
    }

    // Find initial horizontal span
    let l = startX
    let r = startX
    while (l > 0 && match(l - 1, startY)) l--
    while (r < width - 1 && match(r + 1, startY)) r++
    for (let x = l; x <= r; x++) mask[startY * width + x] = 1

    // Stack of spans: [leftX, rightX, y]
    const stack: Array<[number, number, number]> = [[l, r, startY]]

    while (stack.length > 0) {
      const [sl, sr, sy] = stack.pop()!

      // Check row above (sy-1) and row below (sy+1)
      for (const ny of [sy - 1, sy + 1]) {
        if (ny < 0 || ny >= height) continue

        let x = sl
        while (x <= sr) {
          // Skip non-matching or already-filled pixels
          while (x <= sr && !match(x, ny)) x++
          if (x > sr) break

          // Found start of a new matching span
          let spanL = x
          while (x <= sr && match(x, ny)) {
            mask[ny * width + x] = 1
            x++
          }
          let spanR = x - 1

          // Extend span beyond parent's range
          while (spanL > 0 && match(spanL - 1, ny)) {
            spanL--
            mask[ny * width + spanL] = 1
          }
          while (spanR < width - 1 && match(spanR + 1, ny)) {
            spanR++
            mask[ny * width + spanR] = 1
          }

          stack.push([spanL, spanR, ny])
        }
      }
    }

    return mask
  }

  private createSelectionFromMask(
    mask: Uint8Array,
    width: number,
    height: number,
    vpt: number[]
  ) {
    if (!this.canvas) return
    this.selectionPath = createSelectionFromMask(this.canvas, mask, width, height, vpt)
    eventBus.emit('selection:changed', true)
  }

  private removeSelection() {
    if (this.selectionPath && this.canvas) {
      this.canvas.remove(this.selectionPath)
      this.selectionPath = null
      eventBus.emit('selection:changed', false)
    }
  }

  /** Remove any existing __selection from the canvas (from any tool). */
  private removeExistingSelection() {
    if (!this.canvas) return
    const existing = this.canvas.getObjects().filter(
      (o: any) => o.name === '__selection' || o.name === '__selection_preview'
    )
    existing.forEach(obj => this.canvas!.remove(obj))
    this.selectionPath = null
    if (existing.length > 0) {
      eventBus.emit('selection:changed', false)
    }
  }
}
