import * as fabric from 'fabric'

export interface LevelsOwnProps {
  blackPoint: number
  whitePoint: number
  gamma: number
}

const levelsDefaultValues: Record<string, unknown> = {
  blackPoint: 0,
  whitePoint: 255,
  gamma: 1,
}

export class LevelsFilter extends fabric.filters.BaseFilter<'Levels', LevelsOwnProps> {
  static type = 'Levels'

  declare blackPoint: number
  declare whitePoint: number
  declare gamma: number

  static defaults = levelsDefaultValues

  constructor(options?: Partial<LevelsOwnProps>) {
    super(options)
    Object.assign(this, levelsDefaultValues, options)
  }

  applyTo2d({ imageData }: { imageData: ImageData }) {
    const data = imageData.data
    const bp = Math.max(0, Math.min(255, this.blackPoint))
    const wp = Math.max(bp + 1, Math.min(255, this.whitePoint))
    const gamma = Math.max(0.1, Math.min(10, this.gamma))
    const invGamma = 1 / gamma

    // Build 256-entry LUT
    const lut = new Uint8Array(256)
    const range = wp - bp
    for (let i = 0; i < 256; i++) {
      // Clamp to black/white points
      const clamped = Math.max(0, Math.min(1, (i - bp) / range))
      // Apply gamma correction
      const corrected = Math.pow(clamped, invGamma)
      lut[i] = Math.round(corrected * 255)
    }

    for (let i = 0; i < data.length; i += 4) {
      data[i] = lut[data[i]]
      data[i + 1] = lut[data[i + 1]]
      data[i + 2] = lut[data[i + 2]]
    }
  }
}

fabric.classRegistry.setClass(LevelsFilter, 'filters.Levels')
