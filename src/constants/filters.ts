import type { FilterConfig } from '@/types/filter'
import * as fabric from 'fabric'
import { LevelsFilter } from '@/core/filters/custom/LevelsFilter'
import { ColorBalanceFilter } from '@/core/filters/custom/ColorBalanceFilter'
import { NoiseReductionFilter } from '@/core/filters/custom/NoiseReductionFilter'
import { VignetteFilter } from '@/core/filters/custom/VignetteFilter'

export const FILTER_LIST: FilterConfig[] = [
  {
    id: 'brightness',
    name: '亮度',
    category: 'adjust',
    params: [{ key: 'brightness', label: '亮度', min: -1, max: 1, default: 0, step: 0.01 }],
    factory: (p) => new fabric.filters.Brightness({ brightness: p.brightness }),
  },
  {
    id: 'contrast',
    name: '对比度',
    category: 'adjust',
    params: [{ key: 'contrast', label: '对比度', min: -1, max: 1, default: 0, step: 0.01 }],
    factory: (p) => new fabric.filters.Contrast({ contrast: p.contrast }),
  },
  {
    id: 'saturation',
    name: '饱和度',
    category: 'adjust',
    params: [{ key: 'saturation', label: '饱和度', min: -1, max: 1, default: 0, step: 0.01 }],
    factory: (p) => new fabric.filters.Saturation({ saturation: p.saturation }),
  },
  {
    id: 'hue',
    name: '色相',
    category: 'adjust',
    params: [{ key: 'rotation', label: '色相旋转', min: -1, max: 1, default: 0, step: 0.01 }],
    factory: (p) => new fabric.filters.HueRotation({ rotation: p.rotation }),
  },
  {
    id: 'blur',
    name: '高斯模糊',
    category: 'blur',
    params: [{ key: 'blur', label: '模糊半径', min: 0, max: 1, default: 0, step: 0.01 }],
    factory: (p) => new fabric.filters.Blur({ blur: p.blur }),
  },
  {
    id: 'sharpen',
    name: '锐化',
    category: 'blur',
    params: [],
    factory: () => new fabric.filters.Convolute({
      matrix: [0, -1, 0, -1, 5, -1, 0, -1, 0],
    }),
  },
  {
    id: 'grayscale',
    name: '灰度',
    category: 'stylize',
    params: [],
    factory: () => new fabric.filters.Grayscale(),
  },
  {
    id: 'invert',
    name: '反色',
    category: 'stylize',
    params: [],
    factory: () => new fabric.filters.Invert(),
  },
  {
    id: 'sepia',
    name: '怀旧',
    category: 'stylize',
    params: [],
    factory: () => new fabric.filters.Sepia(),
  },
  {
    id: 'emboss',
    name: '浮雕',
    category: 'stylize',
    params: [],
    factory: () => new fabric.filters.Convolute({
      matrix: [-2, -1, 0, -1, 1, 1, 0, 1, 2],
    }),
  },
  // --- Enhanced Adjustment Filters ---
  {
    id: 'vibrance',
    name: '自然饱和度',
    category: 'enhance',
    params: [{ key: 'vibrance', label: '自然饱和度', min: -1, max: 1, default: 0, step: 0.01 }],
    factory: (p) => new fabric.filters.Vibrance({ vibrance: p.vibrance }),
  },
  {
    id: 'levels',
    name: '色阶',
    category: 'enhance',
    params: [
      { key: 'blackPoint', label: '黑场', min: 0, max: 255, default: 0, step: 1 },
      { key: 'whitePoint', label: '白场', min: 0, max: 255, default: 255, step: 1 },
      { key: 'gamma', label: 'Gamma', min: 0.1, max: 10, default: 1, step: 0.01 },
    ],
    factory: (p) => new LevelsFilter({
      blackPoint: p.blackPoint ?? 0,
      whitePoint: p.whitePoint ?? 255,
      gamma: p.gamma ?? 1,
    }),
  },
  {
    id: 'color-balance',
    name: '色彩平衡',
    category: 'enhance',
    params: [
      { key: 'shadowR', label: '暗部红', min: -100, max: 100, default: 0, step: 1 },
      { key: 'shadowG', label: '暗部绿', min: -100, max: 100, default: 0, step: 1 },
      { key: 'shadowB', label: '暗部蓝', min: -100, max: 100, default: 0, step: 1 },
      { key: 'midtoneR', label: '中间调红', min: -100, max: 100, default: 0, step: 1 },
      { key: 'midtoneG', label: '中间调绿', min: -100, max: 100, default: 0, step: 1 },
      { key: 'midtoneB', label: '中间调蓝', min: -100, max: 100, default: 0, step: 1 },
      { key: 'highlightR', label: '高光红', min: -100, max: 100, default: 0, step: 1 },
      { key: 'highlightG', label: '高光绿', min: -100, max: 100, default: 0, step: 1 },
      { key: 'highlightB', label: '高光蓝', min: -100, max: 100, default: 0, step: 1 },
    ],
    factory: (p) => new ColorBalanceFilter({
      shadowR: p.shadowR ?? 0,
      shadowG: p.shadowG ?? 0,
      shadowB: p.shadowB ?? 0,
      midtoneR: p.midtoneR ?? 0,
      midtoneG: p.midtoneG ?? 0,
      midtoneB: p.midtoneB ?? 0,
      highlightR: p.highlightR ?? 0,
      highlightG: p.highlightG ?? 0,
      highlightB: p.highlightB ?? 0,
    }),
  },
  {
    id: 'noise-reduction',
    name: '噪点消除',
    category: 'enhance',
    params: [{ key: 'strength', label: '强度', min: 0, max: 1, default: 0.5, step: 0.01 }],
    factory: (p) => new NoiseReductionFilter({ strength: p.strength ?? 0.5 }),
  },
  {
    id: 'vignette',
    name: '暗角',
    category: 'enhance',
    params: [
      { key: 'vignetteStrength', label: '强度', min: 0, max: 1, default: 0.5, step: 0.01 },
      { key: 'vignetteSize', label: '范围', min: 0, max: 1, default: 0.5, step: 0.01 },
    ],
    factory: (p) => new VignetteFilter({
      vignetteStrength: p.vignetteStrength ?? 0.5,
      vignetteSize: p.vignetteSize ?? 0.5,
    }),
  },
]

export const FILTER_CATEGORIES = [
  { id: 'adjust', name: '调整' },
  { id: 'blur', name: '模糊/锐化' },
  { id: 'stylize', name: '风格化' },
  { id: 'enhance', name: '高级调整' },
]
