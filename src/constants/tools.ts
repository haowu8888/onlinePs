export enum ToolEnum {
  // --- 基础工具（已实现） ---
  Select = 'select',
  Move = 'move',
  RectSelection = 'rect-selection',
  EllipseSelection = 'ellipse-selection',
  Lasso = 'lasso',
  MagicWand = 'magic-wand',
  Crop = 'crop',
  Eyedropper = 'eyedropper',
  Brush = 'brush',
  Eraser = 'eraser',
  CloneStamp = 'clone-stamp',
  BlurBrush = 'blur-brush',
  DodgeBurn = 'dodge-burn',
  Gradient = 'gradient',
  Text = 'text',
  Shape = 'shape',
  Pen = 'pen',
  Transform = 'transform',

  // --- Photoshop 风格子工具 ---
  // 选区
  SingleRowMarquee = 'single-row-marquee',
  SingleColumnMarquee = 'single-column-marquee',
  // 套索
  PolygonalLasso = 'polygonal-lasso',
  MagneticLasso = 'magnetic-lasso',
  // 快速选择
  QuickSelection = 'quick-selection',
  // 裁剪
  PerspectiveCrop = 'perspective-crop',
  Slice = 'slice',
  SliceSelect = 'slice-select',
  // 吸管
  ColorSampler = 'color-sampler',
  Ruler = 'ruler',
  NoteTool = 'note',
  // 画笔
  Pencil = 'pencil',
  ColorReplacement = 'color-replacement',
  MixerBrush = 'mixer-brush',
  // 图章
  PatternStamp = 'pattern-stamp',
  // 橡皮擦
  BackgroundEraser = 'background-eraser',
  MagicEraser = 'magic-eraser',
  // 渐变
  PaintBucket = 'paint-bucket',
  // 模糊
  Sharpen = 'sharpen',
  Smudge = 'smudge',
  // 减淡加深
  Sponge = 'sponge',
  // 钢笔
  FreeformPen = 'freeform-pen',
  CurvaturePen = 'curvature-pen',
  AddAnchorPoint = 'add-anchor-point',
  DeleteAnchorPoint = 'delete-anchor-point',
  ConvertPoint = 'convert-point',
  // 文字
  VerticalText = 'vertical-text',
  // 形状
  EllipseShape = 'ellipse-shape',
  TriangleShape = 'triangle-shape',
  PolygonShape = 'polygon-shape',
  LineTool = 'line-tool',
  CustomShape = 'custom-shape',
}

