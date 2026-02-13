import * as fabric from 'fabric'
import { saveAs } from 'file-saver'

export type ExportFormat = 'png' | 'jpeg' | 'webp'

export interface ExportOptions {
  format: ExportFormat
  quality: number
  multiplier: number
  fileName: string
}

export class ImageExporter {
  private canvas: fabric.Canvas

  constructor(canvas: fabric.Canvas) {
    this.canvas = canvas
  }

  export(options: ExportOptions) {
    const { format, quality, multiplier, fileName } = options

    // Fabric.js toDataURL only supports 'png' and 'jpeg'
    // For WebP, we use canvas.toDataURL directly
    const fabricFormat = format === 'jpeg' ? 'jpeg' : 'png'

    const dataUrl = this.canvas.toDataURL({
      format: fabricFormat,
      quality,
      multiplier,
    })

    if (format === 'webp') {
      // Re-encode as WebP via an offscreen canvas
      const img = new Image()
      img.onload = () => {
        const offscreen = document.createElement('canvas')
        offscreen.width = img.width
        offscreen.height = img.height
        const ctx = offscreen.getContext('2d')!
        ctx.drawImage(img, 0, 0)
        const webpDataUrl = offscreen.toDataURL('image/webp', quality)
        const byteString = atob(webpDataUrl.split(',')[1])
        const ab = new ArrayBuffer(byteString.length)
        const ia = new Uint8Array(ab)
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i)
        }
        const blob = new Blob([ab], { type: 'image/webp' })
        saveAs(blob, `${fileName}.webp`)
      }
      img.src = dataUrl
      return
    }

    // Convert data URL to Blob for png/jpeg
    const byteString = atob(dataUrl.split(',')[1])
    const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png'
    const ab = new ArrayBuffer(byteString.length)
    const ia = new Uint8Array(ab)
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i)
    }
    const blob = new Blob([ab], { type: mimeType })
    const ext = format === 'jpeg' ? 'jpg' : format
    saveAs(blob, `${fileName}.${ext}`)
  }

  getDataUrl(format: ExportFormat = 'png', quality: number = 1): string {
    return this.canvas.toDataURL({
      format: format === 'jpeg' ? 'jpeg' : 'png',
      quality,
      multiplier: 1,
    })
  }

  getBlob(format: ExportFormat = 'png', quality: number = 1): Promise<Blob> {
    return new Promise((resolve) => {
      const dataUrl = this.getDataUrl(format, quality)
      const byteString = atob(dataUrl.split(',')[1])
      const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png'
      const ab = new ArrayBuffer(byteString.length)
      const ia = new Uint8Array(ab)
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i)
      }
      resolve(new Blob([ab], { type: mimeType }))
    })
  }
}
