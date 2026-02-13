import * as fabric from 'fabric'

export interface VignetteOwnProps {
  vignetteStrength: number
  vignetteSize: number
}

const vignetteDefaultValues: Record<string, unknown> = {
  vignetteStrength: 0.5,
  vignetteSize: 0.5,
}

export class VignetteFilter extends fabric.filters.BaseFilter<'Vignette', VignetteOwnProps> {
  static type = 'Vignette'

  declare vignetteStrength: number
  declare vignetteSize: number

  static defaults = vignetteDefaultValues

  constructor(options?: Partial<VignetteOwnProps>) {
    super(options)
    Object.assign(this, vignetteDefaultValues, options)
  }

  applyTo2d({ imageData }: { imageData: ImageData }) {
    const { data, width, height } = imageData
    const strength = Math.max(0, Math.min(1, this.vignetteStrength))
    const size = Math.max(0, Math.min(1, this.vignetteSize))

    if (strength === 0) return

    const cx = width / 2
    const cy = height / 2
    const maxDist = Math.sqrt(cx * cx + cy * cy)
    // Size controls where the darkening starts (0 = from center, 1 = from edges)
    const startRadius = size * maxDist

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const dx = x - cx
        const dy = y - cy
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist > startRadius) {
          // Calculate falloff factor
          const falloff = (dist - startRadius) / (maxDist - startRadius)
          const factor = 1 - strength * falloff * falloff

          const idx = (y * width + x) * 4
          data[idx] = Math.round(data[idx] * factor)
          data[idx + 1] = Math.round(data[idx + 1] * factor)
          data[idx + 2] = Math.round(data[idx + 2] * factor)
        }
      }
    }
  }
}

fabric.classRegistry.setClass(VignetteFilter, 'filters.Vignette')
