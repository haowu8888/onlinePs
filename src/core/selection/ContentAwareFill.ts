import * as fabric from 'fabric'
import eventBus from '../canvas/CanvasEventBus'
import { ElMessage } from 'element-plus'

export class ContentAwareFill {
  /**
   * Execute content-aware fill on the selection area.
   * Uses patch-based texture synthesis from surrounding pixels.
   */
  static execute(canvas: fabric.Canvas) {
    // Step 1: Find selection object
    const selectionObj = canvas.getObjects().find((obj: any) => obj.name === '__selection')
    if (!selectionObj) {
      ElMessage.warning('请先用选区工具框选水印区域')
      return
    }

    const canvasW = canvas.getWidth()
    const canvasH = canvas.getHeight()
    const vpt = canvas.viewportTransform!

    // Step 2: Get selection bounds in screen (pixel) coordinates
    // Use the object's own properties transformed to screen space
    const selLeft = selectionObj.left ?? 0
    const selTop = selectionObj.top ?? 0
    const selWidth = (selectionObj.width ?? 0) * (selectionObj.scaleX ?? 1)
    const selHeight = (selectionObj.height ?? 0) * (selectionObj.scaleY ?? 1)

    // Transform to screen pixel coordinates
    const screenLeft = Math.round(selLeft * vpt[0] + vpt[4])
    const screenTop = Math.round(selTop * vpt[3] + vpt[5])
    const screenRight = Math.round((selLeft + selWidth) * vpt[0] + vpt[4])
    const screenBottom = Math.round((selTop + selHeight) * vpt[3] + vpt[5])

    // Clamp to canvas bounds
    const maskLeft = Math.max(0, Math.min(canvasW - 1, screenLeft))
    const maskTop = Math.max(0, Math.min(canvasH - 1, screenTop))
    const maskRight = Math.max(0, Math.min(canvasW, screenRight))
    const maskBottom = Math.max(0, Math.min(canvasH, screenBottom))
    const maskW = maskRight - maskLeft
    const maskH = maskBottom - maskTop

    if (maskW < 2 || maskH < 2) {
      ElMessage.warning('选区太小，请重新框选')
      return
    }

    // Step 3: Remove selection overlay and capture canvas pixels
    canvas.remove(selectionObj)
    canvas.renderAll()

    const ctx = canvas.getContext()
    // Get a region slightly larger than the mask for sampling (the "context" area)
    const samplePadding = Math.max(maskW, maskH, 30)
    const regionLeft = Math.max(0, maskLeft - samplePadding)
    const regionTop = Math.max(0, maskTop - samplePadding)
    const regionRight = Math.min(canvasW, maskRight + samplePadding)
    const regionBottom = Math.min(canvasH, maskBottom + samplePadding)
    const regionW = regionRight - regionLeft
    const regionH = regionBottom - regionTop

    const regionData = ctx.getImageData(regionLeft, regionTop, regionW, regionH)
    const data = regionData.data

    // Local mask coordinates (relative to region)
    const localMaskLeft = maskLeft - regionLeft
    const localMaskTop = maskTop - regionTop
    const localMaskRight = maskRight - regionLeft
    const localMaskBottom = maskBottom - regionTop

    // Build binary mask within the region
    const mask = new Uint8Array(regionW * regionH)
    for (let y = localMaskTop; y < localMaskBottom; y++) {
      for (let x = localMaskLeft; x < localMaskRight; x++) {
        mask[y * regionW + x] = 1
      }
    }

    // Step 4: Patch-based fill using surrounding texture
    // Strategy: For each row of pixels in the mask, sample from corresponding
    // rows above/below the mask. For each column, blend with left/right samples.
    const original = new Uint8ClampedArray(data)
    const patchSize = Math.max(3, Math.min(7, Math.floor(Math.min(maskW, maskH) / 4)))

    // Collect source patches from the border region (outside the mask)
    // Top strip
    const topStripY = Math.max(0, localMaskTop - patchSize)
    // Bottom strip
    const botStripY = Math.min(regionH - 1, localMaskBottom)
    // Left strip
    const leftStripX = Math.max(0, localMaskLeft - patchSize)
    // Right strip
    const rightStripX = Math.min(regionW - 1, localMaskRight)

    for (let y = localMaskTop; y < localMaskBottom; y++) {
      for (let x = localMaskLeft; x < localMaskRight; x++) {
        const idx = (y * regionW + x) * 4

        // Calculate relative position within the mask (0 to 1)
        const relX = (x - localMaskLeft) / Math.max(1, localMaskRight - localMaskLeft - 1)
        const relY = (y - localMaskTop) / Math.max(1, localMaskBottom - localMaskTop - 1)

        // Sample from 4 sides and bilinearly interpolate
        // Top sample: same relative X position, from top border
        const topSampleX = x
        const topSampleY = Math.min(topStripY + Math.floor(relY * patchSize), localMaskTop - 1)
        const topY = Math.max(0, topSampleY)

        // Bottom sample
        const botSampleY = Math.max(botStripY, Math.min(regionH - 1, botStripY + Math.floor((1 - relY) * patchSize)))

        // Left sample
        const leftSampleX = Math.max(0, Math.min(localMaskLeft - 1, leftStripX + Math.floor(relX * patchSize)))

        // Right sample
        const rightSampleX = Math.min(regionW - 1, Math.max(localMaskRight, rightStripX + Math.floor((1 - relX) * patchSize)))

        // Get colors from each side
        const topIdx = (topY * regionW + topSampleX) * 4
        const botIdx = (botSampleY * regionW + topSampleX) * 4
        const leftIdx = (y * regionW + leftSampleX) * 4
        const rightIdx = (y * regionW + rightSampleX) * 4

        // Bilinear blend: use relX/relY to weight the sides
        // Vertical blend (top vs bottom)
        const vr = original[topIdx] * (1 - relY) + original[botIdx] * relY
        const vg = original[topIdx + 1] * (1 - relY) + original[botIdx + 1] * relY
        const vb = original[topIdx + 2] * (1 - relY) + original[botIdx + 2] * relY

        // Horizontal blend (left vs right)
        const hr = original[leftIdx] * (1 - relX) + original[rightIdx] * relX
        const hg = original[leftIdx + 1] * (1 - relX) + original[rightIdx + 1] * relX
        const hb = original[leftIdx + 2] * (1 - relX) + original[rightIdx + 2] * relY

        // Average vertical and horizontal
        data[idx] = Math.round((vr + hr) / 2)
        data[idx + 1] = Math.round((vg + hg) / 2)
        data[idx + 2] = Math.round((vb + hb) / 2)
      }
    }

    // Step 5: Multi-pass smoothing on the filled area for natural blending
    for (let pass = 0; pass < 3; pass++) {
      ContentAwareFill.smoothPass(data, mask, regionW, regionH)
    }

    // Step 6: Edge feathering - blend boundary pixels with original
    const featherRadius = Math.max(3, Math.min(8, Math.floor(Math.min(maskW, maskH) / 8)))
    ContentAwareFill.featherEdges(data, original, mask, regionW, regionH, featherRadius,
      localMaskLeft, localMaskTop, localMaskRight, localMaskBottom)

    // Step 7: Write result back to canvas
    ctx.putImageData(regionData, regionLeft, regionTop)
    canvas.renderAll()

    // Step 8: Capture the modified region as a FabricImage for undo support
    const resultCanvas = document.createElement('canvas')
    resultCanvas.width = regionW
    resultCanvas.height = regionH
    const resultCtx = resultCanvas.getContext('2d')!
    resultCtx.putImageData(regionData, 0, 0)

    const dataUrl = resultCanvas.toDataURL('image/png')
    const imgEl = new Image()
    imgEl.onload = () => {
      const fImg = new fabric.FabricImage(imgEl, {
        left: (regionLeft - vpt[4]) / vpt[0],
        top: (regionTop - vpt[5]) / vpt[3],
        scaleX: 1 / vpt[0],
        scaleY: 1 / vpt[3],
        selectable: true,
        evented: true,
        name: '内容识别填充',
      })
      canvas.add(fImg)
      canvas.renderAll()

      eventBus.emit('tool:object-created', {
        object: fImg,
        name: '内容识别填充',
      })
    }
    imgEl.src = dataUrl

    ElMessage.success('水印去除完成')
  }

