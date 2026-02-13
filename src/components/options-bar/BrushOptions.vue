<template>
  <div class="brush-options">
    <label class="options-label">大小</label>
    <el-slider v-model="toolStore.brushOptions.size" :min="1" :max="200" :step="1" class="options-slider" />
    <el-input-number v-model="toolStore.brushOptions.size" :min="1" :max="200" size="small" class="options-input" />

    <span class="options-separator" />

    <label class="options-label">不透明度</label>
    <el-slider v-model="toolStore.brushOptions.opacity" :min="0" :max="1" :step="0.01" class="options-slider" />
    <span class="options-value">{{ Math.round(toolStore.brushOptions.opacity * 100) }}%</span>

    <span class="options-separator" />

    <label class="options-label">硬度</label>
    <el-slider v-model="toolStore.brushOptions.hardness" :min="0" :max="1" :step="0.01" class="options-slider" />
    <span class="options-value">{{ Math.round(toolStore.brushOptions.hardness * 100) }}%</span>
  </div>
</template>

<script setup lang="ts">
import { useToolStore } from '@/stores/useToolStore'

const toolStore = useToolStore()
</script>

<style scoped lang="scss">
.brush-options {
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
