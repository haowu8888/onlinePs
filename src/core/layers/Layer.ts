import * as fabric from 'fabric'
import type { LayerData } from '@/types/layer'
import { v4 as uuidv4 } from 'uuid'

export class Layer {
  id: string
  name: string
  group: fabric.Group
  visible: boolean
  locked: boolean
  opacity: number
  blendMode: string

  constructor(name: string, canvas: fabric.Canvas) {
    this.id = uuidv4()
    this.name = name
    this.group = new fabric.Group([], {
      selectable: false,
      evented: false,
    })
    this.visible = true
    this.locked = false
    this.opacity = 1
    this.blendMode = 'source-over'
  }

  toData(): LayerData {
    return {
      id: this.id,
      name: this.name,
      visible: this.visible,
      locked: this.locked,
      opacity: this.opacity,
      blendMode: this.blendMode,
      thumbnail: '',
      groupIndex: 0,
      hasMask: false,
      maskEnabled: false,
    }
  }
}