  /** Smooth pass: average each mask pixel with its neighbors */
  private static smoothPass(
    data: Uint8ClampedArray,
    mask: Uint8Array,
    w: number, h: number
  ) {
    const copy = new Uint8ClampedArray(data)

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (mask[y * w + x] !== 1) continue

        let sumR = 0, sumG = 0, sumB = 0, count = 0
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const nx = x + kx
            const ny = y + ky
            if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue
            const nIdx = (ny * w + nx) * 4
            sumR += copy[nIdx]
            sumG += copy[nIdx + 1]
            sumB += copy[nIdx + 2]
            count++
          }
        }

        const idx = (y * w + x) * 4
        data[idx] = Math.round(sumR / count)
        data[idx + 1] = Math.round(sumG / count)
        data[idx + 2] = Math.round(sumB / count)
      }
    }
  }

  /** Feather edges: gradually blend the filled area edges with original content */
  private static featherEdges(
    data: Uint8ClampedArray,
    original: Uint8ClampedArray,
    mask: Uint8Array,
    w: number, h: number,
    radius: number,
    maskLeft: number, maskTop: number, maskRight: number, maskBottom: number
  ) {
    for (let y = maskTop; y < maskBottom; y++) {
      for (let x = maskLeft; x < maskRight; x++) {
        if (mask[y * w + x] !== 1) continue

        // Distance to nearest mask edge
        const distLeft = x - maskLeft
        const distRight = maskRight - 1 - x
        const distTop = y - maskTop
        const distBottom = maskBottom - 1 - y
        const distToEdge = Math.min(distLeft, distRight, distTop, distBottom)

        if (distToEdge < radius) {
          const blend = distToEdge / radius
          const idx = (y * w + x) * 4

          data[idx] = Math.round(data[idx] * blend + original[idx] * (1 - blend))
          data[idx + 1] = Math.round(data[idx + 1] * blend + original[idx + 1] * (1 - blend))
          data[idx + 2] = Math.round(data[idx + 2] * blend + original[idx + 2] * (1 - blend))
        }
      }
    }
  }
}
