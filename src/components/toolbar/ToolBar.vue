<template>
  <div class="toolbar">
    <div class="toolbar__tools">
      <template v-for="(group, groupIdx) in TOOL_SLOT_GROUPS" :key="groupIdx">
        <div class="toolbar__group">
          <ToolButton
            v-for="slot in group"
            :key="slot.id"
            :tool-id="toolStore.slotActiveTool[slot.id]"
            :active="isSlotActive(slot)"
            :has-sub-tools="slot.tools.length > 1"
            @click="toolStore.setTool(toolStore.slotActiveTool[slot.id])"
            @open-flyout="(rect) => openFlyout(slot, rect)"
          />
        </div>
      </template>
    </div>
    <div class="toolbar__bottom">
      <ColorSelector />
      <QuickMaskButton />
    </div>

    <ToolFlyout
      :tools="flyoutTools"
      :position="flyoutPosition"
      :visible="flyoutVisible"
      :current-tool="toolStore.currentTool"
      @select="onFlyoutSelect"
      @close="closeFlyout"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { TOOL_SLOT_GROUPS } from '@/constants/tools'
import type { ToolSlot } from '@/constants/tools'
import type { ToolEnum } from '@/constants/tools'
import { useToolStore } from '@/stores/useToolStore'
import ToolButton from './ToolButton.vue'
import ToolFlyout from './ToolFlyout.vue'
import ColorSelector from './ColorSelector.vue'
import QuickMaskButton from './QuickMaskButton.vue'

const toolStore = useToolStore()

// Flyout state
const flyoutVisible = ref(false)
const flyoutSlotId = ref<string | null>(null)
const flyoutTools = ref<ToolEnum[]>([])
const flyoutPosition = reactive({ top: 0, left: 0 })

function isSlotActive(slot: ToolSlot): boolean {
  return slot.tools.includes(toolStore.currentTool)
}

function openFlyout(slot: ToolSlot, rect: { top: number; right: number }) {
  if (slot.tools.length <= 1) return

  flyoutPosition.top = rect.top
  flyoutPosition.left = rect.right + 2

  flyoutSlotId.value = slot.id
  flyoutTools.value = slot.tools
  flyoutVisible.value = true
}

function onFlyoutSelect(toolId: ToolEnum) {
  if (flyoutSlotId.value) {
    toolStore.setSlotTool(flyoutSlotId.value, toolId)
  }
  closeFlyout()
}

function closeFlyout() {
  flyoutVisible.value = false
  flyoutSlotId.value = null
}
</script>

<style scoped lang="scss">
.toolbar {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  background: $bg-darker;
  border-right: 1px solid $border-color;
  padding: 4px 0;
  overflow-y: auto;
  overflow-x: hidden;

  &__tools {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0;
  }

  &__group {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 2px 0;
    border-bottom: 1px solid $border-color;

    &:last-child {
      border-bottom: none;
    }
  }

  &__bottom {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 4px 0;
    border-top: 1px solid $border-color;
  }
}
</style>
