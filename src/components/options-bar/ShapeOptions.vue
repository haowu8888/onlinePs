<template>
  <div class="shape-options">
    <label class="options-label">形状</label>
    <el-select v-model="toolStore.shapeOptions.shapeType" size="small" class="options-select">
      <el-option label="矩形" value="rect" />
      <el-option label="椭圆" value="ellipse" />
      <el-option label="线条" value="line" />
      <el-option label="三角形" value="triangle" />
      <el-option label="多边形" value="polygon" />
    </el-select>

    <span class="options-separator" />

    <el-checkbox v-model="toolStore.shapeOptions.fillEnabled" label="填充" size="small" />
    <el-color-picker v-model="toolStore.shapeOptions.fill" size="small" v-if="toolStore.shapeOptions.fillEnabled" />

    <span class="options-separator" />

    <label class="options-label">描边</label>
    <el-color-picker v-model="toolStore.shapeOptions.stroke" size="small" />

    <label class="options-label">宽度</label>
    <el-input-number v-model="toolStore.shapeOptions.strokeWidth" :min="0" :max="50" size="small" class="options-input" />
  </div>
</template>

<script setup lang="ts">
import { useToolStore } from '@/stores/useToolStore'

const toolStore = useToolStore()
</script>

<style scoped lang="scss">
.shape-options {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 100%;
}
.options-label { font-size: $font-size-xs; color: $text-secondary; white-space: nowrap; }
.options-select { width: 90px; }
.options-input { width: 70px; }
.options-separator { width: 1px; height: 20px; background: $border-color; }
</style>
