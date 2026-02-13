<template>
  <div class="filter-panel">
    <div class="filter-panel__categories">
      <div
        v-for="cat in FILTER_CATEGORIES"
        :key="cat.id"
        class="filter-category"
      >
        <div class="filter-category__title">{{ cat.name }}</div>
        <div class="filter-category__list">
          <button
            v-for="filter in filtersByCategory(cat.id)"
            :key="filter.id"
            class="filter-btn"
            :class="{ active: filterStore.currentFilter === filter.id }"
            @click="filterStore.selectFilter(filter.id)"
          >
            {{ filter.name }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="currentFilterConfig" class="filter-panel__params">
      <div class="panel-section__title">{{ currentFilterConfig.name }} 参数</div>
      <div v-for="param in currentFilterConfig.params" :key="param.key" class="filter-param">
        <label>{{ param.label }}</label>
        <el-slider
          :model-value="filterStore.filterParams[param.key] ?? param.default"
          :min="param.min"
          :max="param.max"
          :step="param.step"
          @input="(val: number | number[]) => filterStore.setFilterParam(param.key, Array.isArray(val) ? val[0] : val)"
        />
        <span class="param-value">
          {{ (filterStore.filterParams[param.key] ?? param.default).toFixed(2) }}
        </span>
      </div>

      <div class="filter-panel__actions">
        <el-button size="small" type="primary" @click="applyCurrentFilter">应用</el-button>
        <el-button size="small" @click="filterStore.selectFilter('')">取消</el-button>
      </div>
    </div>

    <div v-if="filterStore.appliedFilters.length" class="filter-panel__applied">
      <div class="panel-section__title">已应用滤镜</div>
      <div
        v-for="(af, index) in filterStore.appliedFilters"
        :key="index"
        class="applied-filter"
      >
        <span>{{ getFilterName(af.filterId) }}</span>
        <button class="icon-btn" @click="filterStore.removeFilter(index)">
          <el-icon><Close /></el-icon>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useFilterStore } from '@/stores/useFilterStore'
import { useCanvasStore } from '@/stores/useCanvasStore'
import { FILTER_LIST, FILTER_CATEGORIES } from '@/constants/filters'
import { Close } from '@element-plus/icons-vue'
import * as fabric from 'fabric'

const filterStore = useFilterStore()
const canvasStore = useCanvasStore()

function filtersByCategory(categoryId: string) {
  return FILTER_LIST.filter(f => f.category === categoryId)
}

const currentFilterConfig = computed(() =>
  FILTER_LIST.find(f => f.id === filterStore.currentFilter)
)

function getFilterName(id: string) {
  return FILTER_LIST.find(f => f.id === id)?.name || id
}

function applyCurrentFilter() {
  const config = currentFilterConfig.value
  if (!config) return

  const canvas = canvasStore.canvasInstance
  if (!canvas) return

  const activeObj = canvas.getActiveObject()
  if (!activeObj) return

  // Only apply filters to image objects
  if (!(activeObj instanceof fabric.FabricImage)) {
    console.warn('滤镜只能应用于图片对象')
    return
  }

  const imgObj = activeObj
  const filterInstance = config.factory(filterStore.filterParams)
  if (!imgObj.filters) imgObj.filters = []
  imgObj.filters.push(filterInstance)
  imgObj.applyFilters()
  canvas.renderAll()

  filterStore.applyFilter()
}
</script>

<style scoped lang="scss">
.filter-panel {
  padding: 10px;

  .filter-category {
    margin-bottom: 12px;

    &__title {
      font-size: $font-size-xs;
      color: $text-secondary;
      margin-bottom: 6px;
      font-weight: 500;
    }

    &__list {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
    }
  }

  .filter-btn {
    padding: 5px 10px;
    font-size: $font-size-xs;
    background: $bg-dark;
    border: 1px solid $border-color;
    color: $text-primary;
    border-radius: 3px;
    cursor: pointer;

    &:hover { background: $bg-light; color: $text-bright; }
    &.active { background: $accent-color; color: $text-bright; border-color: $accent-color; }
  }

  &__params {
    padding: 8px 0;
    border-top: 1px solid $border-color;
  }

  .filter-param {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 6px 0;

    label { font-size: $font-size-xs; color: $text-primary; min-width: 50px; }
    .el-slider { flex: 1; }
    .param-value { font-size: $font-size-xs; color: $text-primary; min-width: 40px; text-align: right; }
  }

  &__actions {
    display: flex;
    gap: 8px;
    margin-top: 8px;
  }

  &__applied {
    padding-top: 8px;
    border-top: 1px solid $border-color;
    margin-top: 8px;
  }

  .applied-filter {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 4px 0;
    font-size: $font-size-xs;
    color: $text-secondary;
  }
}
</style>
