import { BaseTool } from './BaseTool'
import * as fabric from 'fabric'
import eventBus from '../canvas/CanvasEventBus'

export class CloneStampTool extends BaseTool {
  readonly id = 'clone-stamp'
  readonly name = '仿制图章'
  readonly cursor = 'crosshair'

  private sourceSet = false
  private sourceX = 0
  private sourceY = 0
  private stampSize = 20
  private isStamping = false
  private offsetX = 0
  private offsetY = 0
  private sourceSnapshot: ImageData | null = null
  // Offscreen canvas to accumulate stamp strokes for persistence
  private stampCanvas: HTMLCanvasElement | null = null
  private stampCtx: CanvasRenderingContext2D | null = null

  setOptions(options: { size?: number }) {
    if (options.size !== undefined) this.stampSize = options.size
  }

  protected onActivate() {
    if (!this.canvas) return
    this.canvas.selection = false
    this.canvas.isDrawingMode = false
  }

  protected onDeactivate() {
    if (!this.canvas) return
    this.canvas.selection = true
    this.sourceSet = false
    this.isStamping = false
    this.sourceSnapshot = null
    this.stampCanvas = null
    this.stampCtx = null
  }

  onMouseDown(event: fabric.TPointerEventInfo) {
    if (!this.canvas) return
    const e = event.e as MouseEvent
    const pointer = this.canvas.getScenePoint(event.e)

    if (e.altKey) {
      // Set source point and take a snapshot of the current canvas state
      this.sourceX = pointer.x
      this.sourceY = pointer.y
      this.sourceSet = true
      const ctx = this.canvas.getContext()
      const w = this.canvas.getWidth()
      const h = this.canvas.getHeight()
      this.sourceSnapshot = ctx.getImageData(0, 0, w, h)
      return
    }

    if (!this.sourceSet || !this.sourceSnapshot) return

    this.isStamping = true
    this.offsetX = pointer.x - this.sourceX
    this.offsetY = pointer.y - this.sourceY

    // Create offscreen canvas for this stroke
    const w = this.canvas.getWidth()
    const h = this.canvas.getHeight()
    this.stampCanvas = document.createElement('canvas')
    this.stampCanvas.width = w
    this.stampCanvas.height = h
    this.stampCtx = this.stampCanvas.getContext('2d')!

    this.stamp(pointer.x, pointer.y)
  }

  onMouseMove(event: fabric.TPointerEventInfo) {
    if (!this.isStamping || !this.canvas) return
    const pointer = this.canvas.getScenePoint(event.e)
    this.stamp(pointer.x, pointer.y)
  }

  onMouseUp(_event: fabric.TPointerEventInfo) {
    if (!this.isStamping || !this.canvas) return
    this.isStamping = false
    this.persistStampResult()
  }

  private stamp(x: number, y: number) {
    if (!this.canvas || !this.sourceSnapshot || !this.stampCtx) return

    const vpt = this.canvas.viewportTransform!
    const w = this.canvas.getWidth()
    const h = this.canvas.getHeight()

    const destPxX = Math.round(x * vpt[0] + vpt[4])
    const destPxY = Math.round(y * vpt[3] + vpt[5])
    const srcPxX = Math.round((x - this.offsetX) * vpt[0] + vpt[4])
    const srcPxY = Math.round((y - this.offsetY) * vpt[3] + vpt[5])
    const size = this.stampSize
    const srcData = this.sourceSnapshot

    // Draw to both the real canvas (immediate visual) and the offscreen canvas (persistence)
    const ctx = this.canvas.getContext()

    const halfSize = size
    const startX = Math.max(0, Math.min(destPxX - halfSize, w))
    const startY = Math.max(0, Math.min(destPxY - halfSize, h))
    const endX = Math.min(w, destPxX + halfSize)
    const endY = Math.min(h, destPxY + halfSize)
    const regionW = endX - startX
    const regionH = endY - startY

    if (regionW <= 0 || regionH <= 0) return

    const stampImgData = this.stampCtx.createImageData(regionW, regionH)
    const visImgData = ctx.createImageData(regionW, regionH)

    for (let py = 0; py < regionH; py++) {
      for (let px = 0; px < regionW; px++) {
        const tx = startX + px
        const ty = startY + py
        const dx = tx - destPxX
        const dy = ty - destPxY

        // Circular brush
        if (dx * dx + dy * dy > size * size) continue

        const sx = srcPxX + (tx - destPxX)
        const sy = srcPxY + (ty - destPxY)
        if (sx < 0 || sx >= w || sy < 0 || sy >= h) continue

        const srcIdx = (sy * w + sx) * 4
        const dstIdx = (py * regionW + px) * 4

        stampImgData.data[dstIdx] = srcData.data[srcIdx]
        stampImgData.data[dstIdx + 1] = srcData.data[srcIdx + 1]
        stampImgData.data[dstIdx + 2] = srcData.data[srcIdx + 2]
        stampImgData.data[dstIdx + 3] = srcData.data[srcIdx + 3]

        visImgData.data[dstIdx] = srcData.data[srcIdx]
        visImgData.data[dstIdx + 1] = srcData.data[srcIdx + 1]
        visImgData.data[dstIdx + 2] = srcData.data[srcIdx + 2]
        visImgData.data[dstIdx + 3] = srcData.data[srcIdx + 3]
      }
    }

    // Real-time visual on the main canvas
    ctx.putImageData(visImgData, startX, startY)
    // Accumulate on offscreen canvas for persistence
    this.stampCtx.putImageData(stampImgData, startX, startY)
  }

  private persistStampResult() {
    if (!this.canvas || !this.stampCanvas) return

    const dataUrl = this.stampCanvas.toDataURL('image/png')
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
        name: '仿制图章',
      })
      this.canvas!.add(fImg)
      this.canvas!.renderAll()

      eventBus.emit('tool:object-created', {
        object: fImg,
        name: '仿制图章',
      })

      this.stampCanvas = null
      this.stampCtx = null
    }
    imgEl.src = dataUrl
  }
}
