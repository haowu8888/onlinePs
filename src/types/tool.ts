export interface ToolConfig {
  id: string
  name: string
  icon: string
  shortcut: string
  cursor?: string
  options?: Record<string, any>
}

export interface BrushToolOptions {
  size: number
  opacity: number
  hardness: number
  color: string
}

export interface ShapeToolOptions {
  shapeType: 'rect' | 'ellipse' | 'line' | 'polygon' | 'triangle'
  fill: string
  stroke: string
  strokeWidth: number
  fillEnabled: boolean
}

export interface TextToolOptions {
  fontFamily: string
  fontSize: number
  fontWeight: string
  fontStyle: string
  textAlign: string
  color: string
  underline: boolean
  linethrough: boolean
}

export interface EraserToolOptions {
  size: number
  opacity: number
  hardness: number
}

export interface CropToolOptions {
  aspectRatio: string | null
  width: number
  height: number
}

export interface TransformToolOptions {
  mode: 'free' | 'rotate' | 'scale' | 'skew'
}

export interface GradientToolOptions {
  type: 'linear' | 'radial'
  colorStops: Array<{ offset: number; color: string }>
}

export interface CloneStampOptions {
  size: number
  opacity: number
  sourceSet: boolean
  sourceX: number
  sourceY: number
}

export interface MagicWandToolOptions {
  tolerance: number
}

export interface PenToolOptions {
  strokeColor: string
  strokeWidth: number
  fillColor: string
  fillEnabled: boolean
}

export interface BlurBrushToolOptions {
  size: number
  strength: number
}

export interface DodgeBurnToolOptions {
  mode: 'dodge' | 'burn'
  range: 'shadows' | 'midtones' | 'highlights'
  size: number
  exposure: number
}