export const TOOL_LIST = [
  // --- 已实现的基础工具 ---
  { id: ToolEnum.Move, name: '移动工具', shortcut: 'V', icon: 'Move' },
  { id: ToolEnum.Select, name: '选择工具', shortcut: 'V', icon: 'Pointer' },
  { id: ToolEnum.RectSelection, name: '矩形选框', shortcut: 'M', icon: 'CopyDocument' },
  { id: ToolEnum.EllipseSelection, name: '椭圆选框', shortcut: 'M', icon: 'CircleCheck' },
  { id: ToolEnum.SingleRowMarquee, name: '单行选框', shortcut: 'M', icon: 'ScaleToOriginal' },
  { id: ToolEnum.SingleColumnMarquee, name: '单列选框', shortcut: 'M', icon: 'Sort' },
  { id: ToolEnum.Lasso, name: '套索工具', shortcut: 'L', icon: 'Edit' },
  { id: ToolEnum.PolygonalLasso, name: '多边形套索', shortcut: 'L', icon: 'Share' },
  { id: ToolEnum.MagneticLasso, name: '磁性套索', shortcut: 'L', icon: 'Magnet' },
  { id: ToolEnum.MagicWand, name: '魔棒工具', shortcut: 'W', icon: 'MagicStick' },
  { id: ToolEnum.QuickSelection, name: '快速选择', shortcut: 'W', icon: 'Aim' },
  { id: ToolEnum.Crop, name: '裁剪工具', shortcut: 'C', icon: 'Crop' },
  { id: ToolEnum.PerspectiveCrop, name: '透视裁剪', shortcut: 'C', icon: 'Grid' },
  { id: ToolEnum.Slice, name: '切片工具', shortcut: 'C', icon: 'ScaleToOriginal' },
  { id: ToolEnum.SliceSelect, name: '切片选择', shortcut: 'C', icon: 'Pointer' },
  { id: ToolEnum.Eyedropper, name: '吸管工具', shortcut: 'I', icon: 'View' },
  { id: ToolEnum.ColorSampler, name: '颜色取样器', shortcut: 'I', icon: 'Aim' },
  { id: ToolEnum.Ruler, name: '标尺工具', shortcut: 'I', icon: 'DataLine' },
  { id: ToolEnum.NoteTool, name: '注释工具', shortcut: 'I', icon: 'Notebook' },
  { id: ToolEnum.Brush, name: '画笔工具', shortcut: 'B', icon: 'Brush' },
  { id: ToolEnum.Pencil, name: '铅笔工具', shortcut: 'B', icon: 'EditPen' },
  { id: ToolEnum.ColorReplacement, name: '颜色替换', shortcut: 'B', icon: 'BrushFilled' },
  { id: ToolEnum.MixerBrush, name: '混合器画笔', shortcut: 'B', icon: 'Opportunity' },
  { id: ToolEnum.CloneStamp, name: '仿制图章', shortcut: 'S', icon: 'Stamp' },
  { id: ToolEnum.PatternStamp, name: '图案图章', shortcut: 'S', icon: 'ColdDrink' },
  { id: ToolEnum.Eraser, name: '橡皮擦工具', shortcut: 'E', icon: 'Delete' },
  { id: ToolEnum.BackgroundEraser, name: '背景橡皮擦', shortcut: 'E', icon: 'CircleClose' },
  { id: ToolEnum.MagicEraser, name: '魔术橡皮擦', shortcut: 'E', icon: 'Close' },
  { id: ToolEnum.Gradient, name: '渐变工具', shortcut: 'G', icon: 'TrendCharts' },
  { id: ToolEnum.PaintBucket, name: '油漆桶', shortcut: 'G', icon: 'ColdDrink' },
  { id: ToolEnum.BlurBrush, name: '模糊工具', shortcut: 'R', icon: 'Cloudy' },
  { id: ToolEnum.Sharpen, name: '锐化工具', shortcut: 'R', icon: 'Aim' },
  { id: ToolEnum.Smudge, name: '涂抹工具', shortcut: 'R', icon: 'Pointer' },
  { id: ToolEnum.DodgeBurn, name: '减淡工具', shortcut: 'O', icon: 'Sunny' },
  { id: ToolEnum.Sponge, name: '海绵工具', shortcut: 'O', icon: 'Opportunity' },
  { id: ToolEnum.Pen, name: '钢笔工具', shortcut: 'P', icon: 'Position' },
  { id: ToolEnum.FreeformPen, name: '自由钢笔', shortcut: 'P', icon: 'Edit' },
  { id: ToolEnum.CurvaturePen, name: '曲率钢笔', shortcut: 'P', icon: 'Connection' },
  { id: ToolEnum.AddAnchorPoint, name: '添加锚点', shortcut: 'P', icon: 'CirclePlus' },
  { id: ToolEnum.DeleteAnchorPoint, name: '删除锚点', shortcut: 'P', icon: 'Remove' },
  { id: ToolEnum.ConvertPoint, name: '转换点', shortcut: 'P', icon: 'Switch' },
  { id: ToolEnum.Text, name: '横排文字', shortcut: 'T', icon: 'EditPen' },
  { id: ToolEnum.VerticalText, name: '直排文字', shortcut: 'T', icon: 'Document' },
  { id: ToolEnum.Shape, name: '矩形工具', shortcut: 'U', icon: 'Minus' },
  { id: ToolEnum.EllipseShape, name: '椭圆工具', shortcut: 'U', icon: 'CircleCheck' },
  { id: ToolEnum.TriangleShape, name: '三角形工具', shortcut: 'U', icon: 'Sort' },
  { id: ToolEnum.PolygonShape, name: '多边形工具', shortcut: 'U', icon: 'Star' },
  { id: ToolEnum.LineTool, name: '直线工具', shortcut: 'U', icon: 'SemiSelect' },
  { id: ToolEnum.CustomShape, name: '自定形状', shortcut: 'U', icon: 'HelpFilled' },
  { id: ToolEnum.Transform, name: '自由变换', shortcut: 'Ctrl+T', icon: 'FullScreen' },
]

