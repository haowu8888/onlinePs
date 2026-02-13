export interface EditorState {
  documentName: string
  isDirty: boolean
  foregroundColor: string
  backgroundColor: string
  canvasWidth: number
  canvasHeight: number
}

export interface MousePosition {
  x: number
  y: number
}

export interface ViewportState {
  zoom: number
  panX: number
  panY: number
}
