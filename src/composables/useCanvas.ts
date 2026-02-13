import { watch } from 'vue'
import { useToolStore } from '@/stores/useToolStore'
import { useEditorStore } from '@/stores/useEditorStore'
import { useCanvasStore } from '@/stores/useCanvasStore'
import { getImplementedTool, ToolEnum } from '@/constants/tools'
import { toolManager } from '@/core/tools/ToolManager'
import { MoveTool } from '@/core/tools/MoveTool'
import { SelectTool } from '@/core/tools/SelectTool'
import { BrushTool } from '@/core/tools/BrushTool'
import { EraserTool } from '@/core/tools/EraserTool'
import { TextTool } from '@/core/tools/TextTool'
import { ShapeTool } from '@/core/tools/ShapeTool'
import { EyedropperTool } from '@/core/tools/EyedropperTool'
import { CropTool } from '@/core/tools/CropTool'
import { PenTool } from '@/core/tools/PenTool'
import { GradientTool } from '@/core/tools/GradientTool'
import { CloneStampTool } from '@/core/tools/CloneStampTool'
import { BlurBrushTool } from '@/core/tools/BlurBrushTool'
import { DodgeBurnTool } from '@/core/tools/DodgeBurnTool'
import { TransformTool } from '@/core/tools/TransformTool'
import { PaintBucketTool } from '@/core/tools/PaintBucketTool'
import { RulerTool } from '@/core/tools/RulerTool'
import { RectSelectionTool } from '@/core/tools/selection/RectSelectionTool'
import { EllipseSelectionTool } from '@/core/tools/selection/EllipseSelectionTool'
import { LassoSelectionTool } from '@/core/tools/selection/LassoSelectionTool'
import { MagicWandTool } from '@/core/tools/selection/MagicWandTool'
import { PolygonalLassoTool } from '@/core/tools/selection/PolygonalLassoTool'
import { MagneticLassoTool } from '@/core/tools/selection/MagneticLassoTool'
import { createSelectionFromMask } from '@/core/selection/MaskToSelection'
import * as fabric from 'fabric'

