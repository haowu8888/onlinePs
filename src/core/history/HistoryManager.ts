import type { ICommand } from '@/types/history'
import eventBus from '../canvas/CanvasEventBus'

export class HistoryManager {
  private undoStack: ICommand[] = []
  private redoStack: ICommand[] = []
  private maxHistory = 50

  execute(command: ICommand) {
    command.execute()
    this.undoStack.push(command)
    if (this.undoStack.length > this.maxHistory) {
      this.undoStack.shift()
    }
    this.redoStack = []
    eventBus.emit('history:changed')
  }

  undo(): boolean {
    const command = this.undoStack.pop()
    if (!command) return false
    command.undo()
    this.redoStack.push(command)
    eventBus.emit('history:changed')
    return true
  }

  redo(): boolean {
    const command = this.redoStack.pop()
    if (!command) return false
    command.execute()
    this.undoStack.push(command)
    eventBus.emit('history:changed')
    return true
  }

  canUndo(): boolean {
    return this.undoStack.length > 0
  }

  canRedo(): boolean {
    return this.redoStack.length > 0
  }

  getUndoStack(): ICommand[] {
    return [...this.undoStack]
  }

  getRedoStack(): ICommand[] {
    return [...this.redoStack]
  }

  clear() {
    this.undoStack = []
    this.redoStack = []
    eventBus.emit('history:changed')
  }
}
