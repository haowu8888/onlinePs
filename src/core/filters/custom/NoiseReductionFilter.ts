import * as fabric from 'fabric'

export interface NoiseReductionOwnProps {
  strength: number
}

const noiseReductionDefaultValues: Record<string, unknown> = {
  strength: 0.5,
}

export class NoiseReductionFilter extends fabric.filters.BaseFilter<'NoiseReduction', NoiseReductionOwnProps> {
  static type = 'NoiseReduction'

  declare strength: number

  static defaults = noiseReductionDefaultValues

  constructor(options?: Partial<NoiseReductionOwnProps>) {
    super(options)
    Object.assign(this, noiseReductionDefaultValues, options)
  }

  applyTo2d({ imageData }: { imageData: ImageData }) {
    const { data, width, height } = imageData
    const strength = Math.max(0, Math.min(1, this.strength))
    if (strength === 0) return

    // Color difference threshold: higher strength = more aggressive smoothing
    const threshold = strength * 80

    // Copy original data
    const original = new Uint8ClampedArray(data)
    const radius = 2 // 5x5 neighborhood

    for (let y = radius; y < height - radius; y++) {
      for (let x = radius; x < width - radius; x++) {
        const idx = (y * width + x) * 4
        const cr = original[idx]
        const cg = original[idx + 1]
        const cb = original[idx + 2]

        let sumR = 0, sumG = 0, sumB = 0, count = 0

        // Sample 5x5 neighborhood
        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            const nIdx = ((y + dy) * width + (x + dx)) * 4
            const nr = original[nIdx]
            const ng = original[nIdx + 1]
            const nb = original[nIdx + 2]

            // Only average pixels with similar color (bilateral filter approximation)
            const diff = Math.abs(nr - cr) + Math.abs(ng - cg) + Math.abs(nb - cb)
            if (diff < threshold) {
              sumR += nr
              sumG += ng
              sumB += nb
              count++
            }
          }
        }

        if (count > 0) {
          // Blend between original and filtered based on strength
          data[idx] = Math.round(cr + (sumR / count - cr) * strength)
          data[idx + 1] = Math.round(cg + (sumG / count - cg) * strength)
          data[idx + 2] = Math.round(cb + (sumB / count - cb) * strength)
        }
      }
    }
  }
}

fabric.classRegistry.setClass(NoiseReductionFilter, 'filters.NoiseReduction')
