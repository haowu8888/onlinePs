<template>
  <div class="blur-brush-options">
    <label class="options-label">大小</label>
    <el-slider v-model="toolStore.blurBrushOptions.size" :min="1" :max="100" :step="1" class="options-slider" />
    <el-input-number v-model="toolStore.blurBrushOptions.size" :min="1" :max="100" size="small" class="options-input" />

    <span class="options-separator" />

    <label class="options-label">强度</label>
    <el-slider v-model="toolStore.blurBrushOptions.strength" :min="0" :max="1" :step="0.01" class="options-slider" />
    <span class="options-value">{{ Math.round(toolStore.blurBrushOptions.strength * 100) }}%</span>
  </div>
</template>

<script setup lang="ts">
import { useToolStore } from '@/stores/useToolStore'

const toolStore = useToolStore()
</script>

<style scoped lang="scss">
.blur-brush-options {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 100%;
}

.options-label {
  font-size: $font-size-xs;
  color: $text-secondary;
  white-space: nowrap;
}

.options-slider {
  width: 100px;
  :deep(.el-slider__runway) { height: 4px; }
  :deep(.el-slider__button) { width: 12px; height: 12px; }
}

.options-input {
  width: 70px;
}

.options-value {
  font-size: $font-size-xs;
  color: $text-primary;
  min-width: 32px;
}

.options-separator {
  width: 1px;
  height: 20px;
  background: $border-color;
}
</style>
