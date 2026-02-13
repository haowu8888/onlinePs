<template>
  <el-dropdown trigger="click" @command="handleCommand" :teleported="true">
    <span class="menu-trigger">视图</span>
    <template #dropdown>
      <el-dropdown-menu>
        <template v-for="item in VIEW_MENU" :key="item.label">
          <el-dropdown-item :command="item.action">
            <span class="menu-item-label">{{ item.label }}</span>
            <span v-if="item.shortcut" class="menu-item-shortcut">{{ item.shortcut }}</span>
          </el-dropdown-item>
        </template>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
import { VIEW_MENU } from '@/constants/menu'
import { canvasManager } from '@/core/canvas/CanvasManager'

function handleCommand(action: string) {
  const vm = canvasManager.viewportManager
  if (!vm) return
  switch (action) {
    case 'zoom-in': vm.zoomIn(); break
    case 'zoom-out': vm.zoomOut(); break
    case 'zoom-fit': vm.zoomToFit(); break
    case 'zoom-100': vm.resetView(); break
  }
}
</script>

<style scoped lang="scss">
.menu-trigger {
  padding: 4px 10px; cursor: pointer; font-size: $font-size-sm;
  color: $text-primary; border-radius: 2px;
  &:hover { background: $bg-light; }
}
.menu-item-label { flex: 1; }
.menu-item-shortcut { margin-left: 30px; color: $text-muted; font-size: $font-size-xs; }
:deep(.el-dropdown-menu__item) {
  display: flex; justify-content: space-between; align-items: center;
  min-width: 200px; padding: 6px 20px; font-size: $font-size-sm;
}
</style>
