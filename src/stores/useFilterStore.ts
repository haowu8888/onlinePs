import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { AppliedFilter } from '@/types/filter'

export const useFilterStore = defineStore('filter', () => {
  const currentFilter = ref<string | null>(null)
  const filterParams = ref<Record<string, number>>({})
  const appliedFilters = ref<AppliedFilter[]>([])
  const previewEnabled = ref(true)

  function selectFilter(filterId: string) {
    currentFilter.value = filterId
    filterParams.value = {}
  }

  function setFilterParam(key: string, value: number) {
    filterParams.value[key] = value
  }

  function applyFilter() {
    if (!currentFilter.value) return
    appliedFilters.value.push({
      filterId: currentFilter.value,
      params: { ...filterParams.value },
    })
    currentFilter.value = null
    filterParams.value = {}
  }

  function removeFilter(index: number) {
    appliedFilters.value.splice(index, 1)
  }

  function clearFilters() {
    appliedFilters.value = []
    currentFilter.value = null
    filterParams.value = {}
  }

  function togglePreview() {
    previewEnabled.value = !previewEnabled.value
  }

  return {
    currentFilter,
    filterParams,
    appliedFilters,
    previewEnabled,
    selectFilter,
    setFilterParam,
    applyFilter,
    removeFilter,
    clearFilters,
    togglePreview,
  }
})
