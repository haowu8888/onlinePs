import { watch } from 'vue'
import { useToolStore } from '@/stores/useToolStore'
import { useEditorStore } from '@/stores/useEditorStore'
import { useCanvasStore } from '@/stores/useCanvasStore'
import { getImplementedTool } from '@/constants/tools'
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
import { RectSelectionTool } from '@/core/tools/selection/RectSelectionTool'
import { EllipseSelectionTool } from '@/core/tools/selection/EllipseSelectionTool'
import { LassoSelectionTool } from '@/core/tools/selection/LassoSelectionTool'
import { MagicWandTool } from '@/core/tools/selection/MagicWandTool'
import type * as fabric from 'fabric'

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
    ]

    tools.forEach(tool => toolManager.register(tool))
    toolManager.setCanvas(canvas)
    toolManager.switchTool(toolStore.currentTool)
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
      eraser.setOptions({ size: opts.size, opacity: opts.opacity })
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

  // Sync foreground color to brush/text
  watch(() => editorStore.foregroundColor, (color) => {
    const brush = toolManager.getTool('brush') as BrushTool | undefined
    if (brush) brush.setOptions({ color })
    const text = toolManager.getTool('text') as TextTool | undefined
    if (text) text.setOptions({ color })
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

  return { initTools }
}
