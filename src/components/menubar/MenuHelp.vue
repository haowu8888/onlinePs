<template>
  <el-dropdown trigger="click" @command="handleCommand" :teleported="true">
    <span class="menu-trigger">帮助</span>
    <template #dropdown>
      <el-dropdown-menu>
        <template v-for="item in HELP_MENU" :key="item.label">
          <el-dropdown-item :command="item.action">
            {{ item.label }}
          </el-dropdown-item>
        </template>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
import { HELP_MENU } from '@/constants/menu'
import { ElMessageBox } from 'element-plus'

function handleCommand(action: string) {
  switch (action) {
    case 'about':
      ElMessageBox.alert(
        'OnlinePS - 在线图片编辑器 v1.0.0\n基于 Vue 3 + Fabric.js 构建',
        '关于 OnlinePS',
        { confirmButtonText: '确定' }
      )
      break
    case 'shortcuts-help':
      ElMessageBox.alert(
        `快捷键列表：
V - 移动工具    M - 矩形选区
B - 画笔工具    E - 橡皮擦
T - 文字工具    U - 形状工具
I - 吸管工具    C - 裁剪工具
P - 钢笔工具    G - 渐变工具
Ctrl+Z - 撤销   Ctrl+Shift+Z - 重做
Ctrl+C/V/X - 复制/粘贴/剪切
X - 交换前景/背景色
D - 默认颜色`,
        '快捷键',
        { confirmButtonText: '确定' }
      )
      break
  }
}
</script>

