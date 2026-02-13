import mitt from 'mitt'

export type CanvasEvents = {
  'object:added': any
  'object:modified': any
  'object:removed': any
  'selection:created': any
  'selection:updated': any
  'selection:cleared': any
  'mouse:down': any
  'mouse:move': any
  'mouse:up': any
  'zoom:changed': number
  'pan:changed': { x: number; y: number }
  'tool:changed': string
  'layer:changed': string
  'history:changed': void
  'canvas:rendered': void
  'tool:object-created': { object: any; name: string; layerName?: string }
  'tool:path-created': { path: any }
  'dialog:new-canvas': void
  'dialog:export': void
  'dialog:canvas-size': void
}

const eventBus = mitt<CanvasEvents>()

export default eventBus
