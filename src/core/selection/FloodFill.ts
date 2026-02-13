export class FloodFill {
  static fill(
    imageData: ImageData,
    startX: number,
    startY: number,
    tolerance: number = 30
  ): boolean[][] {
    const { width, height, data } = imageData
    const mask: boolean[][] = Array.from({ length: height }, () =>
      Array(width).fill(false)
    )

    if (startX < 0 || startX >= width || startY < 0 || startY >= height) {
      return mask
    }

    const startIdx = (startY * width + startX) * 4
    const targetR = data[startIdx]
    const targetG = data[startIdx + 1]
    const targetB = data[startIdx + 2]
    const targetA = data[startIdx + 3]

    const stack: [number, number][] = [[startX, startY]]
    const visited = new Set<number>()

    while (stack.length > 0) {
      const [x, y] = stack.pop()!
      const key = y * width + x

      if (x < 0 || x >= width || y < 0 || y >= height) continue
      if (visited.has(key)) continue
      visited.add(key)

      const idx = key * 4
      const dr = Math.abs(data[idx] - targetR)
      const dg = Math.abs(data[idx + 1] - targetG)
      const db = Math.abs(data[idx + 2] - targetB)
      const da = Math.abs(data[idx + 3] - targetA)

      if ((dr + dg + db + da) / 4 <= tolerance) {
        mask[y][x] = true
        stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1])
      }
    }

    return mask
  }

  static maskToBounds(mask: boolean[][], width: number, height: number) {
    let minX = width, minY = height, maxX = 0, maxY = 0
    let count = 0

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (mask[y][x]) {
          minX = Math.min(minX, x)
          minY = Math.min(minY, y)
          maxX = Math.max(maxX, x)
          maxY = Math.max(maxY, y)
          count++
        }
      }
    }

    if (count === 0) return null

    return { minX, minY, maxX, maxY, width: maxX - minX + 1, height: maxY - minY + 1, count }
  }
}
