<script setup>
// import { sets, drops } from '@/data/furnitures.json'
// import { watch } from 'vue'
import _retros from '@/data/retros.json'
import { ato } from '@/utils/utils'
// import { useSystemStore } from '@/stores/system'

const { activity } = defineProps({
  activity: {
    type: Object,
    default() {
      return {}
    }
  }
})

const retros = ato(_retros, 'id')
const act = ref()

function getInfo() {
  if (activity.type === 'sidestory') {
    act.value = retros[activity.id]
  } else if (activity.type === 'rerun') {
    act.value = _retros.find((v) => v.reid === activity.id)
  }
}

getInfo()

const typeLabels = {
  SIDESTORY: '别传',
  BRANCHLINE: '插曲',
  MINISTORY: '故事集'
}

// const system = useSystemStore()
// watch(system.infoDialog, (cur) => {
//   console.log('change', cur)
//   getInfo()
// })
</script>
<template>
  <v-card class="h-100">
    <!-- {{ act }} -->
    <v-card-text class="d-flex justify-space-between">
      <div class="d-flex ga-2">
        <v-chip v-if="act.linkage" color="error" variant="flat">联动</v-chip>
        <v-chip color="primary" variant="flat">
          {{ typeLabels[act.type] }}
        </v-chip>
        <div class="text-h5">{{ act.name }}</div>
      </div>
      <div class="text-h5 d-flex ga-5 flex-column align-end">
        <div>{{ act.first.substring(0, 10) }}</div>
        <div v-if="act.rerun || !act.linkage" class="d-flex ga-2 align-end">
          <template v-if="act.rerun">
            <v-chip variant="flat" color="primary">复刻</v-chip>
            <div>{{ act.rerun.substring(0, 10) }}</div>
          </template>
          <v-chip v-else color="error">暂未复刻</v-chip>
        </div>
        <div v-if="!act.linkage" class="d-flex ga-2 align-end">
          <template v-if="act.trail">
            <v-chip variant="flat" color="primary">修复</v-chip>
            <div>{{ act.trail.substring(0, 10) }}</div>
          </template>
          <v-chip v-else color="error">暂未修复</v-chip>
        </div>
      </div>
    </v-card-text>
    <!-- <v-card-text v-if="!act.linkage || act.rerun">
      <div v-if="act.rerun" class="d-flex align-end">
        <v-btn variant="text">{{ act.name }}·复刻</v-btn>
        <div class="text-button">{{ act.rerun }}</div>
      </div>
      <div v-else>
        <v-chip color="error" variant="flat">未复刻</v-chip>
      </div>
    </v-card-text>
    <v-card-text v-if="!act.linkage">
      <div>修复：{{ act.trail }}</div>
    </v-card-text> -->
  </v-card>
</template>
