<template>
  <div class="tool-options">
    <label class="options-label">模式</label>
    <el-radio-group v-model="toolStore.dodgeBurnOptions.mode" size="small">
      <el-radio-button value="dodge">减淡</el-radio-button>
      <el-radio-button value="burn">加深</el-radio-button>
    </el-radio-group>

    <span class="options-separator" />

    <label class="options-label">范围</label>
    <el-select v-model="toolStore.dodgeBurnOptions.range" size="small" class="range-select">
      <el-option label="暗部" value="shadows" />
      <el-option label="中间调" value="midtones" />
      <el-option label="高光" value="highlights" />
    </el-select>

    <span class="options-separator" />

    <label class="options-label">大小</label>
    <el-slider v-model="toolStore.dodgeBurnOptions.size" :min="1" :max="100" :step="1" class="options-slider" />
    <el-input-number v-model="toolStore.dodgeBurnOptions.size" :min="1" :max="100" size="small" class="options-input" />

    <span class="options-separator" />

    <label class="options-label">曝光度</label>
    <el-slider v-model="toolStore.dodgeBurnOptions.exposure" :min="0" :max="1" :step="0.01" class="options-slider" />
    <span class="options-value">{{ Math.round(toolStore.dodgeBurnOptions.exposure * 100) }}%</span>
  </div>
</template>

<script setup lang="ts">
import { useToolStore } from '@/stores/useToolStore'

const toolStore = useToolStore()
</script>

<style scoped lang="scss">
.range-select {
  width: 90px;
}
</style>
