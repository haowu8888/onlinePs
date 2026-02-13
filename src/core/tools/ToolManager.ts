import type * as fabric from 'fabric'
import { BaseTool } from './BaseTool'
import eventBus from '../canvas/CanvasEventBus'

export class ToolManager {
  private tools = new Map<string, BaseTool>()
  private currentTool: BaseTool | null = null
  private canvas: fabric.Canvas | null = null

  register(tool: BaseTool) {
    this.tools.set(tool.id, tool)
  }

  setCanvas(canvas: fabric.Canvas) {
    this.canvas = canvas
    this.tools.forEach(tool => tool.setCanvas(canvas))
    this.setupCanvasEvents()
  }

  switchTool(toolId: string) {
    if (this.currentTool) {
      this.currentTool.deactivate()
    }

    const tool = this.tools.get(toolId)
    if (tool) {
      this.currentTool = tool
      tool.activate()
      eventBus.emit('tool:changed', toolId)
    }
  }

  getCurrentTool(): BaseTool | null {
    return this.currentTool
  }

  getTool(toolId: string): BaseTool | undefined {
    return this.tools.get(toolId)
  }

  private setupCanvasEvents() {
    if (!this.canvas) return

    this.canvas.on('mouse:down', (e) => {
      this.currentTool?.onMouseDown(e)
    })

    this.canvas.on('mouse:move', (e) => {
      this.currentTool?.onMouseMove(e)
    })

    this.canvas.on('mouse:up', (e) => {
      this.currentTool?.onMouseUp(e)
    })
  }

  dispose() {
    this.tools.forEach(tool => tool.deactivate())
    this.tools.clear()
    this.currentTool = null
  }
}

export const toolManager = new ToolManager()
