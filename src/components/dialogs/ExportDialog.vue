<template>
  <el-dialog v-model="visible" title="导出图片" width="400px" :close-on-click-modal="false">
    <el-form :model="form" label-width="80px">
      <el-form-item label="文件名">
        <el-input v-model="form.fileName" />
      </el-form-item>
      <el-form-item label="格式">
        <el-radio-group v-model="form.format">
          <el-radio value="png">PNG</el-radio>
          <el-radio value="jpeg">JPEG</el-radio>
          <el-radio value="webp">WebP</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="质量" v-if="form.format !== 'png'">
        <el-slider v-model="form.quality" :min="0.1" :max="1" :step="0.05" />
        <span class="quality-value">{{ Math.round(form.quality * 100) }}%</span>
      </el-form-item>
      <el-form-item label="缩放">
        <el-select v-model="form.multiplier">
          <el-option :label="'0.5x'" :value="0.5" />
          <el-option :label="'1x'" :value="1" />
          <el-option :label="'2x'" :value="2" />
          <el-option :label="'3x'" :value="3" />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="doExport">导出</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useCanvasStore } from '@/stores/useCanvasStore'
import { useEditorStore } from '@/stores/useEditorStore'
import { ImageExporter } from '@/core/file/ImageExporter'
import type { ExportFormat } from '@/core/file/ImageExporter'

const visible = defineModel<boolean>({ default: false })
const canvasStore = useCanvasStore()
const editorStore = useEditorStore()

const form = reactive({
  fileName: 'export',
  format: 'png' as ExportFormat,
  quality: 0.92,
  multiplier: 1,
})

function doExport() {
  const canvas = canvasStore.canvasInstance
  if (!canvas) return

  const exporter = new ImageExporter(canvas)
  exporter.export({
    format: form.format,
    quality: form.quality,
    multiplier: form.multiplier,
    fileName: form.fileName || editorStore.documentName,
  })

  visible.value = false
}
</script>

<style scoped lang="scss">
.quality-value {
  margin-left: 8px;
  font-size: $font-size-sm;
  color: $text-secondary;
}
</style>
