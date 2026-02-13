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
import { useCanvasStore } from '@/stores/useCanvasStore'
import { ElMessage } from 'element-plus'
import eventBus from '@/core/canvas/CanvasEventBus'

const editorStore = useEditorStore()
const canvasStore = useCanvasStore()

function handleCommand(action: string) {
  switch (action) {
    case 'new':
      eventBus.emit('dialog:new-canvas')
      break
    case 'open':
      openFile()
      break
    case 'save':
      saveProject()
      break
    case 'save-as':
      saveProjectAs()
      break
    case 'export':
      eventBus.emit('dialog:export')
      break
    case 'close':
      closeProject()
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

function saveProject() {
  const canvas = canvasStore.canvasInstance
  if (!canvas) {
    ElMessage.warning('没有画布可保存')
    return
  }
  // Export canvas as JSON and save to localStorage
  const json = canvas.toJSON()
  const projectData = {
    canvas: json,
    width: editorStore.canvasWidth,
    height: editorStore.canvasHeight,
    timestamp: Date.now(),
  }
  try {
    localStorage.setItem('__ps_project', JSON.stringify(projectData))
    editorStore.markClean()
    ElMessage.success('项目已保存')
  } catch {
    ElMessage.error('保存失败，数据过大')
  }
}

function saveProjectAs() {
  const canvas = canvasStore.canvasInstance
  if (!canvas) return
  // Export as PNG download
  const dataUrl = canvas.toDataURL({ format: 'png', multiplier: 1 })
  const link = document.createElement('a')
  link.download = `project_${Date.now()}.png`
  link.href = dataUrl
  link.click()
  ElMessage.success('文件已下载')
}

function closeProject() {
  const canvas = canvasStore.canvasInstance
  if (!canvas) return
  // Clear all objects except background
  const objects = canvas.getObjects().filter((o: any) => o.name !== '__background')
  objects.forEach(obj => canvas.remove(obj))
  canvas.discardActiveObject()
  canvas.renderAll()
  ElMessage.info('画布已清空')
}
</script>

