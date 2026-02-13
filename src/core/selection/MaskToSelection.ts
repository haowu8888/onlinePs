import * as fabric from 'fabric'

/**
 * Shared function to create a selection path from a binary mask.
 * Extracted from MagicWandTool for reuse by Quick Mask and other features.
 */
export function createSelectionFromMask(
  canvas: fabric.Canvas,
  mask: Uint8Array,
  width: number,
  height: number,
  vpt: number[]
): fabric.Path | null {
  // Find bounding box of the selected region
  let minX = width, minY = height, maxX = 0, maxY = 0
  let hasSelection = false
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (mask[y * width + x]) {
        hasSelection = true
        if (x < minX) minX = x
        if (y < minY) minY = y
        if (x > maxX) maxX = x
        if (y > maxY) maxY = y
      }
    }
  }

  if (!hasSelection) return null

  // Trace contour by scanning each row for leftmost and rightmost edges
  const rangeH = maxY - minY
  const step = Math.max(1, Math.floor(rangeH / 300))

  const leftEdge: number[] = []
  const rightEdge: number[] = []

  for (let y = minY; y <= maxY; y += step) {
    let foundLeft = -1
    let foundRight = -1
    for (let x = minX; x <= maxX; x++) {
      if (mask[y * width + x]) {
        if (foundLeft === -1) foundLeft = x
        foundRight = x
      }
    }
    if (foundLeft !== -1) {
      leftEdge.push(foundLeft, y)
      rightEdge.push(foundRight, y)
    }
  }

  // Ensure last row is included
  if (leftEdge.length >= 2 && leftEdge[leftEdge.length - 1] !== maxY) {
    let foundLeft = -1
    let foundRight = -1
    for (let x = minX; x <= maxX; x++) {
      if (mask[maxY * width + x]) {
        if (foundLeft === -1) foundLeft = x
        foundRight = x
      }
    }
    if (foundLeft !== -1) {
      leftEdge.push(foundLeft, maxY)
      rightEdge.push(foundRight, maxY)
    }
  }

  if (leftEdge.length < 4) return null

  // Build SVG path: left edge top-to-bottom, then right edge bottom-to-top
  let pathData = ''
  for (let i = 0; i < leftEdge.length; i += 2) {
    const sx = (leftEdge[i] - vpt[4]) / vpt[0]
    const sy = (leftEdge[i + 1] - vpt[5]) / vpt[3]
    pathData += i === 0 ? `M ${sx} ${sy}` : ` L ${sx} ${sy}`
  }
  for (let i = rightEdge.length - 2; i >= 0; i -= 2) {
    const sx = (rightEdge[i] - vpt[4]) / vpt[0]
    const sy = (rightEdge[i + 1] - vpt[5]) / vpt[3]
    pathData += ` L ${sx} ${sy}`
  }
  pathData += ' Z'

  const selectionPath = new fabric.Path(pathData, {
    fill: 'rgba(0,120,212,0.1)',
    stroke: '#0078d4',
    strokeWidth: 1,
    strokeDashArray: [4, 4],
    selectable: false,
    evented: false,
    name: '__selection',
  })

  canvas.add(selectionPath)
  canvas.renderAll()

  return selectionPath
}
