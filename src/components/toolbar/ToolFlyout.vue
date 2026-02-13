<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="tool-flyout-overlay"
      @mousedown="$emit('close')"
    />
    <div
      v-if="visible"
      class="tool-flyout"
      :style="{ top: position.top + 'px', left: position.left + 'px' }"
    >
      <div
        v-for="toolId in tools"
        :key="toolId"
        class="tool-flyout__item"
        :class="{ active: toolId === currentTool }"
        @click="$emit('select', toolId)"
      >
        <el-icon :size="16">
          <component :is="getIconComponent(toolId)" />
        </el-icon>
        <span class="tool-flyout__name">{{ getToolInfo(toolId)?.name }}</span>
        <span class="tool-flyout__shortcut">{{ getToolInfo(toolId)?.shortcut }}</span>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
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

defineProps<{
  tools: ToolEnum[]
  position: { top: number; left: number }
  visible: boolean
  currentTool: ToolEnum
}>()

defineEmits<{
  select: [toolId: ToolEnum]
  close: []
}>()

const iconMap: Record<string, any> = {
  Pointer, Move: Rank, CopyDocument, CircleCheck, Edit, MagicStick,
  Crop, View, Brush, Delete, Stamp, TrendCharts,
  EditPen, Minus, Position, FullScreen, Cloudy, Sunny,
  ScaleToOriginal, Sort, Share, Magnet, Aim, Grid,
  DataLine, Notebook, BrushFilled, Opportunity, ColdDrink,
  CircleClose, Close, Connection, CirclePlus, Remove, Switch,
  Document, Star, SemiSelect, HelpFilled,
}

function getToolInfo(toolId: ToolEnum) {
  return TOOL_LIST.find(t => t.id === toolId)
}

function getIconComponent(toolId: ToolEnum) {
  const iconName = getToolInfo(toolId)?.icon
  return iconName ? iconMap[iconName] : null
}
</script>

<style scoped lang="scss">
.tool-flyout-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 9998;
}

.tool-flyout {
  position: fixed;
  z-index: 9999;
  background: $bg-darker;
  border: 1px solid $border-light;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  padding: 4px 0;
  min-width: 160px;

  &__item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 12px;
    cursor: pointer;
    color: $text-secondary;
    transition: all $transition-fast;
    white-space: nowrap;

    &:hover {
      background: $bg-light;
      color: $text-primary;
    }

    &.active {
      color: $text-bright;
      background: $bg-light;
    }
  }

  &__name {
    flex: 1;
    font-size: 12px;
  }

  &__shortcut {
    font-size: 11px;
    color: $text-muted;
    margin-left: 12px;
  }
}
</style>
