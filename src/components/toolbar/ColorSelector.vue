<template>
  <div class="color-selector">
    <div class="color-selector__swatches">
      <el-color-picker
        v-model="editorStore.foregroundColor"
        class="color-fg"
        size="small"
        :predefine="presetColors"
        @change="(val: string | null) => val && editorStore.setForegroundColor(val)"
      />
      <el-color-picker
        v-model="editorStore.backgroundColor"
        class="color-bg"
        size="small"
        :predefine="presetColors"
        @change="(val: string | null) => val && editorStore.setBackgroundColor(val)"
      />
    </div>
    <div class="color-selector__actions">
      <button class="icon-btn" title="交换颜色 (X)" @click="editorStore.swapColors">
        <el-icon :size="12"><Switch /></el-icon>
      </button>
      <button class="icon-btn" title="默认颜色 (D)" @click="editorStore.resetColors">
        <el-icon :size="12"><RefreshLeft /></el-icon>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useEditorStore } from '@/stores/useEditorStore'
import { Switch, RefreshLeft } from '@element-plus/icons-vue'

const editorStore = useEditorStore()

const presetColors = [
  '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff',
  '#ffff00', '#ff00ff', '#00ffff', '#ff8800', '#8800ff',
]
</script>

<style scoped lang="scss">
.color-selector {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 4px;

  &__swatches {
    position: relative;
    width: 34px;
    height: 34px;

    .color-bg {
      position: absolute;
      bottom: 0;
      right: 0;
    }

    .color-fg {
      position: absolute;
      top: 0;
      left: 0;
      z-index: 1;
    }

    :deep(.el-color-picker__trigger) {
      width: 22px;
      height: 22px;
      padding: 1px;
      border: 1px solid $border-light;
    }
  }

  &__actions {
    display: flex;
    gap: 2px;
  }
}
</style>
