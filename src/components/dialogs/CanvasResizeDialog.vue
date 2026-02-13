<template>
  <el-dialog v-model="visible" title="画布大小" width="400px" :close-on-click-modal="false">
    <el-form :model="form" label-width="80px">
      <el-form-item label="宽度">
        <el-input-number v-model="form.width" :min="1" :max="10000" />
        <span class="unit">px</span>
      </el-form-item>
      <el-form-item label="高度">
        <el-input-number v-model="form.height" :min="1" :max="10000" />
        <span class="unit">px</span>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="apply">应用</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import { useEditorStore } from '@/stores/useEditorStore'

const visible = defineModel<boolean>({ default: false })
const emit = defineEmits<{
  resize: [{ width: number; height: number }]
}>()
const editorStore = useEditorStore()

const form = reactive({
  width: editorStore.canvasWidth,
  height: editorStore.canvasHeight,
})

watch(visible, (val) => {
  if (val) {
    form.width = editorStore.canvasWidth
    form.height = editorStore.canvasHeight
  }
})

function apply() {
  emit('resize', { width: form.width, height: form.height })
  visible.value = false
}
</script>

<style scoped lang="scss">
.unit {
  margin-left: 8px;
  color: $text-secondary;
  font-size: $font-size-sm;
}
</style>