// 子工具到已实现工具的回退映射
export const TOOL_FALLBACK: Partial<Record<ToolEnum, ToolEnum>> = {
  [ToolEnum.SingleRowMarquee]: ToolEnum.RectSelection,
  [ToolEnum.SingleColumnMarquee]: ToolEnum.RectSelection,
  [ToolEnum.QuickSelection]: ToolEnum.MagicWand,
  [ToolEnum.PerspectiveCrop]: ToolEnum.Crop,
  [ToolEnum.Slice]: ToolEnum.Crop,
  [ToolEnum.SliceSelect]: ToolEnum.Crop,
  [ToolEnum.ColorSampler]: ToolEnum.Eyedropper,
  [ToolEnum.NoteTool]: ToolEnum.Eyedropper,
  [ToolEnum.Pencil]: ToolEnum.Brush,
  [ToolEnum.ColorReplacement]: ToolEnum.Brush,
  [ToolEnum.MixerBrush]: ToolEnum.Brush,
  [ToolEnum.PatternStamp]: ToolEnum.CloneStamp,
  [ToolEnum.BackgroundEraser]: ToolEnum.Eraser,
  [ToolEnum.MagicEraser]: ToolEnum.Eraser,
  [ToolEnum.Sharpen]: ToolEnum.BlurBrush,
  [ToolEnum.Smudge]: ToolEnum.BlurBrush,
  [ToolEnum.Sponge]: ToolEnum.DodgeBurn,
  [ToolEnum.FreeformPen]: ToolEnum.Pen,
  [ToolEnum.CurvaturePen]: ToolEnum.Pen,
  [ToolEnum.AddAnchorPoint]: ToolEnum.Pen,
  [ToolEnum.DeleteAnchorPoint]: ToolEnum.Pen,
  [ToolEnum.ConvertPoint]: ToolEnum.Pen,
  [ToolEnum.VerticalText]: ToolEnum.Text,
  [ToolEnum.EllipseShape]: ToolEnum.Shape,
  [ToolEnum.TriangleShape]: ToolEnum.Shape,
  [ToolEnum.PolygonShape]: ToolEnum.Shape,
  [ToolEnum.LineTool]: ToolEnum.Shape,
  [ToolEnum.CustomShape]: ToolEnum.Shape,
}

// 获取工具实际应该激活的底层实现工具
export function getImplementedTool(toolId: ToolEnum): ToolEnum {
  return TOOL_FALLBACK[toolId] ?? toolId
}

export const TOOL_GROUPS = [
  { label: '选择', tools: [ToolEnum.Move, ToolEnum.Select] },
  { label: '选区', tools: [ToolEnum.RectSelection, ToolEnum.EllipseSelection, ToolEnum.Lasso, ToolEnum.MagicWand] },
  { label: '裁剪', tools: [ToolEnum.Crop, ToolEnum.Eyedropper] },
  { label: '绘画', tools: [ToolEnum.Brush, ToolEnum.Eraser, ToolEnum.CloneStamp, ToolEnum.Gradient] },
  { label: '修图', tools: [ToolEnum.BlurBrush, ToolEnum.DodgeBurn] },
  { label: '图形', tools: [ToolEnum.Text, ToolEnum.Shape, ToolEnum.Pen] },
  { label: '变换', tools: [ToolEnum.Transform] },
]

// Photoshop-style tool slots
export interface ToolSlot {
  id: string
  default: ToolEnum
  tools: ToolEnum[]
}

