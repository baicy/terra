<template>
  <v-sheet
    class="pl-4 h-100"
    :style="{ '--header-height': `${tabHeaderHeight}px` }"
  >
    <div class="text-body-1 text-secondary tab-header d-flex">
      <span>按照活动顺序倒序排列</span>
    </div>
    <div
      class="d-flex flex-column align-content-start material-list"
      :style="{ '--cell-size': `${materialCellSize}px` }"
    >
      <div class="d-flex material-list-header">
        <div class="material-list-name-col border border-primary" />
        <div
          v-for="mat in matList"
          :key="mat"
          class="material-list-material-col border border-primary"
          :class="{
            'material-list-cell-active': currentLog.drop.includes(mat),
            'material-list-cell-selection': selectedMaterial.has(mat),
          }"
          @click="selectMaterial(mat)"
        >
          <v-img :src="`./material/${mat}.png`" class="cursor-pointer" />
        </div>
      </div>
      <div
        ref="droplineRef"
        class="d-flex flex-column overflow-auto material-list-content"
      >
        <div v-for="log in logList" :key="log.id" class="d-flex">
          <div
            class="material-list-name-col border border-primary d-flex flex-column"
            :class="{
              'material-list-cell-active': log.id === currentLog.id,
              'material-list-cell-selection': selectedActivity === log.id,
            }"
            @click="selectActivity(log)"
          >
            <span class="text-body-2">
              {{ log.name }}
              <v-chip
                v-if="currentLog.active && currentLog.id === log.id"
                size="small"
                class="bg-warning text-secondary"
              >
                开放中
              </v-chip>
            </span>
            <span class="text-caption">
              {{
                log.fake
                  ? `预计 ${dayjs(log.start).format("YYYY-MM")}`
                  : dayjs(log.start).format("YYYY-MM-DD")
              }}
            </span>
          </div>
          <div
            v-for="mat in matList"
            :key="mat"
            class="material-list-material-col border border-primary position-relative"
            :class="{
              'material-list-cell-active': log.id === currentLog.id,
              'material-list-cell-selection':
                selectedMaterial.has(mat) || selectedActivity === log.id,
            }"
            @click="selectMaterial(mat)"
          >
            <v-img
              v-if="log.drop.includes(mat)"
              :src="`./material/${mat}.png`"
              class="cursor-pointer"
            />
            <div
              class="material-list-infinity-material position-absolute top-0 right-0"
              v-if="log.infinity && log.infinity.includes(mat)"
            >
              <v-img :src="`./material/${mat}.png`" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </v-sheet>
</template>

<script lang="ts" setup>
import dayjs from 'dayjs'
import logs from '@/data/logs.json'

const tabHeaderHeight = 60
const materialCellSize = 50

let nearestLog = null
let currentLog = null
const logList = logs.filter((a) => a.drop)
const MATERIAL_SIZE = 18
const matList = reactive(new Set())
for (const i in logList) {
  const { start, days, drop } = logList[i]
  const now = dayjs()
  const actStart = dayjs(start)
  const actEnd = actStart.add(days, 'day').subtract(12, 'hour')
  if (actStart.isAfter(now)) {
    nearestLog = { ...logList[i], index: i, active: false }
  } else {
    if (!currentLog) {
      if (actEnd.isAfter(now)) {
        currentLog = { ...logList[i], index: i, active: true }
      } else {
        currentLog = nearestLog
        for (const j in nearestLog.drop) {
          matList.add(nearestLog.drop[j])
        }
      }
    }
    for (const j in drop) {
      matList.add(drop[j])
    }
    if (matList.size >= MATERIAL_SIZE) break
  }
}
const selectedMaterial = reactive(new Set())
const selectMaterial = (mat) => {
  if (selectedMaterial.has(mat)) {
    selectedMaterial.delete(mat)
  } else {
    selectedMaterial.add(mat)
  }
}
const selectedActivity = ref('')
const selectActivity = (act) => {
  if (selectedActivity.value === act.id) {
    selectedActivity.value = ''
    act.drop.forEach((mat) => selectedMaterial.delete(mat))
  } else {
    selectedActivity.value = act.id
    selectedMaterial.clear()
    act.drop.forEach((mat) => selectedMaterial.add(mat))
  }
}

const droplineRef = ref()
onMounted(() => {
  nextTick(() => (droplineRef.value.scrollTop = materialCellSize * (currentLog.index - 1)))
})
</script>
<style scoped lang="sass">
  .material-list
    height: calc(100% - var(--header-height))
    &-header
      height: var(--cell-size);
    &-content
      height: calc(100% - var(--cell-size))
    &-cell-active
      background: rgba(var(--v-theme-success), 0.35)
    &-cell-selection
      background: rgba(var(--v-theme-primary), 0.35) !important
    &-name-col
      width: 220px
      height: var(--cell-size)
      cursor: pointer
    &-material-col
      width: var(--cell-size)
      height: var(--cell-size)
    &-infinity-material
      --infinity-material-size: 24px
      width: var(--infinity-material-size)
      height: var(--infinity-material-size)
</style>
