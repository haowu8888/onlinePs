import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ToolEnum, TOOL_SLOTS, findSlotForTool } from '@/constants/tools'
import type {
  BrushToolOptions,
  ShapeToolOptions,
  TextToolOptions,
  EraserToolOptions,
  MagicWandToolOptions,
  BlurBrushToolOptions,
  DodgeBurnToolOptions,
} from '@/types/tool'

export const useToolStore = defineStore('tool', () => {
  const currentTool = ref<ToolEnum>(ToolEnum.Move)
  const previousTool = ref<ToolEnum>(ToolEnum.Move)

  // Track the active tool for each slot (Photoshop-style)
  const slotActiveTool = ref<Record<string, ToolEnum>>(
    Object.fromEntries(TOOL_SLOTS.map(slot => [slot.id, slot.default]))
  )

  const brushOptions = ref<BrushToolOptions>({
    size: 10,
    opacity: 1,
    hardness: 1,
    color: '#000000',
  })

  const shapeOptions = ref<ShapeToolOptions>({
    shapeType: 'rect',
    fill: '#000000',
    stroke: '#000000',
    strokeWidth: 2,
    fillEnabled: true,
  })

  const textOptions = ref<TextToolOptions>({
    fontFamily: 'Arial',
    fontSize: 24,
    fontWeight: 'normal',
    fontStyle: 'normal',
    textAlign: 'left',
    color: '#000000',
    underline: false,
    linethrough: false,
  })

  const eraserOptions = ref<EraserToolOptions>({
    size: 20,
    opacity: 1,
    hardness: 1,
  })

  const magicWandOptions = ref<MagicWandToolOptions>({
    tolerance: 30,
  })

  const blurBrushOptions = ref<BlurBrushToolOptions>({
    size: 20,
    strength: 0.5,
  })

  const dodgeBurnOptions = ref<DodgeBurnToolOptions>({
    mode: 'dodge',
    range: 'midtones',
    size: 20,
    exposure: 0.3,
  })

  function setTool(tool: ToolEnum) {
    previousTool.value = currentTool.value
    currentTool.value = tool
    // Update the slot's active tool when switching
    const slot = findSlotForTool(tool)
    if (slot) {
      slotActiveTool.value[slot.id] = tool
    }
  }

  function setSlotTool(slotId: string, toolId: ToolEnum) {
    slotActiveTool.value[slotId] = toolId
    setTool(toolId)
  }

  function getSlotTool(slotId: string): ToolEnum {
    return slotActiveTool.value[slotId]
  }

  function revertTool() {
    currentTool.value = previousTool.value
  }

  return {
    currentTool,
    previousTool,
    slotActiveTool,
    brushOptions,
    shapeOptions,
    textOptions,
    eraserOptions,
    magicWandOptions,
    blurBrushOptions,
    dodgeBurnOptions,
    setTool,
    setSlotTool,
    getSlotTool,
    revertTool,
  }
})
