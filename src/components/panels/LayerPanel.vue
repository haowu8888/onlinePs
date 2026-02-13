<template>
  <div class="layer-panel">
    <div class="layer-panel__header">
      <el-select v-model="blendMode" size="small" class="blend-select" placeholder="混合模式">
        <el-option
          v-for="mode in BLEND_MODES"
          :key="mode.value"
          :label="mode.label"
          :value="mode.value"
        />
      </el-select>
      <div class="opacity-control">
        <label>不透明度</label>
        <el-slider v-model="opacity" :min="0" :max="100" :step="1" size="small" />
      </div>
    </div>

    <div class="layer-panel__list">
      <LayerItem
        v-for="layer in layerStore.layers"
        :key="layer.id"
        :layer="layer"
        :active="layer.id === layerStore.activeLayerId"
        @select="layerStore.setActiveLayer(layer.id)"
        @toggle-visibility="toggleVisibility(layer.id)"
        @toggle-lock="toggleLock(layer.id)"
      />
      <div v-if="layerStore.layers.length === 0" class="layer-panel__empty">
        暂无图层
      </div>
    </div>

    <div class="layer-panel__footer">
      <button class="icon-btn" title="新建图层" @click="layerStore.addLayer()">
        <el-icon><Plus /></el-icon>
      </button>
      <button class="icon-btn" title="复制图层" @click="duplicateActive" :disabled="!layerStore.activeLayerId">
        <el-icon><CopyDocument /></el-icon>
      </button>
      <button class="icon-btn" title="删除图层" @click="removeActive" :disabled="!layerStore.activeLayerId">
        <el-icon><Delete /></el-icon>
      </button>
      <button class="icon-btn" title="上移" @click="moveActive('up')" :disabled="!layerStore.activeLayerId">
        <el-icon><ArrowUp /></el-icon>
      </button>
      <button class="icon-btn" title="下移" @click="moveActive('down')" :disabled="!layerStore.activeLayerId">
        <el-icon><ArrowDown /></el-icon>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useLayerStore } from '@/stores/useLayerStore'
import { BLEND_MODES } from '@/constants/blendModes'
import { Plus, CopyDocument, Delete, ArrowUp, ArrowDown } from '@element-plus/icons-vue'
import LayerItem from './LayerItem.vue'

const layerStore = useLayerStore()
const blendMode = ref('source-over')
const opacity = ref(100)

watch(() => layerStore.activeLayer, (layer) => {
  if (layer) {
    blendMode.value = layer.blendMode
    opacity.value = Math.round(layer.opacity * 100)
  } else {
    blendMode.value = 'source-over'
    opacity.value = 100
  }
})

watch(blendMode, (val) => {
  if (layerStore.activeLayerId) {
    layerStore.updateLayer(layerStore.activeLayerId, { blendMode: val })
  }
})

watch(opacity, (val) => {
  if (layerStore.activeLayerId) {
    layerStore.updateLayer(layerStore.activeLayerId, { opacity: val / 100 })
  }
})

function toggleVisibility(id: string) {
  const layer = layerStore.layers.find(l => l.id === id)
  if (layer) layerStore.updateLayer(id, { visible: !layer.visible })
}

function toggleLock(id: string) {
  const layer = layerStore.layers.find(l => l.id === id)
  if (layer) layerStore.updateLayer(id, { locked: !layer.locked })
}

function duplicateActive() {
  if (layerStore.activeLayerId) layerStore.duplicateLayer(layerStore.activeLayerId)
}

function removeActive() {
  if (layerStore.activeLayerId) layerStore.removeLayer(layerStore.activeLayerId)
}

function moveActive(dir: 'up' | 'down') {
  if (layerStore.activeLayerId) layerStore.moveLayer(layerStore.activeLayerId, dir)
}
</script>

<style scoped lang="scss">
.layer-panel {
  display: flex;
  flex-direction: column;
  height: 100%;

  &__header {
    padding: 10px;
    border-bottom: 1px solid $border-color;

    .blend-select {
      width: 100%;
      margin-bottom: 8px;
    }

    .opacity-control {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: $font-size-xs;
      color: $text-primary;

      label {
        white-space: nowrap;
      }

      .el-slider {
        flex: 1;
      }
    }
  }

  &__list {
    flex: 1;
    overflow-y: auto;
  }

  &__empty {
    padding: 24px;
    text-align: center;
    color: $text-secondary;
    font-size: $font-size-sm;
  }

  &__footer {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 8px;
    border-top: 1px solid $border-color;
    background: $bg-dark;
  }
}
</style>
