import * as fabric from 'fabric'
import eventBus from '../canvas/CanvasEventBus'

/**
 * Convert a fabric selection object (__selection) to a canvas 2D Path2D,
 * transforming scene coordinates to screen (pixel) coordinates via the viewport transform.
 */
function selectionToClipPath(selObj: fabric.FabricObject, vpt: number[]): Path2D {
  const path = new Path2D()

  if (selObj instanceof fabric.Rect) {
    const left = selObj.left ?? 0
    const top = selObj.top ?? 0
    const w = (selObj.width ?? 0) * (selObj.scaleX ?? 1)
    const h = (selObj.height ?? 0) * (selObj.scaleY ?? 1)
    const sx = left * vpt[0] + vpt[4]
    const sy = top * vpt[3] + vpt[5]
    const sw = w * vpt[0]
    const sh = h * vpt[3]
    path.rect(sx, sy, sw, sh)
  } else if (selObj instanceof fabric.Ellipse) {
    const left = selObj.left ?? 0
    const top = selObj.top ?? 0
    const rx = (selObj.rx ?? 0) * (selObj.scaleX ?? 1)
    const ry = (selObj.ry ?? 0) * (selObj.scaleY ?? 1)
    const cx = (left + rx) * vpt[0] + vpt[4]
    const cy = (top + ry) * vpt[3] + vpt[5]
    const srx = rx * vpt[0]
    const sry = ry * vpt[3]
    path.ellipse(cx, cy, Math.abs(srx), Math.abs(sry), 0, 0, Math.PI * 2)
  } else if (selObj instanceof fabric.Path) {
    const pathData = (selObj as any).path as any[]
    if (!pathData) return path

    const offsetX = selObj.pathOffset?.x ?? 0
    const offsetY = selObj.pathOffset?.y ?? 0
    const objLeft = selObj.left ?? 0
    const objTop = selObj.top ?? 0
    const scaleX = selObj.scaleX ?? 1
    const scaleY = selObj.scaleY ?? 1

    for (const cmd of pathData) {
      const type = cmd[0] as string
      switch (type) {
        case 'M': {
          const sx = ((cmd[1] - offsetX) * scaleX + objLeft) * vpt[0] + vpt[4]
          const sy = ((cmd[2] - offsetY) * scaleY + objTop) * vpt[3] + vpt[5]
          path.moveTo(sx, sy)
          break
        }
        case 'L': {
          const sx = ((cmd[1] - offsetX) * scaleX + objLeft) * vpt[0] + vpt[4]
          const sy = ((cmd[2] - offsetY) * scaleY + objTop) * vpt[3] + vpt[5]
          path.lineTo(sx, sy)
          break
        }
        case 'C': {
          const sx1 = ((cmd[1] - offsetX) * scaleX + objLeft) * vpt[0] + vpt[4]
          const sy1 = ((cmd[2] - offsetY) * scaleY + objTop) * vpt[3] + vpt[5]
          const sx2 = ((cmd[3] - offsetX) * scaleX + objLeft) * vpt[0] + vpt[4]
          const sy2 = ((cmd[4] - offsetY) * scaleY + objTop) * vpt[3] + vpt[5]
          const sx = ((cmd[5] - offsetX) * scaleX + objLeft) * vpt[0] + vpt[4]
          const sy = ((cmd[6] - offsetY) * scaleY + objTop) * vpt[3] + vpt[5]
          path.bezierCurveTo(sx1, sy1, sx2, sy2, sx, sy)
          break
        }
        case 'Q': {
          const sx1 = ((cmd[1] - offsetX) * scaleX + objLeft) * vpt[0] + vpt[4]
          const sy1 = ((cmd[2] - offsetY) * scaleY + objTop) * vpt[3] + vpt[5]
          const sx = ((cmd[3] - offsetX) * scaleX + objLeft) * vpt[0] + vpt[4]
          const sy = ((cmd[4] - offsetY) * scaleY + objTop) * vpt[3] + vpt[5]
          path.quadraticCurveTo(sx1, sy1, sx, sy)
          break
        }
        case 'Z':
        case 'z':
          path.closePath()
          break
      }
    }
  }

  return path
}

/**
 * Get the screen-space bounding box of a selection object.
 */
function getSelectionScreenBounds(selObj: fabric.FabricObject, vpt: number[], canvasW: number, canvasH: number) {
  const left = selObj.left ?? 0
  const top = selObj.top ?? 0
  const w = (selObj.width ?? 0) * (selObj.scaleX ?? 1)
  const h = (selObj.height ?? 0) * (selObj.scaleY ?? 1)

  const screenLeft = Math.round(left * vpt[0] + vpt[4])
  const screenTop = Math.round(top * vpt[3] + vpt[5])
  const screenRight = Math.round((left + w) * vpt[0] + vpt[4])
  const screenBottom = Math.round((top + h) * vpt[3] + vpt[5])

  return {
    left: Math.max(0, Math.min(canvasW, screenLeft)),
    top: Math.max(0, Math.min(canvasH, screenTop)),
    right: Math.max(0, Math.min(canvasW, screenRight)),
    bottom: Math.max(0, Math.min(canvasH, screenBottom)),
  }
}

/**
 * Delete (fill with background color) inside the selection area.
 * The selection overlay is preserved after deletion (PS behavior).
 */
