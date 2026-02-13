import * as fabric from 'fabric'

export interface ColorBalanceOwnProps {
  shadowR: number
  shadowG: number
  shadowB: number
  midtoneR: number
  midtoneG: number
  midtoneB: number
  highlightR: number
  highlightG: number
  highlightB: number
}

const colorBalanceDefaultValues: Record<string, unknown> = {
  shadowR: 0, shadowG: 0, shadowB: 0,
  midtoneR: 0, midtoneG: 0, midtoneB: 0,
  highlightR: 0, highlightG: 0, highlightB: 0,
}

export class ColorBalanceFilter extends fabric.filters.BaseFilter<'ColorBalance', ColorBalanceOwnProps> {
  static type = 'ColorBalance'

  declare shadowR: number
  declare shadowG: number
  declare shadowB: number
  declare midtoneR: number
  declare midtoneG: number
  declare midtoneB: number
  declare highlightR: number
  declare highlightG: number
  declare highlightB: number

  static defaults = colorBalanceDefaultValues

  constructor(options?: Partial<ColorBalanceOwnProps>) {
    super(options)
    Object.assign(this, colorBalanceDefaultValues, options)
  }

  applyTo2d({ imageData }: { imageData: ImageData }) {
    const data = imageData.data

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]

      // Calculate luminance for weight distribution
      const lum = (r * 0.299 + g * 0.587 + b * 0.114) / 255

      // Shadow weight: strongest at dark, fades toward midtones
      const shadowWeight = Math.max(0, 1 - lum * 4)
      // Midtone weight: bell curve peaking at 0.5
      const midtoneWeight = 1 - Math.abs(lum - 0.5) * 2
      // Highlight weight: strongest at bright, fades toward midtones
      const highlightWeight = Math.max(0, lum * 4 - 3)

      data[i] = Math.max(0, Math.min(255,
        r + this.shadowR * shadowWeight * 0.01 * 255
          + this.midtoneR * midtoneWeight * 0.01 * 255
          + this.highlightR * highlightWeight * 0.01 * 255
      ))
      data[i + 1] = Math.max(0, Math.min(255,
        g + this.shadowG * shadowWeight * 0.01 * 255
          + this.midtoneG * midtoneWeight * 0.01 * 255
          + this.highlightG * highlightWeight * 0.01 * 255
      ))
      data[i + 2] = Math.max(0, Math.min(255,
        b + this.shadowB * shadowWeight * 0.01 * 255
          + this.midtoneB * midtoneWeight * 0.01 * 255
          + this.highlightB * highlightWeight * 0.01 * 255
      ))
    }
  }
}

fabric.classRegistry.setClass(ColorBalanceFilter, 'filters.ColorBalance')
