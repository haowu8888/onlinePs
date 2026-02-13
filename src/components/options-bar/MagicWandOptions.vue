<template>
  <div class="magic-wand-options">
    <label class="options-label">容差</label>
    <el-slider v-model="toolStore.magicWandOptions.tolerance" :min="0" :max="255" :step="1" class="options-slider" />
    <el-input-number v-model="toolStore.magicWandOptions.tolerance" :min="0" :max="255" size="small" class="options-input" />
  </div>
</template>

<script setup lang="ts">
import { useToolStore } from '@/stores/useToolStore'

const toolStore = useToolStore()
</script>

<style scoped lang="scss">
.magic-wand-options {
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
</style>
