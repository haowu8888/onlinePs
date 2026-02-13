<template>
  <div class="enhance-panel">
    <div class="panel-section">
      <div class="panel-section__title">一键修图</div>
      <div class="panel-section__desc">选中图片后点击按钮，即可一键优化</div>
      <div class="enhance-buttons">
        <el-button class="enhance-btn" @click="handleAutoLevels">
          <el-icon><DataLine /></el-icon>
          <span>自动色阶</span>
        </el-button>
        <el-button class="enhance-btn" @click="handleAutoContrast">
          <el-icon><PieChart /></el-icon>
          <span>自动对比度</span>
        </el-button>
        <el-button class="enhance-btn enhance-btn--primary" type="primary" @click="handleAutoEnhance">
          <el-icon><MagicStick /></el-icon>
          <span>一键增强</span>
        </el-button>
      </div>
    </div>

    <div class="panel-divider" />

    <div class="panel-section">
      <div class="panel-section__title">去水印</div>
      <div class="panel-section__desc">先用选区工具框选水印区域，再点击去除</div>
      <el-button
        class="enhance-btn enhance-btn--warn"
        :disabled="!hasSelection"
        @click="handleRemoveWatermark"
      >
        <el-icon><Delete /></el-icon>
        <span>{{ hasSelection ? '去除水印' : '请先框选水印区域' }}</span>
      </el-button>
      <div v-if="!hasSelection" class="panel-section__tip">
        提示：使用左侧工具栏的「矩形选区」工具框选水印区域
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useCanvasStore } from '@/stores/useCanvasStore'
import { applyAutoEffect } from '@/core/filters/AutoEnhance'
import { ContentAwareFill } from '@/core/selection/ContentAwareFill'
import { DataLine, PieChart, MagicStick, Delete } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import * as fabric from 'fabric'

const canvasStore = useCanvasStore()
const hasSelection = ref(false)

function getTargetImage(): fabric.FabricImage | null {
  const canvas = canvasStore.canvasInstance
  if (!canvas) return null

  const activeObj = canvas.getActiveObject()
  if (activeObj && activeObj instanceof fabric.FabricImage) {
    return activeObj
  }

  const images = canvas.getObjects().filter(obj => obj instanceof fabric.FabricImage)
  if (images.length > 0) {
    return images[0] as fabric.FabricImage
  }

  return null
}

function handleAutoLevels() {
  const canvas = canvasStore.canvasInstance
  const img = getTargetImage()
  if (!canvas || !img) {
    ElMessage.warning('请先导入一张图片')
    return
  }
  applyAutoEffect(canvas, img, 'auto-levels')
  ElMessage.success('自动色阶已应用')
}

function handleAutoContrast() {
  const canvas = canvasStore.canvasInstance
  const img = getTargetImage()
  if (!canvas || !img) {
    ElMessage.warning('请先导入一张图片')
    return
  }
  applyAutoEffect(canvas, img, 'auto-contrast')
  ElMessage.success('自动对比度已应用')
}

function handleAutoEnhance() {
  const canvas = canvasStore.canvasInstance
  const img = getTargetImage()
  if (!canvas || !img) {
    ElMessage.warning('请先导入一张图片')
    return
  }
  applyAutoEffect(canvas, img, 'auto-enhance')
  ElMessage.success('一键增强已应用')
}

function handleRemoveWatermark() {
  const canvas = canvasStore.canvasInstance
  if (!canvas) return
  ContentAwareFill.execute(canvas)
}

function checkSelection() {
  const canvas = canvasStore.canvasInstance
  if (!canvas) {
    hasSelection.value = false
    return
  }
  hasSelection.value = canvas.getObjects().some((obj: any) => obj.name === '__selection')
}

let intervalId: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  intervalId = setInterval(checkSelection, 300)
})

onBeforeUnmount(() => {
  if (intervalId) clearInterval(intervalId)
})
</script>

<style scoped lang="scss">
.enhance-panel {
  padding: 12px;
}

.panel-section {
  &__title {
    font-size: $font-size-sm;
    color: $text-bright;
    font-weight: 600;
    margin-bottom: 4px;
  }

  &__desc {
    font-size: $font-size-xs;
    color: $text-secondary;
    margin-bottom: 10px;
    line-height: 1.4;
  }

  &__tip {
    font-size: $font-size-xs;
    color: $text-secondary;
    margin-top: 8px;
    padding: 6px 8px;
    background: $bg-dark;
    border-radius: 4px;
    line-height: 1.4;
  }
}

.panel-divider {
  height: 1px;
  background: $border-color;
  margin: 14px 0;
}

.enhance-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.enhance-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 36px;
  font-size: $font-size-sm;

  &--primary {
    font-weight: 600;
  }

  &--warn {
    width: 100%;
  }
}
</style>
