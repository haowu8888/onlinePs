<template>
  <div class="property-panel">
    <div v-if="selectedObject" class="property-panel__content">
      <div class="panel-section">
        <div class="panel-section__title">位置 & 尺寸</div>
        <div class="prop-grid">
          <label>X</label>
          <el-input-number v-model="objLeft" size="small" @change="updateProperty('left', objLeft)" />
          <label>Y</label>
          <el-input-number v-model="objTop" size="small" @change="updateProperty('top', objTop)" />
          <label>W</label>
          <el-input-number v-model="objWidth" size="small" :min="1" @change="updateWidth" />
          <label>H</label>
          <el-input-number v-model="objHeight" size="small" :min="1" @change="updateHeight" />
        </div>
      </div>

      <div class="panel-section">
        <div class="panel-section__title">变换</div>
        <div class="prop-grid">
          <label>旋转</label>
          <el-input-number v-model="objAngle" size="small" :min="0" :max="360" @change="updateProperty('angle', objAngle)" />
          <label>不透明度</label>
          <el-slider v-model="objOpacity" :min="0" :max="1" :step="0.01" @change="updateProperty('opacity', objOpacity)" />
        </div>
      </div>
    </div>

    <div v-else class="property-panel__empty">
      <p>选择对象查看属性</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useCanvasStore } from '@/stores/useCanvasStore'
import eventBus from '@/core/canvas/CanvasEventBus'

const canvasStore = useCanvasStore()
const selectedObject = ref<any>(null)
const objLeft = ref(0)
const objTop = ref(0)
const objWidth = ref(0)
const objHeight = ref(0)
const objAngle = ref(0)
const objOpacity = ref(1)

function updateSelection() {
  const canvas = canvasStore.canvasInstance
  if (!canvas) return
  const obj = canvas.getActiveObject()
  if (!obj) { selectedObject.value = null; return }
  selectedObject.value = obj
  objLeft.value = Math.round(obj.left || 0)
  objTop.value = Math.round(obj.top || 0)
  objWidth.value = Math.round((obj.width || 0) * (obj.scaleX || 1))
  objHeight.value = Math.round((obj.height || 0) * (obj.scaleY || 1))
  objAngle.value = Math.round(obj.angle || 0)
  objOpacity.value = obj.opacity ?? 1
}

function clearSelection() {
  selectedObject.value = null
}

onMounted(() => {
  eventBus.on('selection:created', updateSelection)
  eventBus.on('selection:updated', updateSelection)
  eventBus.on('selection:cleared', clearSelection)
  eventBus.on('object:modified', updateSelection)
})

onUnmounted(() => {
  eventBus.off('selection:created', updateSelection)
  eventBus.off('selection:updated', updateSelection)
  eventBus.off('selection:cleared', clearSelection)
  eventBus.off('object:modified', updateSelection)
})

function updateProperty(prop: string, value: any) {
  if (!selectedObject.value) return
  selectedObject.value.set(prop, value)
  canvasStore.canvasInstance?.renderAll()
}

function updateWidth(val: number | undefined) {
  if (!selectedObject.value || val === undefined || val < 1) return
  const scaleX = val / (selectedObject.value.width || 1)
  selectedObject.value.set('scaleX', scaleX)
  canvasStore.canvasInstance?.renderAll()
}

function updateHeight(val: number | undefined) {
  if (!selectedObject.value || val === undefined || val < 1) return
  const scaleY = val / (selectedObject.value.height || 1)
  selectedObject.value.set('scaleY', scaleY)
  canvasStore.canvasInstance?.renderAll()
}
</script>

<style scoped lang="scss">
.property-panel {
  height: 100%;

  &__content {
    padding: 0;
  }

  &__empty {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: $text-secondary;
    font-size: $font-size-sm;
  }
}

.prop-grid {
  display: grid;
  grid-template-columns: 56px 1fr;
  gap: 6px 8px;
  align-items: center;

  label {
    font-size: $font-size-xs;
    color: $text-primary;
    text-align: right;
  }

  .el-input-number {
    width: 100%;
  }
}
</style>
