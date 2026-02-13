export class MarchingAnts {
  private canvas: HTMLCanvasElement | null = null
  private ctx: CanvasRenderingContext2D | null = null
  private animationId: number | null = null
  private dashOffset = 0
  private path: Path2D | null = null
  private savedImageData: ImageData | null = null

  start(canvas: HTMLCanvasElement, path: Path2D) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.path = path
    // Save the canvas state before drawing ants
    if (this.ctx) {
      this.savedImageData = this.ctx.getImageData(0, 0, canvas.width, canvas.height)
    }
    this.animate()
  }

  stop() {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId)
      this.animationId = null
    }
    // Restore the canvas state
    if (this.ctx && this.savedImageData) {
      this.ctx.putImageData(this.savedImageData, 0, 0)
      this.savedImageData = null
    }
  }

  private animate() {
    if (!this.ctx || !this.path || !this.canvas) return

    // Restore previous state before drawing new frame
    if (this.savedImageData) {
      this.ctx.putImageData(this.savedImageData, 0, 0)
    }

    this.dashOffset -= 0.5
    this.ctx.save()
    this.ctx.setLineDash([4, 4])
    this.ctx.lineDashOffset = this.dashOffset
    this.ctx.strokeStyle = '#000000'
    this.ctx.lineWidth = 1
    this.ctx.stroke(this.path)
    this.ctx.setLineDash([4, 4])
    this.ctx.lineDashOffset = this.dashOffset + 4
    this.ctx.strokeStyle = '#ffffff'
    this.ctx.stroke(this.path)
    this.ctx.restore()

    this.animationId = requestAnimationFrame(() => this.animate())
  }
}
