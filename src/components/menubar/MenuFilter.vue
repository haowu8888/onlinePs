<template>
  <el-dropdown trigger="click" @command="handleCommand" :teleported="true">
    <span class="menu-trigger">滤镜</span>
    <template #dropdown>
      <el-dropdown-menu>
        <template v-for="group in FILTER_MENU" :key="group.label">
          <el-dropdown-item v-if="!group.children" :command="group.action">
            {{ group.label }}
          </el-dropdown-item>
          <template v-else>
            <div class="menu-group-title">{{ group.label }}</div>
            <el-dropdown-item
              v-for="child in group.children"
              :key="child.label"
              :command="child.action"
              class="menu-sub-item"
            >
              {{ child.label }}
            </el-dropdown-item>
          </template>
        </template>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
import { FILTER_MENU } from '@/constants/menu'
import { useFilterStore } from '@/stores/useFilterStore'

const filterStore = useFilterStore()

function handleCommand(action: string) {
  const filterId = action?.replace('filter-', '')
  if (filterId) {
    filterStore.selectFilter(filterId)
  }
}
</script>

<style scoped lang="scss">
.menu-group-title {
  padding: 4px 12px;
  font-size: $font-size-xs;
  color: $text-muted;
  text-transform: uppercase;
}

.menu-sub-item {
  padding-left: 24px !important;
}
</style>