export function useCanvas() {
  const toolStore = useToolStore()
  const editorStore = useEditorStore()
  const canvasStore = useCanvasStore()

  function initTools(canvas: fabric.Canvas) {
    // Register all tools
    const eyedropperTool = new EyedropperTool()
    eyedropperTool.setColorCallback((color) => {
      editorStore.setForegroundColor(color)
    })

    const rulerTool = new RulerTool()
    rulerTool.setMeasureCallback((measurement) => {
      toolStore.setRulerMeasurement(measurement)
    })

    const paintBucketTool = new PaintBucketTool()

    const tools = [
      new MoveTool(),
      new SelectTool(),
      new BrushTool(),
      new EraserTool(),
      new TextTool(),
      new ShapeTool(),
      eyedropperTool,
      new CropTool(),
      new PenTool(),
      new GradientTool(),
      new CloneStampTool(),
      new BlurBrushTool(),
      new DodgeBurnTool(),
      new TransformTool(),
      new RectSelectionTool(),
      new EllipseSelectionTool(),
      new LassoSelectionTool(),
      new MagicWandTool(),
      new PolygonalLassoTool(),
      new MagneticLassoTool(),
      paintBucketTool,
      rulerTool,
    ]

    tools.forEach(tool => toolManager.register(tool))
    toolManager.setCanvas(canvas)
    toolManager.switchTool(toolStore.currentTool)

    // Setup quick mask path listener
    setupQuickMaskPathListener(canvas)
  }

  // Watch for tool changes
  watch(() => toolStore.currentTool, (newTool) => {
    // 子工具回退到已实现的底层工具
    const implTool = getImplementedTool(newTool)
    toolManager.switchTool(implTool)

    // Sync tool options
    const tool = toolManager.getTool(implTool)
    if (tool instanceof BrushTool) {
      tool.setOptions({
        size: toolStore.brushOptions.size,
        color: editorStore.foregroundColor,
        opacity: toolStore.brushOptions.opacity,
      })
    } else if (tool instanceof ShapeTool) {
      tool.setOptions({
        shapeType: toolStore.shapeOptions.shapeType,
        fill: toolStore.shapeOptions.fill,
        stroke: toolStore.shapeOptions.stroke,
        strokeWidth: toolStore.shapeOptions.strokeWidth,
        fillEnabled: toolStore.shapeOptions.fillEnabled,
      })
    } else if (tool instanceof TextTool) {
      tool.setOptions({
        fontFamily: toolStore.textOptions.fontFamily,
        fontSize: toolStore.textOptions.fontSize,
        fontWeight: toolStore.textOptions.fontWeight,
        fontStyle: toolStore.textOptions.fontStyle,
        color: editorStore.foregroundColor,
      })
    } else if (tool instanceof MagicWandTool) {
      tool.setOptions({
        tolerance: toolStore.magicWandOptions.tolerance,
      })
    } else if (tool instanceof BlurBrushTool) {
      tool.setOptions({
        size: toolStore.blurBrushOptions.size,
        strength: toolStore.blurBrushOptions.strength,
      })
    } else if (tool instanceof DodgeBurnTool) {
      tool.setOptions({
        size: toolStore.dodgeBurnOptions.size,
        exposure: toolStore.dodgeBurnOptions.exposure,
        mode: toolStore.dodgeBurnOptions.mode,
        range: toolStore.dodgeBurnOptions.range,
      })
    } else if (tool instanceof EraserTool) {
      tool.setOptions({
        size: toolStore.eraserOptions.size,
        opacity: toolStore.eraserOptions.opacity,
        backgroundColor: editorStore.backgroundColor,
      })
    } else if (tool instanceof PaintBucketTool) {
      tool.setOptions({
        tolerance: toolStore.paintBucketOptions.tolerance,
        fillColor: editorStore.foregroundColor,
        opacity: toolStore.paintBucketOptions.opacity,
      })
    }
  })

  // Sync brush options in real-time
  watch(() => toolStore.brushOptions, (opts) => {
    const brush = toolManager.getTool('brush') as BrushTool | undefined
    if (brush) {
      brush.setOptions({
        size: opts.size,
        opacity: opts.opacity,
        color: editorStore.foregroundColor,
      })
    }
  }, { deep: true })

  // Sync eraser options separately
  watch(() => toolStore.eraserOptions, (opts) => {
    const eraser = toolManager.getTool('eraser') as EraserTool | undefined
    if (eraser) {
      eraser.setOptions({ size: opts.size, opacity: opts.opacity, backgroundColor: editorStore.backgroundColor })
    }
  }, { deep: true })

  // Sync shape options
  watch(() => toolStore.shapeOptions, (opts) => {
    const shape = toolManager.getTool('shape') as ShapeTool | undefined
    if (shape) {
      shape.setOptions({
        shapeType: opts.shapeType,
        fill: opts.fill,
        stroke: opts.stroke,
        strokeWidth: opts.strokeWidth,
        fillEnabled: opts.fillEnabled,
      })
    }
  }, { deep: true })

  // Sync text options
  watch(() => toolStore.textOptions, (opts) => {
    const text = toolManager.getTool('text') as TextTool | undefined
    if (text) {
      text.setOptions({
        fontFamily: opts.fontFamily,
        fontSize: opts.fontSize,
        fontWeight: opts.fontWeight,
        fontStyle: opts.fontStyle,
        color: editorStore.foregroundColor,
        underline: opts.underline,
      })
    }
  }, { deep: true })

  // Sync foreground color to brush/text/paint-bucket
  watch(() => editorStore.foregroundColor, (color) => {
    const brush = toolManager.getTool('brush') as BrushTool | undefined
    if (brush) brush.setOptions({ color })
    const text = toolManager.getTool('text') as TextTool | undefined
    if (text) text.setOptions({ color })
    const paintBucket = toolManager.getTool('paint-bucket') as PaintBucketTool | undefined
    if (paintBucket) paintBucket.setOptions({ fillColor: color })
  })

  // Sync background color to eraser
  watch(() => editorStore.backgroundColor, (bgColor) => {
    const eraser = toolManager.getTool('eraser') as EraserTool | undefined
    if (eraser) eraser.setOptions({ backgroundColor: bgColor })
  })

  // Sync magic wand options
  watch(() => toolStore.magicWandOptions, (opts) => {
    const wand = toolManager.getTool('magic-wand') as MagicWandTool | undefined
    if (wand) {
      wand.setOptions({ tolerance: opts.tolerance })
    }
  }, { deep: true })

  // Sync blur brush options
  watch(() => toolStore.blurBrushOptions, (opts) => {
    const blurBrush = toolManager.getTool('blur-brush') as BlurBrushTool | undefined
    if (blurBrush) {
      blurBrush.setOptions({ size: opts.size, strength: opts.strength })
    }
  }, { deep: true })

  // Sync dodge/burn options
  watch(() => toolStore.dodgeBurnOptions, (opts) => {
    const dodgeBurn = toolManager.getTool('dodge-burn') as DodgeBurnTool | undefined
    if (dodgeBurn) {
      dodgeBurn.setOptions({
        size: opts.size,
        exposure: opts.exposure,
        mode: opts.mode,
        range: opts.range,
      })
    }
  }, { deep: true })

  // Sync paint bucket options
  watch(() => toolStore.paintBucketOptions, (opts) => {
    const paintBucket = toolManager.getTool('paint-bucket') as PaintBucketTool | undefined
    if (paintBucket) {
      paintBucket.setOptions({
        tolerance: opts.tolerance,
        opacity: opts.opacity,
        fillColor: editorStore.foregroundColor,
      })
    }
  }, { deep: true })

  // Quick mask mode
  let savedForegroundColor = ''
  let savedToolId: ToolEnum | null = null

  watch(() => editorStore.quickMaskActive, (active) => {
    const canvas = canvasStore.canvasInstance
    if (!canvas) return

    if (active) {
      // Enter quick mask mode: save state, switch to brush, set red color
      savedForegroundColor = editorStore.foregroundColor
      savedToolId = toolStore.currentTool
      toolStore.setTool(ToolEnum.Brush)
      editorStore.setForegroundColor('rgba(255, 0, 0, 0.5)')

      const brush = toolManager.getTool('brush') as BrushTool | undefined
      if (brush) {
        brush.setOptions({ color: 'rgba(255, 0, 0, 0.5)' })
      }
    } else {
      // Exit quick mask mode: convert mask paths to selection
      const maskObjects = canvas.getObjects().filter((o: any) => o.name === '__quickmask')

      if (maskObjects.length > 0) {
        // Remove existing selections
        const existingSelections = canvas.getObjects().filter((o: any) => o.name === '__selection')
        existingSelections.forEach(obj => canvas.remove(obj))

        // Render mask objects to offscreen canvas
        const canvasWidth = canvas.getWidth()
        const canvasHeight = canvas.getHeight()
        const offscreen = document.createElement('canvas')
        offscreen.width = canvasWidth
        offscreen.height = canvasHeight
        const offCtx = offscreen.getContext('2d')!

        const vpt = canvas.viewportTransform!

        // Draw each mask object onto the offscreen canvas
        for (const obj of maskObjects) {
          if (obj instanceof fabric.Path) {
            const pathData = (obj as any).path as any[]
            if (!pathData) continue

            const offsetX = obj.pathOffset?.x ?? 0
            const offsetY = obj.pathOffset?.y ?? 0
            const objLeft = obj.left ?? 0
            const objTop = obj.top ?? 0
            const scaleX = obj.scaleX ?? 1
            const scaleY = obj.scaleY ?? 1

            offCtx.beginPath()
            for (const cmd of pathData) {
              const type = cmd[0] as string
              switch (type) {
                case 'M': {
                  const sx = ((cmd[1] - offsetX) * scaleX + objLeft) * vpt[0] + vpt[4]
                  const sy = ((cmd[2] - offsetY) * scaleY + objTop) * vpt[3] + vpt[5]
                  offCtx.moveTo(sx, sy)
                  break
                }
                case 'L': {
                  const sx = ((cmd[1] - offsetX) * scaleX + objLeft) * vpt[0] + vpt[4]
                  const sy = ((cmd[2] - offsetY) * scaleY + objTop) * vpt[3] + vpt[5]
                  offCtx.lineTo(sx, sy)
                  break
                }
                case 'Q': {
                  const sx1 = ((cmd[1] - offsetX) * scaleX + objLeft) * vpt[0] + vpt[4]
                  const sy1 = ((cmd[2] - offsetY) * scaleY + objTop) * vpt[3] + vpt[5]
                  const sx = ((cmd[3] - offsetX) * scaleX + objLeft) * vpt[0] + vpt[4]
                  const sy = ((cmd[4] - offsetY) * scaleY + objTop) * vpt[3] + vpt[5]
                  offCtx.quadraticCurveTo(sx1, sy1, sx, sy)
                  break
                }
                case 'C': {
                  const sx1 = ((cmd[1] - offsetX) * scaleX + objLeft) * vpt[0] + vpt[4]
                  const sy1 = ((cmd[2] - offsetY) * scaleY + objTop) * vpt[3] + vpt[5]
                  const sx2 = ((cmd[3] - offsetX) * scaleX + objLeft) * vpt[0] + vpt[4]
                  const sy2 = ((cmd[4] - offsetY) * scaleY + objTop) * vpt[3] + vpt[5]
                  const sx = ((cmd[5] - offsetX) * scaleX + objLeft) * vpt[0] + vpt[4]
                  const sy = ((cmd[6] - offsetY) * scaleY + objTop) * vpt[3] + vpt[5]
                  offCtx.bezierCurveTo(sx1, sy1, sx2, sy2, sx, sy)
                  break
                }
                case 'Z':
                case 'z':
                  offCtx.closePath()
                  break
              }
            }
            // PencilBrush creates stroked paths, so we render with a thick white stroke
            const strokeW = (obj.strokeWidth ?? 1) * (scaleX) * vpt[0]
            offCtx.lineWidth = Math.max(strokeW, 2)
            offCtx.strokeStyle = 'white'
            offCtx.lineCap = 'round'
            offCtx.lineJoin = 'round'
            offCtx.stroke()
            offCtx.fillStyle = 'white'
            offCtx.fill()
          }
        }

        // Convert offscreen canvas to mask
        const imgData = offCtx.getImageData(0, 0, canvasWidth, canvasHeight)
        const mask = new Uint8Array(canvasWidth * canvasHeight)
        for (let i = 0; i < mask.length; i++) {
          // Any pixel with non-zero alpha is part of the mask
          if (imgData.data[i * 4 + 3] > 128) {
            mask[i] = 1
          }
        }

        // Remove mask objects
        maskObjects.forEach(obj => canvas.remove(obj))

        // Create selection from mask
        createSelectionFromMask(canvas, mask, canvasWidth, canvasHeight, vpt)
      }

      // Restore previous state
      if (savedForegroundColor) {
        editorStore.setForegroundColor(savedForegroundColor)
      }
      if (savedToolId !== null) {
        toolStore.setTool(savedToolId)
      }
    }
  })

  // Mark paths created during quick mask mode
  function setupQuickMaskPathListener(canvas: fabric.Canvas) {
    canvas.on('path:created' as any, (e: any) => {
      if (editorStore.quickMaskActive && e.path) {
        e.path.set({ name: '__quickmask' })
      }
    })
  }

  return { initTools }
}