export const TOOL_SLOTS: ToolSlot[] = [
  // --- 选择 ---
  { id: 'move-slot', default: ToolEnum.Move, tools: [ToolEnum.Move, ToolEnum.Select] },
  { id: 'marquee-slot', default: ToolEnum.RectSelection, tools: [ToolEnum.RectSelection, ToolEnum.EllipseSelection, ToolEnum.SingleRowMarquee, ToolEnum.SingleColumnMarquee] },
  { id: 'lasso-slot', default: ToolEnum.Lasso, tools: [ToolEnum.Lasso, ToolEnum.PolygonalLasso, ToolEnum.MagneticLasso] },
  { id: 'wand-slot', default: ToolEnum.MagicWand, tools: [ToolEnum.MagicWand, ToolEnum.QuickSelection] },
  // --- 裁剪 & 测量 ---
  { id: 'crop-slot', default: ToolEnum.Crop, tools: [ToolEnum.Crop, ToolEnum.PerspectiveCrop, ToolEnum.Slice, ToolEnum.SliceSelect] },
  { id: 'eyedropper-slot', default: ToolEnum.Eyedropper, tools: [ToolEnum.Eyedropper, ToolEnum.ColorSampler, ToolEnum.Ruler, ToolEnum.NoteTool] },
  // --- 绘画 ---
  { id: 'brush-slot', default: ToolEnum.Brush, tools: [ToolEnum.Brush, ToolEnum.Pencil, ToolEnum.ColorReplacement, ToolEnum.MixerBrush] },
  { id: 'stamp-slot', default: ToolEnum.CloneStamp, tools: [ToolEnum.CloneStamp, ToolEnum.PatternStamp] },
  { id: 'eraser-slot', default: ToolEnum.Eraser, tools: [ToolEnum.Eraser, ToolEnum.BackgroundEraser, ToolEnum.MagicEraser] },
  { id: 'gradient-slot', default: ToolEnum.Gradient, tools: [ToolEnum.Gradient, ToolEnum.PaintBucket] },
  // --- 修图 ---
  { id: 'blur-slot', default: ToolEnum.BlurBrush, tools: [ToolEnum.BlurBrush, ToolEnum.Sharpen, ToolEnum.Smudge] },
  { id: 'dodge-slot', default: ToolEnum.DodgeBurn, tools: [ToolEnum.DodgeBurn, ToolEnum.Sponge] },
  // --- 矢量 & 文字 ---
  { id: 'pen-slot', default: ToolEnum.Pen, tools: [ToolEnum.Pen, ToolEnum.FreeformPen, ToolEnum.CurvaturePen, ToolEnum.AddAnchorPoint, ToolEnum.DeleteAnchorPoint, ToolEnum.ConvertPoint] },
  { id: 'text-slot', default: ToolEnum.Text, tools: [ToolEnum.Text, ToolEnum.VerticalText] },
  { id: 'shape-slot', default: ToolEnum.Shape, tools: [ToolEnum.Shape, ToolEnum.EllipseShape, ToolEnum.TriangleShape, ToolEnum.PolygonShape, ToolEnum.LineTool, ToolEnum.CustomShape] },
  // --- 变换 ---
  { id: 'transform-slot', default: ToolEnum.Transform, tools: [ToolEnum.Transform] },
]

// Slot groups separated by dividers in the toolbar
export const TOOL_SLOT_GROUPS: ToolSlot[][] = [
  // 选择
  [TOOL_SLOTS[0], TOOL_SLOTS[1], TOOL_SLOTS[2], TOOL_SLOTS[3]],
  // 裁剪 & 测量
  [TOOL_SLOTS[4], TOOL_SLOTS[5]],
  // 绘画
  [TOOL_SLOTS[6], TOOL_SLOTS[7], TOOL_SLOTS[8], TOOL_SLOTS[9]],
  // 修图
  [TOOL_SLOTS[10], TOOL_SLOTS[11]],
  // 矢量 & 文字
  [TOOL_SLOTS[12], TOOL_SLOTS[13], TOOL_SLOTS[14]],
  // 变换
  [TOOL_SLOTS[15]],
]

// Helper: find which slot a tool belongs to
export function findSlotForTool(toolId: ToolEnum): ToolSlot | undefined {
  return TOOL_SLOTS.find(slot => slot.tools.includes(toolId))
}
