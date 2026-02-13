import { BaseTool } from './BaseTool'
import * as fabric from 'fabric'
import eventBus from '../canvas/CanvasEventBus'

export type DodgeBurnMode = 'dodge' | 'burn'
export type ToneRange = 'shadows' | 'midtones' | 'highlights'

export class DodgeBurnTool extends BaseTool {
  readonly id = 'dodge-burn'
  readonly name = '减淡/加深'
  readonly cursor = 'crosshair'

  private brushSize = 20
  private exposure = 0.3
  private mode: DodgeBurnMode = 'dodge'
  private range: ToneRange = 'midtones'
  private isActive_ = false
  private snapshot: ImageData | null = null
  private resultCanvas: HTMLCanvasElement | null = null
  private resultCtx: CanvasRenderingContext2D | null = null

  setOptions(options: {
    size?: number
    exposure?: number
    mode?: DodgeBurnMode
    range?: ToneRange
  }) {
    if (options.size !== undefined) this.brushSize = options.size
    if (options.exposure !== undefined) this.exposure = options.exposure
    if (options.mode !== undefined) this.mode = options.mode
    if (options.range !== undefined) this.range = options.range
  }

  protected onActivate() {
    if (!this.canvas) return
    this.canvas.selection = false
    this.canvas.isDrawingMode = false
  }

  protected onDeactivate() {
    if (!this.canvas) return
    this.canvas.selection = true
    this.isActive_ = false
    this.snapshot = null
    this.resultCanvas = null
    this.resultCtx = null
  }

  onMouseDown(event: fabric.TPointerEventInfo) {
    if (!this.canvas) return

    this.isActive_ = true

    const ctx = this.canvas.getContext()
    const w = this.canvas.getWidth()
    const h = this.canvas.getHeight()
    this.snapshot = ctx.getImageData(0, 0, w, h)

    this.resultCanvas = document.createElement('canvas')
    this.resultCanvas.width = w
    this.resultCanvas.height = h
    this.resultCtx = this.resultCanvas.getContext('2d')!

    const pointer = this.canvas.getScenePoint(event.e)
    this.applyDodgeBurn(pointer.x, pointer.y)
  }

  onMouseMove(event: fabric.TPointerEventInfo) {
    if (!this.isActive_ || !this.canvas) return
    const pointer = this.canvas.getScenePoint(event.e)
    this.applyDodgeBurn(pointer.x, pointer.y)
  }

  onMouseUp(_event: fabric.TPointerEventInfo) {
    if (!this.isActive_ || !this.canvas) return
    this.isActive_ = false
    this.persistResult()
  }

  private getToneWeight(luminance: number): number {
    // luminance is 0-255
    const lum = luminance / 255
    switch (this.range) {
      case 'shadows':
        return Math.max(0, 1 - lum * 4)
      case 'midtones':
        return 1 - Math.abs(lum - 0.5) * 2
      case 'highlights':
        return Math.max(0, lum * 4 - 3)
      default:
        return 1
    }
  }

  private applyDodgeBurn(x: number, y: number) {
    if (!this.canvas || !this.snapshot || !this.resultCtx) return

    const vpt = this.canvas.viewportTransform!
    const w = this.canvas.getWidth()
    const h = this.canvas.getHeight()

    const pxX = Math.round(x * vpt[0] + vpt[4])
    const pxY = Math.round(y * vpt[3] + vpt[5])
    const size = this.brushSize

    const ctx = this.canvas.getContext()
    const srcData = this.snapshot

    const startX = Math.max(0, pxX - size)
    const startY = Math.max(0, pxY - size)
    const endX = Math.min(w, pxX + size)
    const endY = Math.min(h, pxY + size)
    const regionW = endX - startX
    const regionH = endY - startY

    if (regionW <= 0 || regionH <= 0) return

    const outImgData = this.resultCtx.createImageData(regionW, regionH)
    const visImgData = ctx.createImageData(regionW, regionH)

    for (let py = 0; py < regionH; py++) {
      for (let px = 0; px < regionW; px++) {
        const tx = startX + px
        const ty = startY + py
        const dx = tx - pxX
        const dy = ty - pxY

        if (dx * dx + dy * dy > size * size) continue

        const srcIdx = (ty * w + tx) * 4
        const dstIdx = (py * regionW + px) * 4

        const r = srcData.data[srcIdx]
        const g = srcData.data[srcIdx + 1]
        const b = srcData.data[srcIdx + 2]
        const a = srcData.data[srcIdx + 3]

        const luminance = r * 0.299 + g * 0.587 + b * 0.114
        const weight = this.getToneWeight(luminance)
        const exposure = this.exposure * weight

        let newR: number, newG: number, newB: number

        if (this.mode === 'dodge') {
          // Dodge: lighten - new = old + (255 - old) * exposure
          newR = Math.min(255, Math.round(r + (255 - r) * exposure))
          newG = Math.min(255, Math.round(g + (255 - g) * exposure))
          newB = Math.min(255, Math.round(b + (255 - b) * exposure))
        } else {
          // Burn: darken - new = old - old * exposure
          newR = Math.max(0, Math.round(r - r * exposure))
          newG = Math.max(0, Math.round(g - g * exposure))
          newB = Math.max(0, Math.round(b - b * exposure))
        }

        outImgData.data[dstIdx] = newR
        outImgData.data[dstIdx + 1] = newG
        outImgData.data[dstIdx + 2] = newB
        outImgData.data[dstIdx + 3] = a

        visImgData.data[dstIdx] = newR
        visImgData.data[dstIdx + 1] = newG
        visImgData.data[dstIdx + 2] = newB
        visImgData.data[dstIdx + 3] = a

        // Update snapshot for accumulative strokes
        srcData.data[srcIdx] = newR
        srcData.data[srcIdx + 1] = newG
        srcData.data[srcIdx + 2] = newB
      }
    }

    ctx.putImageData(visImgData, startX, startY)
    this.resultCtx.putImageData(outImgData, startX, startY)
  }

  private persistResult() {
    if (!this.canvas || !this.resultCanvas) return

    const dataUrl = this.resultCanvas.toDataURL('image/png')
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
        name: this.mode === 'dodge' ? '减淡' : '加深',
      })
      this.canvas!.add(fImg)
      this.canvas!.renderAll()

      eventBus.emit('tool:object-created', {
        object: fImg,
        name: this.mode === 'dodge' ? '减淡' : '加深',
      })

      this.resultCanvas = null
      this.resultCtx = null
      this.snapshot = null
    }
    imgEl.src = dataUrl
  }
}
