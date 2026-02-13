export const SHORTCUTS = {
  // Tools
  'v': 'move',
  'm': 'rect-selection',
  'l': 'lasso',
  'w': 'magic-wand',
  'c': 'crop',
  'i': 'eyedropper',
  'b': 'brush',
  'e': 'eraser',
  's': 'clone-stamp',
  'r': 'blur-brush',
  'o': 'dodge-burn',
  'g': 'gradient',
  't': 'text',
  'u': 'shape',
  'p': 'pen',

  // Edit
  'ctrl+z': 'undo',
  'ctrl+shift+z': 'redo',
  'ctrl+c': 'copy',
  'ctrl+v': 'paste',
  'ctrl+x': 'cut',
  'ctrl+a': 'select-all',
  'ctrl+d': 'deselect',
  'delete': 'delete',

  // View
  'ctrl+=': 'zoom-in',
  'ctrl+-': 'zoom-out',
  'ctrl+0': 'zoom-fit',
  'ctrl+1': 'zoom-100',

  // File
  'ctrl+n': 'new',
  'ctrl+o': 'open',
  'ctrl+s': 'save',
  'ctrl+shift+s': 'save-as',
  'ctrl+shift+e': 'export',

  // Layer
  'ctrl+shift+n': 'new-layer',

  // Transform
  'ctrl+t': 'transform',

  // Swap colors
  'x': 'swap-colors',
  'd': 'default-colors',

  // Quick mask
  'q': 'quick-mask',
} as const
