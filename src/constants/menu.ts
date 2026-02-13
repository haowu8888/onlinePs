export interface MenuItem {
  label: string
  action?: string
  shortcut?: string
  divider?: boolean
  disabled?: boolean
  children?: MenuItem[]
}

export const FILE_MENU: MenuItem[] = [
  { label: '新建', action: 'new', shortcut: 'Ctrl+N' },
  { label: '打开', action: 'open', shortcut: 'Ctrl+O' },
  { divider: true, label: '' },
  { label: '保存', action: 'save', shortcut: 'Ctrl+S' },
  { label: '另存为', action: 'save-as', shortcut: 'Ctrl+Shift+S' },
  { label: '导出', action: 'export', shortcut: 'Ctrl+Shift+E' },
  { divider: true, label: '' },
  { label: '关闭', action: 'close' },
]

export const EDIT_MENU: MenuItem[] = [
  { label: '撤销', action: 'undo', shortcut: 'Ctrl+Z' },
  { label: '重做', action: 'redo', shortcut: 'Ctrl+Shift+Z' },
  { divider: true, label: '' },
  { label: '剪切', action: 'cut', shortcut: 'Ctrl+X' },
  { label: '复制', action: 'copy', shortcut: 'Ctrl+C' },
  { label: '粘贴', action: 'paste', shortcut: 'Ctrl+V' },
  { label: '删除', action: 'delete', shortcut: 'Delete' },
  { divider: true, label: '' },
  { label: '全选', action: 'select-all', shortcut: 'Ctrl+A' },
  { label: '取消选择', action: 'deselect', shortcut: 'Ctrl+D' },
]

export const IMAGE_MENU: MenuItem[] = [
  { label: '画布大小', action: 'canvas-size' },
  { label: '图像大小', action: 'image-size' },
  { divider: true, label: '' },
  { label: '自动色阶', action: 'auto-levels' },
  { label: '自动对比度', action: 'auto-contrast' },
  { label: '自动增强', action: 'auto-enhance' },
  { divider: true, label: '' },
  { label: '去水印 (内容识别填充)', action: 'content-aware-fill' },
  { divider: true, label: '' },
  { label: '水平翻转', action: 'flip-h' },
  { label: '垂直翻转', action: 'flip-v' },
  { label: '顺时针旋转90°', action: 'rotate-cw' },
  { label: '逆时针旋转90°', action: 'rotate-ccw' },
]

export const LAYER_MENU: MenuItem[] = [
  { label: '新建图层', action: 'new-layer', shortcut: 'Ctrl+Shift+N' },
  { label: '复制图层', action: 'duplicate-layer' },
  { label: '删除图层', action: 'delete-layer' },
  { divider: true, label: '' },
  { label: '合并图层', action: 'merge-down' },
  { label: '合并可见图层', action: 'merge-visible' },
  { label: '拼合图像', action: 'flatten' },
]

export const FILTER_MENU: MenuItem[] = [
  {
    label: '调整',
    children: [
      { label: '亮度/对比度', action: 'filter-brightness' },
      { label: '色相/饱和度', action: 'filter-saturation' },
    ],
  },
  {
    label: '模糊',
    children: [
      { label: '高斯模糊', action: 'filter-blur' },
      { label: '锐化', action: 'filter-sharpen' },
    ],
  },
  {
    label: '风格化',
    children: [
      { label: '灰度', action: 'filter-grayscale' },
      { label: '反色', action: 'filter-invert' },
      { label: '怀旧', action: 'filter-sepia' },
      { label: '浮雕', action: 'filter-emboss' },
    ],
  },
  {
    label: '高级调整',
    children: [
      { label: '自然饱和度', action: 'filter-vibrance' },
      { label: '色阶', action: 'filter-levels' },
      { label: '色彩平衡', action: 'filter-color-balance' },
      { label: '噪点消除', action: 'filter-noise-reduction' },
      { label: '暗角', action: 'filter-vignette' },
    ],
  },
]

export const VIEW_MENU: MenuItem[] = [
  { label: '放大', action: 'zoom-in', shortcut: 'Ctrl+=' },
  { label: '缩小', action: 'zoom-out', shortcut: 'Ctrl+-' },
  { label: '适合屏幕', action: 'zoom-fit', shortcut: 'Ctrl+0' },
  { label: '实际像素', action: 'zoom-100', shortcut: 'Ctrl+1' },
]

export const HELP_MENU: MenuItem[] = [
  { label: '关于 OnlinePS', action: 'about' },
  { label: '快捷键', action: 'shortcuts-help' },
]
