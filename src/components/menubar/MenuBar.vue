<template>
  <div class="menubar">
    <MenuFile />
    <MenuEdit />
    <MenuImage />
    <MenuLayer />
    <MenuFilter />
    <MenuView />
    <MenuHelp />
  </div>
</template>

<script setup lang="ts">
import MenuFile from './MenuFile.vue'
import MenuEdit from './MenuEdit.vue'
import MenuImage from './MenuImage.vue'
import MenuLayer from './MenuLayer.vue'
import MenuFilter from './MenuFilter.vue'
import MenuView from './MenuView.vue'
import MenuHelp from './MenuHelp.vue'
</script>

<style scoped lang="scss">
.menubar {
  display: flex;
  align-items: center;
  height: 100%;
  background: $bg-darker;
  border-bottom: 1px solid $border-color;
  padding: 0 4px;
  gap: 0;
}
</style>
