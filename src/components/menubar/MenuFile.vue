<template>
  <el-dropdown trigger="click" @command="handleCommand" :teleported="true">
    <span class="menu-trigger">文件</span>
    <template #dropdown>
      <el-dropdown-menu>
        <template v-for="item in FILE_MENU" :key="item.label">
          <el-dropdown-item v-if="!item.divider" :command="item.action" :disabled="item.disabled">
            <span class="menu-item-label">{{ item.label }}</span>
            <span v-if="item.shortcut" class="menu-item-shortcut">{{ item.shortcut }}</span>
          </el-dropdown-item>
          <div v-else class="menu-divider" />
        </template>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
import { FILE_MENU } from '@/constants/menu'
import { useEditorStore } from '@/stores/useEditorStore'
import eventBus from '@/core/canvas/CanvasEventBus'

const editorStore = useEditorStore()

function handleCommand(action: string) {
  switch (action) {
    case 'new':
      eventBus.emit('dialog:new-canvas')
      break
    case 'open':
      openFile()
      break
    case 'export':
      eventBus.emit('dialog:export')
      break
  }
}

function openFile() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string
        eventBus.emit('object:added', { type: 'image-import', data: dataUrl, name: file.name })
      }
      reader.readAsDataURL(file)
    }
  }
  input.click()
}
</script>

<style scoped lang="scss">
.menu-trigger {
  padding: 4px 10px;
  cursor: pointer;
  font-size: $font-size-sm;
  color: $text-primary;
  border-radius: 2px;

  &:hover {
    background: $bg-light;
  }
}

.menu-item-label {
  flex: 1;
}

.menu-item-shortcut {
  margin-left: 30px;
  color: $text-muted;
  font-size: $font-size-xs;
}

.menu-divider {
  height: 1px;
  background: $border-color;
  margin: 4px 0;
}

:deep(.el-dropdown-menu__item) {
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-width: 200px;
  padding: 6px 20px;
  font-size: $font-size-sm;
}
</style>
