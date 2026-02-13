<template>
  <div class="tool-options">
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
