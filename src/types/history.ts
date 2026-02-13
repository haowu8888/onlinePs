export interface ICommand {
  readonly name: string
  readonly timestamp: number
  execute(): void
  undo(): void
}

export interface HistoryEntry {
  id: string
  name: string
  timestamp: number
  command: ICommand
}
