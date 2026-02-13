<template>
  <div class="tool-options">
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
