import type { Component } from 'vue'
import type { ToolEnum } from './tools'
import { TOOL_LIST } from './tools'
import {
  Pointer, Rank, CopyDocument, CircleCheck, Edit, MagicStick,
  Crop, View, Brush, Delete, Stamp, TrendCharts,
  EditPen, Minus, Position, FullScreen, Cloudy, Sunny,
  ScaleToOriginal, Sort, Share, Magnet, Aim, Grid,
  DataLine, Notebook, BrushFilled, Opportunity, ColdDrink,
  CircleClose, Close, Connection, CirclePlus, Remove, Switch,
  Document, Star, SemiSelect, HelpFilled,
} from '@element-plus/icons-vue'

export const TOOL_ICON_MAP: Record<string, Component> = {
  Pointer, Move: Rank, CopyDocument, CircleCheck, Edit, MagicStick,
  Crop, View, Brush, Delete, Stamp, TrendCharts,
  EditPen, Minus, Position, FullScreen, Cloudy, Sunny,
  ScaleToOriginal, Sort, Share, Magnet, Aim, Grid,
  DataLine, Notebook, BrushFilled, Opportunity, ColdDrink,
  CircleClose, Close, Connection, CirclePlus, Remove, Switch,
  Document, Star, SemiSelect, HelpFilled,
}

export function getToolIcon(toolId: ToolEnum): Component | null {
  const info = TOOL_LIST.find(t => t.id === toolId)
  if (!info) return null
  return TOOL_ICON_MAP[info.icon] ?? null
}
