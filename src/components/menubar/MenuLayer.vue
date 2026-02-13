<template>
  <el-dropdown trigger="click" @command="handleCommand" :teleported="true">
    <span class="menu-trigger">图层</span>
    <template #dropdown>
      <el-dropdown-menu>
        <template v-for="item in LAYER_MENU" :key="item.label">
          <el-dropdown-item v-if="!item.divider" :command="item.action">
            <span class="menu-item-label">{{ item.label }}</span>
            <span v-if="item.shortcut" class="menu-item-shortcut">{{ item.shortcut }}</span>
          </el-dropdown-item>
          <div v-else class="menu-divider" />
        </template>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
import { LAYER_MENU } from '@/constants/menu'
import { useLayerStore } from '@/stores/useLayerStore'

const layerStore = useLayerStore()

function handleCommand(action: string) {
  switch (action) {
    case 'new-layer':
      layerStore.addLayer()
      break
    case 'duplicate-layer':
      if (layerStore.activeLayerId) {
        layerStore.duplicateLayer(layerStore.activeLayerId)
      }
      break
    case 'delete-layer':
      if (layerStore.activeLayerId) {
        layerStore.removeLayer(layerStore.activeLayerId)
      }
      break
    case 'flatten':
      // Will be implemented in layer system
      break
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
.menu-divider { height: 1px; background: $border-color; margin: 4px 0; }
:deep(.el-dropdown-menu__item) {
  display: flex; justify-content: space-between; align-items: center;
  min-width: 200px; padding: 6px 20px; font-size: $font-size-sm;
}
</style>
