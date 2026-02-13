import { BaseTool } from './BaseTool'
import * as fabric from 'fabric'
import eventBus from '../canvas/CanvasEventBus'

export class BlurBrushTool extends BaseTool {
  readonly id = 'blur-brush'
  readonly name = '模糊笔刷'
  readonly cursor = 'crosshair'

  private brushSize = 20
  private strength = 0.5
  private isBlurring = false
  private snapshot: ImageData | null = null
  private blurCanvas: HTMLCanvasElement | null = null
  private blurCtx: CanvasRenderingContext2D | null = null

  setOptions(options: { size?: number; strength?: number }) {
    if (options.size !== undefined) this.brushSize = options.size
    if (options.strength !== undefined) this.strength = options.strength
  }

  protected onActivate() {
    if (!this.canvas) return
    this.canvas.selection = false
    this.canvas.isDrawingMode = false
  }

  protected onDeactivate() {
    if (!this.canvas) return
    this.canvas.selection = true
    this.isBlurring = false
    this.snapshot = null
    this.blurCanvas = null
    this.blurCtx = null
  }

  onMouseDown(event: fabric.TPointerEventInfo) {
    if (!this.canvas) return

    this.isBlurring = true

    // Snapshot current canvas state
    const ctx = this.canvas.getContext()
    const w = this.canvas.getWidth()
    const h = this.canvas.getHeight()
    this.snapshot = ctx.getImageData(0, 0, w, h)

    // Create offscreen canvas for persistence
    this.blurCanvas = document.createElement('canvas')
    this.blurCanvas.width = w
    this.blurCanvas.height = h
    this.blurCtx = this.blurCanvas.getContext('2d')!

    const pointer = this.canvas.getScenePoint(event.e)
    this.applyBlur(pointer.x, pointer.y)
  }

  onMouseMove(event: fabric.TPointerEventInfo) {
    if (!this.isBlurring || !this.canvas) return
    const pointer = this.canvas.getScenePoint(event.e)
    this.applyBlur(pointer.x, pointer.y)
  }

  onMouseUp(_event: fabric.TPointerEventInfo) {
    if (!this.isBlurring || !this.canvas) return
    this.isBlurring = false
    this.persistResult()
  }

  private applyBlur(x: number, y: number) {
    if (!this.canvas || !this.snapshot || !this.blurCtx) return

    const vpt = this.canvas.viewportTransform!
    const w = this.canvas.getWidth()
    const h = this.canvas.getHeight()

    const pxX = Math.round(x * vpt[0] + vpt[4])
    const pxY = Math.round(y * vpt[3] + vpt[5])
    const size = this.brushSize
    const radius = 2 // blur kernel radius
    const strength = this.strength

    const ctx = this.canvas.getContext()
    const srcData = this.snapshot

    const startX = Math.max(0, pxX - size)
    const startY = Math.max(0, pxY - size)
    const endX = Math.min(w, pxX + size)
    const endY = Math.min(h, pxY + size)
    const regionW = endX - startX
    const regionH = endY - startY

    if (regionW <= 0 || regionH <= 0) return

    const blurImgData = this.blurCtx.createImageData(regionW, regionH)
    const visImgData = ctx.createImageData(regionW, regionH)

    for (let py = 0; py < regionH; py++) {
      for (let px = 0; px < regionW; px++) {
        const tx = startX + px
        const ty = startY + py
        const dx = tx - pxX
        const dy = ty - pxY

        if (dx * dx + dy * dy > size * size) continue

        // Box blur in the neighborhood
        let sumR = 0, sumG = 0, sumB = 0, sumA = 0, count = 0
        for (let ky = -radius; ky <= radius; ky++) {
          for (let kx = -radius; kx <= radius; kx++) {
            const sx = tx + kx
            const sy = ty + ky
            if (sx < 0 || sx >= w || sy < 0 || sy >= h) continue
            const sIdx = (sy * w + sx) * 4
            sumR += srcData.data[sIdx]
            sumG += srcData.data[sIdx + 1]
            sumB += srcData.data[sIdx + 2]
            sumA += srcData.data[sIdx + 3]
            count++
          }
        }

        if (count === 0) continue

        const origIdx = (ty * w + tx) * 4
        const dstIdx = (py * regionW + px) * 4

        // Blend based on strength
        const avgR = sumR / count
        const avgG = sumG / count
        const avgB = sumB / count
        const avgA = sumA / count

        const r = Math.round(srcData.data[origIdx] + (avgR - srcData.data[origIdx]) * strength)
        const g = Math.round(srcData.data[origIdx + 1] + (avgG - srcData.data[origIdx + 1]) * strength)
        const b = Math.round(srcData.data[origIdx + 2] + (avgB - srcData.data[origIdx + 2]) * strength)
        const a = Math.round(srcData.data[origIdx + 3] + (avgA - srcData.data[origIdx + 3]) * strength)

        blurImgData.data[dstIdx] = r
        blurImgData.data[dstIdx + 1] = g
        blurImgData.data[dstIdx + 2] = b
        blurImgData.data[dstIdx + 3] = a

        visImgData.data[dstIdx] = r
        visImgData.data[dstIdx + 1] = g
        visImgData.data[dstIdx + 2] = b
        visImgData.data[dstIdx + 3] = a

        // Update snapshot so continuous strokes accumulate
        srcData.data[origIdx] = r
        srcData.data[origIdx + 1] = g
        srcData.data[origIdx + 2] = b
        srcData.data[origIdx + 3] = a
      }
    }

    ctx.putImageData(visImgData, startX, startY)
    this.blurCtx.putImageData(blurImgData, startX, startY)
  }

  private persistResult() {
    if (!this.canvas || !this.blurCanvas) return

    const dataUrl = this.blurCanvas.toDataURL('image/png')
    const imgEl = new Image()
    imgEl.onload = () => {
      if (!this.canvas) return
      const vpt = this.canvas.viewportTransform!

      const fImg = new fabric.FabricImage(imgEl, {
        left: -vpt[4] / vpt[0],
        top: -vpt[5] / vpt[3],
        scaleX: 1 / vpt[0],
        scaleY: 1 / vpt[3],
        selectable: true,
        evented: true,
        name: '模糊笔刷',
      })
      this.canvas!.add(fImg)
      this.canvas!.renderAll()

      eventBus.emit('tool:object-created', {
        object: fImg,
        name: '模糊笔刷',
      })

      this.blurCanvas = null
      this.blurCtx = null
      this.snapshot = null
    }
    imgEl.src = dataUrl
  }
}
