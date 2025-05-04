<template>
  <v-app>
    <router-view />
    <v-dialog
      v-model="infoDialog.open"
      fullscreen
      transition="dialog-bottom-transition"
    >
      <v-sheet class="position-relative">
        <div class="position-absolute top-0 left-0">
          <v-btn
            icon="mdi-close"
            color="error"
            @click="infoDialog.open = false"
          />
        </div>
        <v-sheet class="w-100 h-100 pa-15">
          <pool-info
            v-if="infoDialog.type === 'pool'"
            :pool="infoDialog.item"
          />
          <activity-info
            v-if="infoDialog.type === 'activity'"
            :activity="infoDialog.item"
          />
        </v-sheet>
      </v-sheet>
    </v-dialog>
    <v-dialog
      v-model="operatorDialog.open"
      fullscreen
      transition="dialog-bottom-transition"
    >
      <v-sheet class="position-relative">
        <div class="position-absolute top-0 left-0">
          <v-btn
            icon="mdi-close"
            color="error"
            @click="operatorDialog.open = false"
          />
        </div>
        <v-sheet class="w-100 h-100 pa-15">
          <operator-info :char="operatorDialog.char" />
        </v-sheet>
      </v-sheet>
    </v-dialog>
  </v-app>
</template>

<script setup>
import { useSystemStore } from '@/stores/system'
const system = useSystemStore()
const infoDialog = computed(() => system.infoDialog)
const operatorDialog = computed(() => system.operatorDialog)
</script>
<style lang="sass">
html
  overflow: auto
</style>
