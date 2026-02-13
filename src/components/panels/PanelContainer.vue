<template>
  <div class="panel-container">
    <el-tabs v-model="activeTab" class="panel-tabs">
      <el-tab-pane label="修图" name="enhance">
        <EnhancePanel />
      </el-tab-pane>
      <el-tab-pane label="属性" name="property">
        <PropertyPanel />
      </el-tab-pane>
      <el-tab-pane label="图层" name="layers">
        <LayerPanel />
      </el-tab-pane>
      <el-tab-pane label="历史" name="history">
        <HistoryPanel />
      </el-tab-pane>
      <el-tab-pane label="滤镜" name="filters">
        <FilterPanel />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import PropertyPanel from './PropertyPanel.vue'
import LayerPanel from './LayerPanel.vue'
import HistoryPanel from './HistoryPanel.vue'
import FilterPanel from './FilterPanel.vue'
import EnhancePanel from './EnhancePanel.vue'

const activeTab = ref('enhance')
</script>

<style scoped lang="scss">
.panel-container {
  height: 100%;
  background: $bg-darker;
  border-left: 1px solid $border-color;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  .panel-tabs {
    height: 100%;
    display: flex;
    flex-direction: column;

    :deep(.el-tabs__header) {
      margin: 0;
      background: $bg-dark;
      border-bottom: 1px solid $border-color;

      .el-tabs__item {
        height: 32px;
        line-height: 32px;
        font-size: $font-size-sm;
        padding: 0 14px;
        letter-spacing: 0.5px;
      }
    }

    :deep(.el-tabs__content) {
      flex: 1;
      overflow: hidden;

      .el-tab-pane {
        height: 100%;
        overflow-y: auto;
      }
    }
  }
}
</style>
