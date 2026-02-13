<template>
  <div class="history-panel">
    <div class="history-panel__list">
      <div
        v-for="(entry, index) in historyStore.historyList"
        :key="entry.id"
        class="history-item"
        :class="{ active: index === 0 }"
        @click="jumpToHistoryIndex(index)"
      >
        <el-icon :size="14"><Clock /></el-icon>
        <span class="history-item__name">{{ entry.name }}</span>
        <span class="history-item__time">{{ formatTime(entry.timestamp) }}</span>
      </div>
      <div v-if="historyStore.historyList.length === 0" class="history-panel__empty">
        暂无历史记录
      </div>
    </div>
    <div class="history-panel__footer">
      <el-button size="small" :disabled="!historyStore.canUndo" @click="historyStore.undo()">
        撤销
      </el-button>
      <el-button size="small" :disabled="!historyStore.canRedo" @click="historyStore.redo()">
        重做
      </el-button>
      <el-button size="small" @click="historyStore.clear()">
        清除
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useHistoryStore } from '@/stores/useHistoryStore'
import { Clock } from '@element-plus/icons-vue'

const historyStore = useHistoryStore()

function jumpToHistoryIndex(displayIndex: number) {
  // historyList is reversed (newest first), so convert to undo stack index
  const undoIndex = historyStore.undoStack.length - 1 - displayIndex
  if (undoIndex >= 0) {
    historyStore.jumpTo(undoIndex)
  }
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}
</script>

<style scoped lang="scss">
.history-panel {
  display: flex;
  flex-direction: column;
  height: 100%;

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
    gap: 6px;
    padding: 8px;
    border-top: 1px solid $border-color;
    background: $bg-dark;
  }
}

.history-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  cursor: pointer;
  font-size: $font-size-sm;
  color: $text-secondary;
  border-bottom: 1px solid rgba($border-color, 0.5);

  &:hover {
    background: $bg-light;
  }

  &.active {
    background: $bg-medium;
    color: $text-bright;
  }

  &__name {
    flex: 1;
  }

  &__time {
    color: $text-muted;
    font-size: $font-size-xs;
  }
}
</style>
