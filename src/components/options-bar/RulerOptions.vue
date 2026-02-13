<template>
  <div class="ruler-options">
    <template v-if="measurement">
      <span class="ruler-options__item">X: {{ measurement.x1 }} → {{ measurement.x2 }}</span>
      <span class="ruler-options__item">Y: {{ measurement.y1 }} → {{ measurement.y2 }}</span>
      <span class="ruler-options__separator" />
      <span class="ruler-options__item">W: {{ measurement.width }}px</span>
      <span class="ruler-options__item">H: {{ measurement.height }}px</span>
      <span class="ruler-options__separator" />
      <span class="ruler-options__item">D: {{ measurement.distance }}px</span>
      <span class="ruler-options__item">A: {{ measurement.angle }}°</span>
    </template>
    <span v-else class="ruler-options__hint">拖拽测量距离和角度</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useToolStore } from '@/stores/useToolStore'

const toolStore = useToolStore()
const measurement = computed(() => toolStore.rulerMeasurement)
</script>

<style scoped lang="scss">
.ruler-options {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 100%;

  &__item {
    font-size: $font-size-sm;
    color: $text-primary;
    white-space: nowrap;
    font-family: monospace;
  }

  &__hint {
    font-size: $font-size-sm;
    color: $text-secondary;
    white-space: nowrap;
  }

  &__separator {
    width: 1px;
    height: 16px;
    background: $border-color;
  }
}
</style>
