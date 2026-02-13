<template>
  <div class="tool-options">
    <label class="options-label">容差</label>
    <el-slider
      v-model="toolStore.paintBucketOptions.tolerance"
      :min="0"
      :max="255"
      :step="1"
      :show-tooltip="true"
      class="options-slider"
    />
    <label class="options-label">不透明度</label>
    <el-slider
      v-model="opacityPercent"
      :min="1"
      :max="100"
      :step="1"
      :show-tooltip="true"
      class="options-slider"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useToolStore } from '@/stores/useToolStore'

const toolStore = useToolStore()

const opacityPercent = computed({
  get: () => Math.round(toolStore.paintBucketOptions.opacity * 100),
  set: (v: number) => { toolStore.paintBucketOptions.opacity = v / 100 },
})
</script>
