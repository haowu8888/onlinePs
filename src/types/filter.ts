export interface FilterConfig {
  id: string
  name: string
  category: 'adjust' | 'blur' | 'stylize' | 'enhance'
  params: FilterParam[]
  factory: (params: Record<string, number>) => any
}

export interface FilterParam {
  key: string
  label: string
  min: number
  max: number
  default: number
  step: number
}

export interface AppliedFilter {
  filterId: string
  params: Record<string, number>
}
