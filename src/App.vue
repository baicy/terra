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
          <operator-info
            v-if="infoDialog.type === 'char'"
            :char="infoDialog.item"
          />
          <pool-info
            v-if="infoDialog.type === 'pool'"
            :pool="infoDialog.item"
          />
        </v-sheet>
      </v-sheet>
    </v-dialog>
  </v-app>
</template>

<script setup>
import { useSystemStore } from '@/stores/system'
const system = useSystemStore()
const infoDialog = computed(() => system.infoDialog)
</script>