export function deleteInSelection(canvas: fabric.Canvas, bgColor: string) {
  const selObj = canvas.getObjects().find((o: any) => o.name === '__selection')
  if (!selObj) return

  const vpt = canvas.viewportTransform!
  const canvasW = canvas.getWidth()
  const canvasH = canvas.getHeight()

  const clipPath = selectionToClipPath(selObj, vpt)
  const bounds = getSelectionScreenBounds(selObj, vpt, canvasW, canvasH)
  const regionW = bounds.right - bounds.left
  const regionH = bounds.bottom - bounds.top
  if (regionW < 1 || regionH < 1) return

  // Temporarily remove selection overlay to read clean pixels
  canvas.remove(selObj)
  canvas.renderAll()

  const ctx = canvas.getContext()

  // Fill the clipped region with background color
  ctx.save()
  ctx.clip(clipPath)
  ctx.fillStyle = bgColor
  ctx.fillRect(bounds.left, bounds.top, regionW, regionH)
  ctx.restore()

  // Read the modified region for undo support
  const regionData = ctx.getImageData(bounds.left, bounds.top, regionW, regionH)

  // Re-add selection overlay (PS behavior: selection preserved after delete)
  canvas.add(selObj)
  canvas.renderAll()

  // Create FabricImage for undo support
  const resultCanvas = document.createElement('canvas')
  resultCanvas.width = regionW
  resultCanvas.height = regionH
  const resultCtx = resultCanvas.getContext('2d')!
  resultCtx.putImageData(regionData, 0, 0)

  const dataUrl = resultCanvas.toDataURL('image/png')
  const imgEl = new Image()
  imgEl.onload = () => {
    const fImg = new fabric.FabricImage(imgEl, {
      left: (bounds.left - vpt[4]) / vpt[0],
      top: (bounds.top - vpt[5]) / vpt[3],
      scaleX: 1 / vpt[0],
      scaleY: 1 / vpt[3],
      selectable: true,
      evented: true,
      name: '选区删除',
    })
    canvas.add(fImg)
    canvas.renderAll()

    eventBus.emit('tool:object-created', {
      object: fImg,
      name: '选区删除',
    })
  }
  imgEl.src = dataUrl
}

/**
 * Copy the content inside the selection to the internal clipboard.
 * Stores pixel data + position info in window.__selectionClipboard.
 */
export function copyFromSelection(canvas: fabric.Canvas) {
  const selObj = canvas.getObjects().find((o: any) => o.name === '__selection')
  if (!selObj) return

  const vpt = canvas.viewportTransform!
  const canvasW = canvas.getWidth()
  const canvasH = canvas.getHeight()

  const clipPath = selectionToClipPath(selObj, vpt)
  const bounds = getSelectionScreenBounds(selObj, vpt, canvasW, canvasH)
  const regionW = bounds.right - bounds.left
  const regionH = bounds.bottom - bounds.top
  if (regionW < 1 || regionH < 1) return

  // Temporarily hide selection to capture clean pixels
  canvas.remove(selObj)
  canvas.renderAll()

  const ctx = canvas.getContext()
  const sourceData = ctx.getImageData(bounds.left, bounds.top, regionW, regionH)

  // Re-add selection overlay
  canvas.add(selObj)
  canvas.renderAll()

  // Create temp canvas with only the clipped region
  const tempCanvas = document.createElement('canvas')
  tempCanvas.width = regionW
  tempCanvas.height = regionH
  const tempCtx = tempCanvas.getContext('2d')!

  // Draw source pixels
  tempCtx.putImageData(sourceData, 0, 0)

  // Create another canvas to apply clip mask
  const clipCanvas = document.createElement('canvas')
  clipCanvas.width = regionW
  clipCanvas.height = regionH
  const clipCtx = clipCanvas.getContext('2d')!

  // Translate the clip path so it's relative to the region
  clipCtx.save()
  clipCtx.translate(-bounds.left, -bounds.top)
  clipCtx.clip(clipPath)
  clipCtx.translate(bounds.left, bounds.top)
  clipCtx.drawImage(tempCanvas, 0, 0)
  clipCtx.restore()

  const clippedData = clipCtx.getImageData(0, 0, regionW, regionH)

  ;(window as any).__selectionClipboard = {
    imageData: clippedData,
    width: regionW,
    height: regionH,
    // Scene coordinates for paste positioning
    sceneLeft: (bounds.left - vpt[4]) / vpt[0],
    sceneTop: (bounds.top - vpt[5]) / vpt[3],
    sceneWidth: regionW / vpt[0],
    sceneHeight: regionH / vpt[3],
  }
}

/**
 * Extract (cut) the selection: copy content to clipboard + fill original with bgColor.
 */
export function extractSelection(canvas: fabric.Canvas, bgColor: string) {
  copyFromSelection(canvas)
  deleteInSelection(canvas, bgColor)
}

/**
 * Paste content from the selection clipboard as a new FabricImage object.
 */
export function pasteSelectionClipboard(canvas: fabric.Canvas) {
  const clip = (window as any).__selectionClipboard
  if (!clip) return

  const tempCanvas = document.createElement('canvas')
  tempCanvas.width = clip.width
  tempCanvas.height = clip.height
  const tempCtx = tempCanvas.getContext('2d')!
  tempCtx.putImageData(clip.imageData, 0, 0)

  const dataUrl = tempCanvas.toDataURL('image/png')
  const imgEl = new Image()
  imgEl.onload = () => {
    const vpt = canvas.viewportTransform!
    const fImg = new fabric.FabricImage(imgEl, {
      left: clip.sceneLeft + 10,
      top: clip.sceneTop + 10,
      scaleX: 1 / vpt[0],
      scaleY: 1 / vpt[3],
      selectable: true,
      evented: true,
      name: '选区粘贴',
    })
    canvas.add(fImg)
    canvas.setActiveObject(fImg)
    canvas.renderAll()

    eventBus.emit('tool:object-created', {
      object: fImg,
      name: '选区粘贴',
    })
  }
  imgEl.src = dataUrl
}
