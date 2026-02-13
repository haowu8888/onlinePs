import type { ICommand } from '@/types/history'
import type * as fabric from 'fabric'

export class AddObjectCommand implements ICommand {
  readonly name: string
  readonly timestamp: number
  private canvas: fabric.Canvas
  private object: fabric.FabricObject

  constructor(canvas: fabric.Canvas, object: fabric.FabricObject, name?: string) {
    this.canvas = canvas
    this.object = object
    this.name = name || '添加对象'
    this.timestamp = Date.now()
  }

  execute() {
    this.canvas.add(this.object)
    this.canvas.renderAll()
  }

  undo() {
    this.canvas.remove(this.object)
    this.canvas.renderAll()
  }
}

export class RemoveObjectCommand implements ICommand {
  readonly name: string
  readonly timestamp: number
  private canvas: fabric.Canvas
  private object: fabric.FabricObject

  constructor(canvas: fabric.Canvas, object: fabric.FabricObject) {
    this.canvas = canvas
    this.object = object
    this.name = '删除对象'
    this.timestamp = Date.now()
  }

  execute() {
    this.canvas.remove(this.object)
    this.canvas.renderAll()
  }

  undo() {
    this.canvas.add(this.object)
    this.canvas.renderAll()
  }
}

export class ModifyObjectCommand implements ICommand {
  readonly name: string
  readonly timestamp: number
  private object: fabric.FabricObject
  private canvas: fabric.Canvas
  private oldProps: Record<string, any>
  private newProps: Record<string, any>

  constructor(
    canvas: fabric.Canvas,
    object: fabric.FabricObject,
    oldProps: Record<string, any>,
    newProps: Record<string, any>,
    name?: string
  ) {
    this.canvas = canvas
    this.object = object
    this.oldProps = { ...oldProps }
    this.newProps = { ...newProps }
    this.name = name || '修改对象'
    this.timestamp = Date.now()
  }

  execute() {
    this.object.set(this.newProps)
    this.object.setCoords()
    this.canvas.renderAll()
  }

  undo() {
    this.object.set(this.oldProps)
    this.object.setCoords()
    this.canvas.renderAll()
  }
}

export class FilterCommand implements ICommand {
  readonly name: string
  readonly timestamp: number
  private image: fabric.FabricImage
  private canvas: fabric.Canvas
  private filter: any
  private filterIndex: number = -1

  constructor(canvas: fabric.Canvas, image: fabric.FabricImage, filter: any, name?: string) {
    this.canvas = canvas
    this.image = image
    this.filter = filter
    this.name = name || '应用滤镜'
    this.timestamp = Date.now()
  }

  execute() {
    if (!this.image.filters) this.image.filters = []
    this.image.filters.push(this.filter)
    this.filterIndex = this.image.filters.length - 1
    this.image.applyFilters()
    this.canvas.renderAll()
  }

  undo() {
    if (this.image.filters && this.filterIndex >= 0) {
      this.image.filters.splice(this.filterIndex, 1)
      this.image.applyFilters()
      this.canvas.renderAll()
    }
  }
}
