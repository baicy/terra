<script setup>
import { sets, drops } from '@/data/furnitures.json'
import _retros from '@/data/retros.json'
import { ato } from '@/utils/utils'

const retros = ato(_retros, 'id')
const tab = ref('history')
</script>
<template>
  <v-sheet class="h-100 d-flex ga-2">
    <v-sheet
      v-for="set in [sets[0], sets[1]]"
      :key="set.id"
      elevation="6"
      class="pa-4 w400"
    >
      <div class="d-flex align-end">
        <div class="text-h6">{{ set.name }}</div>
        <div class="text-subtitle-1 ml-2">{{ set.begin }} ~ {{ set.end }}</div>
      </div>
      <div class="d-flex flex-column ga-2">
        <v-sheet
          v-for="group in set.groups"
          :key="group.name"
          class="d-flex pa-1 h120 align-center"
          elevation="5"
        >
          <div class="w80 text-center">{{ group.name }}</div>
          <div class="w50 text-center">
            <v-chip
              v-if="group.drop"
              size="small"
              color="primary"
              variant="flat"
            >
              {{ group.drop }}
            </v-chip>
          </div>
          <div class="d-flex flex-column px-1">
            <div
              v-for="furni in group.furnitures"
              :key="furni"
              class="text-body-2"
            >
              {{ furni }}
            </div>
          </div>
        </v-sheet>
      </div>
    </v-sheet>
    <v-sheet class="w-100 h-100" elevation="6">
      <v-tabs v-model="tab" color="primary">
        <v-tab value="history">历史主题</v-tab>
        <v-tab value="stage">掉落关卡</v-tab>
      </v-tabs>
      <v-tabs-window v-model="tab" style="height: calc(100% - 30px)">
        <v-tabs-window-item value="history" class="h-100">
          <v-sheet class="h-100 overflow-auto pa-2">
            <v-sheet
              v-for="set in sets"
              :key="set.id"
              elevation="4"
              class="pa-2 mb-1"
            >
              <div class="d-flex align-end justify-space-between">
                <div class="text-body-1">{{ set.name }}</div>
                <div class="text-body-2 ml-1">
                  {{ set.begin }} ~ {{ set.end }}
                </div>
              </div>
              <div class="d-flex flex-wrap ga-2">
                <v-btn
                  v-for="s in set.ss"
                  :key="s"
                  :color="retros[s].linkage ? 'error' : 'primary'"
                  :variant="retros[s].rerun ? 'text' : 'flat'"
                  size="small"
                >
                  {{ retros[s].name }}
                </v-btn>
              </div>
            </v-sheet>
          </v-sheet>
        </v-tabs-window-item>
        <v-tabs-window-item value="stage" class="h-100">
          <v-sheet class="h-100 overflow-auto pa-2">
            <v-sheet
              v-for="(stages, group) in drops"
              :key="group"
              elevation="4"
              class="pa-2 mb-1 d-flex"
            >
              <div class="text-body-1 w25">{{ group }}</div>
              <div class="d-flex flex-wrap ga-1">
                <v-btn
                  v-for="level in stages.flat()"
                  :key="level"
                  size="small"
                  :variant="
                    ['1-7', 'R8-11', '12-17'].includes(level) ? 'flat' : 'tonal'
                  "
                  width="60px"
                >
                  {{ level }}
                </v-btn>
              </div>
            </v-sheet>
          </v-sheet>
        </v-tabs-window-item>
      </v-tabs-window>
    </v-sheet>
  </v-sheet>
</template>
