<template>
  <el-dialog v-model="visible" title="新建画布" width="400px" :close-on-click-modal="false">
    <el-form :model="form" label-width="80px">
      <el-form-item label="名称">
        <el-input v-model="form.name" placeholder="未命名" />
      </el-form-item>
      <el-form-item label="宽度">
        <el-input-number v-model="form.width" :min="1" :max="10000" />
        <span class="unit">px</span>
      </el-form-item>
      <el-form-item label="高度">
        <el-input-number v-model="form.height" :min="1" :max="10000" />
        <span class="unit">px</span>
      </el-form-item>
      <el-form-item label="背景色">
        <el-color-picker v-model="form.bgColor" />
      </el-form-item>
      <el-form-item label="预设">
        <el-select v-model="preset" @change="applyPreset" placeholder="选择预设">
          <el-option label="自定义" value="" />
          <el-option label="1920×1080 (Full HD)" value="1920x1080" />
          <el-option label="1280×720 (HD)" value="1280x720" />
          <el-option label="800×600" value="800x600" />
          <el-option label="1080×1080 (正方形)" value="1080x1080" />
          <el-option label="A4 (2480×3508)" value="2480x3508" />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="create">创建</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

const visible = defineModel<boolean>({ default: false })
const emit = defineEmits<{
  create: [{ name: string; width: number; height: number; bgColor: string }]
}>()

const preset = ref('')

const form = reactive({
  name: '未命名',
  width: 1200,
  height: 800,
  bgColor: '#ffffff',
})

function applyPreset(val: string) {
  if (!val) return
  const [w, h] = val.split('x').map(Number)
  form.width = w
  form.height = h
}

function create() {
  emit('create', { ...form })
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
