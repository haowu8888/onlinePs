import { BaseTool } from './BaseTool'
import * as fabric from 'fabric'
import tinycolor from 'tinycolor2'
import eventBus from '../canvas/CanvasEventBus'

export class PaintBucketTool extends BaseTool {
  readonly id = 'paint-bucket'
  readonly name = '油漆桶'
  readonly cursor = 'crosshair'

  private tolerance = 30
  private fillColor = '#000000'
  private fillOpacity = 1

  setOptions(options: { tolerance?: number; fillColor?: string; opacity?: number }) {
    if (options.tolerance !== undefined) this.tolerance = options.tolerance
    if (options.fillColor !== undefined) this.fillColor = options.fillColor
    if (options.opacity !== undefined) this.fillOpacity = options.opacity
  }

  protected onActivate() {
    if (!this.canvas) return
    this.canvas.selection = false
    this.canvas.forEachObject(obj => {
      obj.set({ selectable: false, evented: false })
    })
  }

  protected onDeactivate() {
    if (!this.canvas) return
    this.canvas.selection = true
    this.canvas.forEachObject(obj => {
      if ((obj as any).name !== '__background' && (obj as any).name !== '__selection') {
        obj.set({ selectable: true, evented: true })
      }
    })
  }

  onMouseDown(event: fabric.TPointerEventInfo) {
    if (!this.canvas) return

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

    this.applyFill(imageData, mask, canvasWidth, canvasHeight, vpt)
  }

  onMouseMove(_event: fabric.TPointerEventInfo) {}
  onMouseUp(_event: fabric.TPointerEventInfo) {}

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

    let l = startX
    let r = startX
    while (l > 0 && match(l - 1, startY)) l--
    while (r < width - 1 && match(r + 1, startY)) r++
    for (let x = l; x <= r; x++) mask[startY * width + x] = 1

    const stack: Array<[number, number, number]> = [[l, r, startY]]

    while (stack.length > 0) {
      const [sl, sr, sy] = stack.pop()!

      for (const ny of [sy - 1, sy + 1]) {
        if (ny < 0 || ny >= height) continue

        let x = sl
        while (x <= sr) {
          while (x <= sr && !match(x, ny)) x++
          if (x > sr) break

          let spanL = x
          while (x <= sr && match(x, ny)) {
            mask[ny * width + x] = 1
            x++
          }
          let spanR = x - 1

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

  private applyFill(
    imageData: ImageData,
    mask: Uint8Array,
    width: number,
    height: number,
    vpt: number[]
  ) {
    if (!this.canvas) return

    const data = imageData.data
    const color = tinycolor(this.fillColor)
    const rgb = color.toRgb()
    const alpha = this.fillOpacity

    // Find bounding box
    let minX = width, minY = height, maxX = 0, maxY = 0
    let hasPixels = false
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (mask[y * width + x]) {
          hasPixels = true
          if (x < minX) minX = x
          if (y < minY) minY = y
          if (x > maxX) maxX = x
          if (y > maxY) maxY = y
        }
      }
    }
    if (!hasPixels) return

    // Apply fill with alpha blending to masked pixels
    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        if (mask[y * width + x]) {
          const i = (y * width + x) * 4
          const srcA = alpha
          const dstA = data[i + 3] / 255
          const outA = srcA + dstA * (1 - srcA)

          if (outA > 0) {
            data[i] = Math.round((rgb.r * srcA + data[i] * dstA * (1 - srcA)) / outA)
            data[i + 1] = Math.round((rgb.g * srcA + data[i + 1] * dstA * (1 - srcA)) / outA)
            data[i + 2] = Math.round((rgb.b * srcA + data[i + 2] * dstA * (1 - srcA)) / outA)
            data[i + 3] = Math.round(outA * 255)
          }
        }
      }
    }

    // Write modified region back
    const regionW = maxX - minX + 1
    const regionH = maxY - minY + 1
    const regionData = new ImageData(regionW, regionH)
    for (let y = 0; y < regionH; y++) {
      for (let x = 0; x < regionW; x++) {
        const srcIdx = ((minY + y) * width + (minX + x)) * 4
        const dstIdx = (y * regionW + x) * 4
        regionData.data[dstIdx] = data[srcIdx]
        regionData.data[dstIdx + 1] = data[srcIdx + 1]
        regionData.data[dstIdx + 2] = data[srcIdx + 2]
        regionData.data[dstIdx + 3] = data[srcIdx + 3]
      }
    }

    const ctx = this.canvas.getContext()
    ctx.putImageData(regionData, minX, minY)

    // Create FabricImage for undo support
    const resultCanvas = document.createElement('canvas')
    resultCanvas.width = regionW
    resultCanvas.height = regionH
    const resultCtx = resultCanvas.getContext('2d')!
    resultCtx.putImageData(regionData, 0, 0)

    const dataUrl = resultCanvas.toDataURL('image/png')
    const imgEl = new Image()
    imgEl.onload = () => {
      const fImg = new fabric.FabricImage(imgEl, {
        left: (minX - vpt[4]) / vpt[0],
        top: (minY - vpt[5]) / vpt[3],
        scaleX: 1 / vpt[0],
        scaleY: 1 / vpt[3],
        selectable: true,
        evented: true,
        name: '油漆桶填充',
      })
      this.canvas!.add(fImg)
      this.canvas!.renderAll()

      eventBus.emit('tool:object-created', {
        object: fImg,
        name: '油漆桶填充',
      })
    }
    imgEl.src = dataUrl
  }
}
