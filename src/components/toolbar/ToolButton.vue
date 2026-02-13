<template>
  <div
    class="tool-button-wrap"
    @contextmenu.prevent="onContextMenu"
    @mousedown="onMouseDown"
    @mouseup="onMouseUp"
    @mouseleave="onMouseLeave"
  >
    <el-tooltip :content="toolInfo?.name + ' (' + toolInfo?.shortcut + ')'" placement="right" :show-after="500">
      <button
        class="tool-button"
        :class="{ active }"
        @click="onClick"
      >
        <el-icon :size="18">
          <component :is="iconComponent" />
        </el-icon>
        <span v-if="hasSubTools" class="tool-button__triangle" />
      </button>
    </el-tooltip>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { TOOL_LIST } from '@/constants/tools'
import type { ToolEnum } from '@/constants/tools'
import {
  Pointer, Rank, CopyDocument, CircleCheck, Edit, MagicStick,
  Crop, View, Brush, Delete, Stamp, TrendCharts,
  EditPen, Minus, Position, FullScreen, Cloudy, Sunny,
  ScaleToOriginal, Sort, Share, Magnet, Aim, Grid,
  DataLine, Notebook, BrushFilled, Opportunity, ColdDrink,
  CircleClose, Close, Connection, CirclePlus, Remove, Switch,
  Document, Star, SemiSelect, HelpFilled,
} from '@element-plus/icons-vue'

const props = defineProps<{
  toolId: ToolEnum
  active: boolean
  hasSubTools?: boolean
}>()

const emit = defineEmits<{
  click: []
  'open-flyout': [rect: { top: number; left: number; right: number; bottom: number }]
}>()

const toolInfo = computed(() => TOOL_LIST.find(t => t.id === props.toolId))

const iconMap: Record<string, any> = {
  Pointer, Move: Rank, CopyDocument, CircleCheck, Edit, MagicStick,
  Crop, View, Brush, Delete, Stamp, TrendCharts,
  EditPen, Minus, Position, FullScreen, Cloudy, Sunny,
  ScaleToOriginal, Sort, Share, Magnet, Aim, Grid,
  DataLine, Notebook, BrushFilled, Opportunity, ColdDrink,
  CircleClose, Close, Connection, CirclePlus, Remove, Switch,
  Document, Star, SemiSelect, HelpFilled,
}

const iconComponent = computed(() => {
  const iconName = toolInfo.value?.icon
  return iconName ? iconMap[iconName] : null
})

let longPressTimer: ReturnType<typeof setTimeout> | null = null
let longPressTarget: HTMLElement | null = null
let flyoutOpened = false

function emitRect(el: HTMLElement) {
  const rect = el.getBoundingClientRect()
  emit('open-flyout', { top: rect.top, left: rect.left, right: rect.right, bottom: rect.bottom })
}

function onClick() {
  if (flyoutOpened) {
    flyoutOpened = false
    return
  }
  emit('click')
}

function onContextMenu(e: MouseEvent) {
  if (props.hasSubTools) {
    clearTimer()
    emitRect(e.currentTarget as HTMLElement)
  }
}

function onMouseDown(e: MouseEvent) {
  if (!props.hasSubTools) return
  flyoutOpened = false
  longPressTarget = e.currentTarget as HTMLElement
  longPressTimer = setTimeout(() => {
    flyoutOpened = true
    if (longPressTarget) emitRect(longPressTarget)
    longPressTimer = null
  }, 300)
}

function onMouseUp() {
  clearTimer()
}

function onMouseLeave() {
  clearTimer()
}

function clearTimer() {
  if (longPressTimer) {
    clearTimeout(longPressTimer)
    longPressTimer = null
  }
}
</script>

<style scoped lang="scss">
.tool-button-wrap {
  display: flex;
}

.tool-button {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: $text-secondary;
  cursor: pointer;
  border-radius: 3px;
  margin: 1px 0;
  transition: all $transition-fast;

  &:hover {
    background: $bg-light;
    color: $text-primary;
  }

  &.active {
    background: $bg-light;
    color: $text-bright;
    box-shadow: inset 0 0 0 1px $accent-color;
  }

  &__triangle {
    position: absolute;
    bottom: 3px;
    right: 3px;
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 0 0 4px 4px;
    border-color: transparent transparent $text-secondary transparent;
  }

  &.active &__triangle {
    border-color: transparent transparent $text-bright transparent;
  }
}
</style>
