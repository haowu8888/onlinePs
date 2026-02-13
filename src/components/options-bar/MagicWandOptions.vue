<template>
  <div class="tool-options">
    <label class="options-label">容差</label>
    <el-slider v-model="toolStore.magicWandOptions.tolerance" :min="0" :max="255" :step="1" class="options-slider" />
    <el-input-number v-model="toolStore.magicWandOptions.tolerance" :min="0" :max="255" size="small" class="options-input" />
  </div>
</template>

<script setup lang="ts">
import { useToolStore } from '@/stores/useToolStore'

const toolStore = useToolStore()
</script>
