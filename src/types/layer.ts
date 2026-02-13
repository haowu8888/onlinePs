export interface LayerData {
  id: string
  name: string
  visible: boolean
  locked: boolean
  opacity: number
  blendMode: string
  thumbnail: string
  groupIndex: number
  hasMask: boolean
  maskEnabled: boolean
}

export type BlendMode =
  | 'source-over'
  | 'multiply'
  | 'screen'
  | 'overlay'
  | 'darken'
  | 'lighten'
  | 'color-dodge'
  | 'color-burn'
  | 'hard-light'
  | 'soft-light'
  | 'difference'
  | 'exclusion'
  | 'hue'
  | 'saturation'
  | 'color'
  | 'luminosity'
