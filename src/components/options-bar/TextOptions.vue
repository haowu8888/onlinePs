<template>
  <div class="text-options">
    <label class="options-label">字体</label>
    <el-select v-model="toolStore.textOptions.fontFamily" size="small" class="options-select">
      <el-option label="Arial" value="Arial" />
      <el-option label="微软雅黑" value="Microsoft YaHei" />
      <el-option label="宋体" value="SimSun" />
      <el-option label="Georgia" value="Georgia" />
      <el-option label="Courier New" value="Courier New" />
      <el-option label="Times New Roman" value="Times New Roman" />
    </el-select>

    <label class="options-label">大小</label>
    <el-input-number v-model="toolStore.textOptions.fontSize" :min="6" :max="200" size="small" class="options-input" />

    <span class="options-separator" />

    <el-button-group size="small">
      <el-button :type="toolStore.textOptions.fontWeight === 'bold' ? 'primary' : 'default'" @click="toggleBold">
        <strong>B</strong>
      </el-button>
      <el-button :type="toolStore.textOptions.fontStyle === 'italic' ? 'primary' : 'default'" @click="toggleItalic">
        <em>I</em>
      </el-button>
      <el-button :type="toolStore.textOptions.underline ? 'primary' : 'default'" @click="toggleUnderline">
        <u>U</u>
      </el-button>
    </el-button-group>

    <span class="options-separator" />

    <label class="options-label">颜色</label>
    <el-color-picker v-model="toolStore.textOptions.color" size="small" />
  </div>
</template>

<script setup lang="ts">
import { useToolStore } from '@/stores/useToolStore'

const toolStore = useToolStore()

function toggleBold() {
  toolStore.textOptions.fontWeight = toolStore.textOptions.fontWeight === 'bold' ? 'normal' : 'bold'
}

function toggleItalic() {
  toolStore.textOptions.fontStyle = toolStore.textOptions.fontStyle === 'italic' ? 'normal' : 'italic'
}

function toggleUnderline() {
  toolStore.textOptions.underline = !toolStore.textOptions.underline
}
</script>

<style scoped lang="scss">
.text-options {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 100%;
}
.options-label { font-size: $font-size-xs; color: $text-secondary; white-space: nowrap; }
.options-select { width: 130px; }
.options-input { width: 80px; }
.options-separator { width: 1px; height: 20px; background: $border-color; }
</style>
