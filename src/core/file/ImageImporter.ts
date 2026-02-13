import * as fabric from 'fabric'
import { useEditorStore } from '@/stores/useEditorStore'

export class ImageImporter {
  private canvas: fabric.Canvas

  constructor(canvas: fabric.Canvas) {
    this.canvas = canvas
  }

  async importFromFile(file: File): Promise<fabric.FabricImage> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string
        this.importFromDataUrl(dataUrl).then(resolve).catch(reject)
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  async importFromDataUrl(dataUrl: string): Promise<fabric.FabricImage> {
    return new Promise((resolve, reject) => {
      const imgEl = new Image()
      imgEl.onload = () => {
        const fabricImg = new fabric.FabricImage(imgEl)

        // Scale to fit within canvas
        const editorStore = useEditorStore()
        const canvasWidth = editorStore.canvasWidth
        const canvasHeight = editorStore.canvasHeight
        const scale = Math.min(canvasWidth / imgEl.width, canvasHeight / imgEl.height, 1)
        fabricImg.scale(scale)

        this.canvas.add(fabricImg)
        this.canvas.centerObject(fabricImg)
        this.canvas.setActiveObject(fabricImg)
        this.canvas.renderAll()
        resolve(fabricImg)
      }
      imgEl.onerror = reject
      imgEl.src = dataUrl
    })
  }

  async importFromUrl(url: string): Promise<fabric.FabricImage> {
    return this.importFromDataUrl(url)
  }
}
