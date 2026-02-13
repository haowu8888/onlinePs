import * as fabric from 'fabric'
import { filterRegistry } from './FilterRegistry'

export class FilterManager {
  private canvas: fabric.Canvas

  constructor(canvas: fabric.Canvas) {
    this.canvas = canvas
  }

  applyFilter(imageObj: fabric.FabricImage, filterId: string, params: Record<string, number>) {
    const config = filterRegistry.get(filterId)
    if (!config) return

    const filter = config.factory(params)
    if (!imageObj.filters) imageObj.filters = []
    imageObj.filters.push(filter)
    imageObj.applyFilters()
    this.canvas.renderAll()
  }

  removeFilter(imageObj: fabric.FabricImage, index: number) {
    if (imageObj.filters && index >= 0 && index < imageObj.filters.length) {
      imageObj.filters.splice(index, 1)
      imageObj.applyFilters()
      this.canvas.renderAll()
    }
  }

  clearFilters(imageObj: fabric.FabricImage) {
    imageObj.filters = []
    imageObj.applyFilters()
    this.canvas.renderAll()
  }

  previewFilter(imageObj: fabric.FabricImage, filterId: string, params: Record<string, number>) {
    const config = filterRegistry.get(filterId)
    if (!config) return

    // Save current filters, apply preview, then restore
    const originalFilters = [...(imageObj.filters || [])]
    const previewFilter = config.factory(params)

    imageObj.filters = [...originalFilters, previewFilter]
    imageObj.applyFilters()
    this.canvas.renderAll()

    // Return restore function
    return () => {
      imageObj.filters = originalFilters
      imageObj.applyFilters()
      this.canvas.renderAll()
    }
  }
}
