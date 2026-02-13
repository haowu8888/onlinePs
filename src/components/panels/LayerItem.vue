<template>
  <div
    class="layer-item"
    :class="{ active, invisible: !layer.visible, locked: layer.locked }"
    @click="$emit('select')"
  >
    <button class="layer-item__visibility icon-btn" @click.stop="$emit('toggle-visibility')">
      <el-icon :size="14">
        <View v-if="layer.visible" />
        <Hide v-else />
      </el-icon>
    </button>

    <div class="layer-item__thumbnail">
      <div class="thumbnail-placeholder" />
    </div>

    <div class="layer-item__info">
      <span class="layer-item__name">{{ layer.name }}</span>
    </div>

    <button class="layer-item__lock icon-btn" @click.stop="$emit('toggle-lock')">
      <el-icon :size="12">
        <Lock v-if="layer.locked" />
        <Unlock v-else />
      </el-icon>
    </button>
  </div>
</template>

<script setup lang="ts">
import type { LayerData } from '@/types/layer'
import { View, Hide, Lock, Unlock } from '@element-plus/icons-vue'

defineProps<{
  layer: LayerData
  active: boolean
}>()

defineEmits(['select', 'toggle-visibility', 'toggle-lock'])
</script>

<style scoped lang="scss">
.layer-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  cursor: pointer;
  border-bottom: 1px solid $border-color;
  transition: background $transition-fast;

  &:hover {
    background: $bg-light;
  }

  &.active {
    background: $bg-medium;
    border-left: 2px solid $accent-color;
  }

  &.invisible {
    opacity: 0.5;
  }

  &__visibility {
    flex-shrink: 0;
  }

  &__thumbnail {
    width: 36px;
    height: 36px;
    flex-shrink: 0;
    border: 1px solid $border-light;
    border-radius: 3px;
    overflow: hidden;
    background: #fff;

    .thumbnail-placeholder {
      width: 100%;
      height: 100%;
      background: linear-gradient(45deg, #ccc 25%, transparent 25%),
        linear-gradient(-45deg, #ccc 25%, transparent 25%),
        linear-gradient(45deg, transparent 75%, #ccc 75%),
        linear-gradient(-45deg, transparent 75%, #ccc 75%);
      background-size: 8px 8px;
      background-position: 0 0, 0 4px, 4px -4px, -4px 0px;
    }
  }

  &__info {
    flex: 1;
    min-width: 0;
  }

  &__name {
    font-size: $font-size-sm;
    color: $text-primary;
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__lock {
    flex-shrink: 0;
    opacity: 0.6;

    &:hover {
      opacity: 1;
    }
  }
}
</style>
