<template>
  <div class="editor-layout">
    <div class="editor-layout__menubar">
      <MenuBar />
    </div>
    <div class="editor-layout__options-bar">
      <OptionsBar />
    </div>
    <div class="editor-layout__toolbar">
      <ToolBar />
    </div>
    <div class="editor-layout__canvas">
      <CanvasWorkspace />
    </div>
    <div class="editor-layout__panels">
      <PanelContainer />
    </div>
    <div class="editor-layout__statusbar">
      <StatusBar />
    </div>
  </div>
</template>

<script setup lang="ts">
import MenuBar from '@/components/menubar/MenuBar.vue'
import OptionsBar from '@/components/options-bar/OptionsBar.vue'
import ToolBar from '@/components/toolbar/ToolBar.vue'
import CanvasWorkspace from '@/components/canvas/CanvasWorkspace.vue'
import PanelContainer from '@/components/panels/PanelContainer.vue'
import StatusBar from '@/components/statusbar/StatusBar.vue'
</script>

<style scoped lang="scss">
.editor-layout {
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: $toolbar-width 1fr $panel-width;
  grid-template-rows: $menubar-height $options-bar-height 1fr $statusbar-height;
  grid-template-areas:
    "menubar    menubar     menubar"
    "optionsbar optionsbar  optionsbar"
    "toolbar    canvas      panels"
    "statusbar  statusbar   statusbar";
  overflow: hidden;

  &__menubar {
    grid-area: menubar;
    z-index: $z-menubar;
  }

  &__options-bar {
    grid-area: optionsbar;
    z-index: $z-options-bar;
  }

  &__toolbar {
    grid-area: toolbar;
    z-index: $z-toolbar;
  }

  &__canvas {
    grid-area: canvas;
    overflow: hidden;
    position: relative;
  }

  &__panels {
    grid-area: panels;
    z-index: $z-panels;
  }

  &__statusbar {
    grid-area: statusbar;
  }
}
</style>
