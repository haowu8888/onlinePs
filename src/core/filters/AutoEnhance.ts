import * as fabric from 'fabric'

/**
 * Auto-enhancement utilities for one-click image improvement.
 */

/** Compute histogram for an ImageData */
function computeHistogram(imageData: ImageData) {
  const data = imageData.data
  const histR = new Uint32Array(256)
  const histG = new Uint32Array(256)
  const histB = new Uint32Array(256)

  for (let i = 0; i < data.length; i += 4) {
    histR[data[i]]++
    histG[data[i + 1]]++
    histB[data[i + 2]]++
  }

  return { histR, histG, histB }
}

/** Find percentile value in a histogram */
function findPercentile(hist: Uint32Array, total: number, percentile: number): number {
  const target = Math.floor(total * percentile)
  let sum = 0
  for (let i = 0; i < 256; i++) {
    sum += hist[i]
    if (sum >= target) return i
  }
  return 255
}

/**
 * Auto Levels: find 1%/99% percentile points as black/white,
 * compute optimal gamma, and remap pixel values.
 */
export function autoLevels(imageData: ImageData): ImageData {
  const data = imageData.data
  const { histR, histG, histB } = computeHistogram(imageData)
  const totalPixels = imageData.width * imageData.height

  // Find 1% and 99% percentile for each channel
  const blackR = findPercentile(histR, totalPixels, 0.01)
  const whiteR = findPercentile(histR, totalPixels, 0.99)
  const blackG = findPercentile(histG, totalPixels, 0.01)
  const whiteG = findPercentile(histG, totalPixels, 0.99)
  const blackB = findPercentile(histB, totalPixels, 0.01)
  const whiteB = findPercentile(histB, totalPixels, 0.99)

  // Build per-channel LUTs
  const lutR = buildLUT(blackR, whiteR)
  const lutG = buildLUT(blackG, whiteG)
  const lutB = buildLUT(blackB, whiteB)

  for (let i = 0; i < data.length; i += 4) {
    data[i] = lutR[data[i]]
    data[i + 1] = lutG[data[i + 1]]
    data[i + 2] = lutB[data[i + 2]]
  }

  return imageData
}

function buildLUT(black: number, white: number): Uint8Array {
  const lut = new Uint8Array(256)
  const range = Math.max(1, white - black)
  // Auto gamma: if midpoint is low, increase gamma (brighten), otherwise decrease
  const midpoint = (black + white) / 2
  const gamma = midpoint < 128 ? 0.8 + (128 - midpoint) / 256 : 1.0
  const invGamma = 1 / gamma

  for (let i = 0; i < 256; i++) {
    const normalized = Math.max(0, Math.min(1, (i - black) / range))
    const corrected = Math.pow(normalized, invGamma)
    lut[i] = Math.round(corrected * 255)
  }
  return lut
}

/**
 * Auto Contrast: stretch histogram to full 0-255 range.
 */
export function autoContrast(imageData: ImageData): ImageData {
  const data = imageData.data
  const { histR, histG, histB } = computeHistogram(imageData)
  const totalPixels = imageData.width * imageData.height

  // Find 0.5% and 99.5% percentile using luminance
  const histLum = new Uint32Array(256)
  for (let i = 0; i < data.length; i += 4) {
    const lum = Math.round(data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114)
    histLum[lum]++
  }

  const low = findPercentile(histLum, totalPixels, 0.005)
  const high = findPercentile(histLum, totalPixels, 0.995)

  if (high <= low) return imageData

  const range = high - low
  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.max(0, Math.min(255, Math.round((data[i] - low) / range * 255)))
    data[i + 1] = Math.max(0, Math.min(255, Math.round((data[i + 1] - low) / range * 255)))
    data[i + 2] = Math.max(0, Math.min(255, Math.round((data[i + 2] - low) / range * 255)))
  }

  return imageData
}

/**
 * Auto Enhance: combines autoLevels + vibrance + sharpening
 * for a one-click improvement effect.
 */
export function autoEnhance(imageData: ImageData): ImageData {
  // Step 1: Auto levels
  autoLevels(imageData)

  // Step 2: Vibrance boost (increase saturation of less-saturated colors)
  applyVibrance(imageData, 0.3)

  // Step 3: Mild sharpen
  applySharpen(imageData)

  return imageData
}

function applyVibrance(imageData: ImageData, amount: number) {
  const data = imageData.data

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const sat = max === 0 ? 0 : (max - min) / max

    // Boost less-saturated pixels more
    const boost = amount * (1 - sat)
    const avg = (r + g + b) / 3

    data[i] = Math.max(0, Math.min(255, Math.round(r + (r - avg) * boost)))
    data[i + 1] = Math.max(0, Math.min(255, Math.round(g + (g - avg) * boost)))
    data[i + 2] = Math.max(0, Math.min(255, Math.round(b + (b - avg) * boost)))
  }
}

function applySharpen(imageData: ImageData) {
  const { data, width, height } = imageData
  const original = new Uint8ClampedArray(data)

  // Sharpen kernel: [0,-1,0, -1,5,-1, 0,-1,0]
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4

      for (let c = 0; c < 3; c++) {
        const center = original[idx + c] * 5
        const top = original[((y - 1) * width + x) * 4 + c]
        const bottom = original[((y + 1) * width + x) * 4 + c]
        const left = original[(y * width + (x - 1)) * 4 + c]
        const right = original[(y * width + (x + 1)) * 4 + c]

        // Blend 50% sharpen to keep it mild
        const sharpened = center - top - bottom - left - right
        data[idx + c] = Math.max(0, Math.min(255,
          Math.round(original[idx + c] + (sharpened - original[idx + c]) * 0.5)
        ))
      }
    }
  }
}

/**
 * Apply auto-enhancement to a FabricImage object on the given canvas.
 */
export function applyAutoEffect(
  canvas: fabric.Canvas,
  imageObj: fabric.FabricImage,
  effect: 'auto-levels' | 'auto-contrast' | 'auto-enhance'
) {
  const el = imageObj.getElement() as HTMLImageElement | HTMLCanvasElement
  const tempCanvas = document.createElement('canvas')
  const w = (el as HTMLImageElement).naturalWidth || el.width
  const h = (el as HTMLImageElement).naturalHeight || el.height
  tempCanvas.width = w
  tempCanvas.height = h
  const ctx = tempCanvas.getContext('2d')!
  ctx.drawImage(el, 0, 0)

  const imgData = ctx.getImageData(0, 0, w, h)

  switch (effect) {
    case 'auto-levels':
      autoLevels(imgData)
      break
    case 'auto-contrast':
      autoContrast(imgData)
      break
    case 'auto-enhance':
      autoEnhance(imgData)
      break
  }

  ctx.putImageData(imgData, 0, 0)

  const newImgEl = new Image()
  newImgEl.onload = () => {
    imageObj.setElement(newImgEl)
    imageObj.applyFilters()
    canvas.renderAll()
  }
  newImgEl.src = tempCanvas.toDataURL('image/png')
}
