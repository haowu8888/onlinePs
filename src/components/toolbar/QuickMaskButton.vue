<template>
  <div
    class="quick-mask-btn"
    :class="{ 'quick-mask-btn--active': editorStore.quickMaskActive }"
    :title="editorStore.quickMaskActive ? '退出快速蒙版 (Q)' : '快速蒙版模式 (Q)'"
    @click="editorStore.toggleQuickMask()"
  >
    <el-icon :size="18">
      <View />
    </el-icon>
  </div>
</template>

<script setup lang="ts">
import { useEditorStore } from '@/stores/useEditorStore'
import { View } from '@element-plus/icons-vue'

const editorStore = useEditorStore()
</script>

<style scoped lang="scss">
.quick-mask-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 4px;
  color: $text-secondary;
  transition: all 0.15s ease;
  margin-top: 4px;

  &:hover {
    background: $bg-lighter;
    color: $text-primary;
  }

  &--active {
    background: rgba(255, 0, 0, 0.2);
    color: #ff4444;

    &:hover {
      background: rgba(255, 0, 0, 0.3);
      color: #ff4444;
    }
  }
}
</style>
