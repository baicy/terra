<script setup>
import { ref } from 'vue'
import dayjs from 'dayjs'
import { useRouter } from 'vue-router'
import { useCharacterStore } from '@/stores/character'
import { useSystemStore } from '@/stores/system'
import _retros from '@/data/retros.json'
import { ato } from '@/utils/utils'

const operators = useCharacterStore().list
const system = useSystemStore()
const retros = ato(_retros, 'id')

// eslint-disable-next-line vue/require-default-prop
const { affair } = defineProps({ affair: Object })
const {
  name,
  title,
  start,
  days = 14,
  type,
  rerun,
  color = [],
  pickup,
  reward,
  drop,
  fake
} = affair
const isActive = ref(
  dayjs().isBefore(
    dayjs(start).add(days, 'day').hour(4).minute(0).second(0).millisecond(0)
  ) && dayjs().isAfter(dayjs(start))
)
const affairType = [
  'single',
  'rerun',
  'fes',
  'spring',
  'summer',
  'linkage',
  'joint',
  'mainline',
  'special',
  'attain',
  'cattain',
  'standard',
  'classic'
].includes(type)
  ? 'pool'
  : 'activity'

const router = useRouter()
const viewMaterialList = (material) => {
  router.push({
    path: '/material'
  })
  system.selectedMaterial = material
}

const showOperator = (char) => {
  if (operators[char]) {
    system.operatorDialog.open = true
    system.operatorDialog.char = operators[char]
  }
}
const showPool = (pool) => {
  if (affairType === 'pool') {
    system.infoDialog.open = true
    system.infoDialog.type = 'pool'
    system.infoDialog.item = pool
  }
}
</script>
<template>
  <v-sheet
    :elevation="isActive ? 5 : 1"
    class="position-absolute bg-transparent border"
    :class="{ 'opacity-60': !isActive }"
  >
    <div
      class="w-100 h-100 pt-1"
      :class="{ 'pl-2': !['LIVE', 'DEV'].includes(type) }"
      :style="{
        borderLeft: `${['LIVE', 'DEV'].includes(type) ? 0 : 15}px solid ${color[0] || '#0198dd'}`,
        background: `${['LIVE', 'DEV'].includes(type) ? color[0] : 'transparent'}`
      }"
    >
      <div
        v-if="type === 'LIVE'"
        class="h-100 d-flex flex-column align-center justify-center"
      >
        <span class="text-white" style="font-size: 10px; font-weight: bold">
          LIVE
        </span>
        <a href="https://live.bilibili.com/5555734" target="_blank">
          <v-icon icon="mdi-arrow-right" color="#ffffff" />
        </a>
      </div>
      <div
        v-if="type === 'DEV'"
        class="h-100 d-flex flex-column align-center justify-center"
      >
        <div class="text-white" style="font-size: 10px; font-weight: bold">
          DEV
        </div>
        <div class="text-white" style="font-size: 13px">
          #{{ affair.number }}
        </div>
      </div>
      <div v-if="name" class="d-flex">
        <span v-if="fake">(疑)</span>
        <span
          :class="{ 'linked-tag': affairType === 'pool' }"
          @click="showPool(affair)"
        >
          {{ name }}{{ rerun ? '·复刻' : '' }}
        </span>
        <v-chip
          v-if="affair.linkage"
          size="small"
          class="ml-2"
          variant="flat"
          color="error"
        >
          联动
        </v-chip>
        <v-chip
          v-if="
            !isActive &&
            affair.retro &&
            (retros[affair.retro].trail || retros[affair.retro].rerun)
          "
          size="small"
          class="ml-2"
          variant="flat"
          :color="retros[affair.retro].trail ? 'success' : 'warning'"
        >
          <span v-if="retros[affair.retro].trail">已修复</span>
          <span v-else-if="retros[affair.retro].rerun">已复刻</span>
        </v-chip>
      </div>
      <div
        v-if="affairType === 'pool' && pickup[0].chars.length < 7"
        class="d-flex ga-2"
      >
        <span
          v-for="char in pickup[0].chars"
          :key="char"
          :class="{ 'linked-tag': operators[char] }"
          @click="showOperator(char)"
        >
          {{ operators[char] ? operators[char].name : char }}
        </span>
      </div>
      <div v-else-if="reward" class="d-flex ga-2">
        <div
          v-if="reward.type === 'char'"
          :class="{ 'linked-tag': operators[reward.id] }"
          @click="showOperator(reward.id)"
        >
          {{ operators[reward.id] ? operators[reward.id].name : reward.id }}
        </div>
        <div v-else-if="reward.type === 'skin'">
          {{
            operators[reward.id.split('@')[0]]
              ? `${operators[reward.id.split('@')[0]].name} 时装`
              : `${reward.id} 时装`
          }}
        </div>
        <div v-else>
          {{ reward.id }}
        </div>
        <div v-if="drop">/</div>
        <div class="d-flex">
          <div
            v-for="mat in drop"
            :key="mat"
            class="thumb"
            @click="viewMaterialList(mat)"
          >
            <img :src="`material/${mat}.png`" />
          </div>
        </div>
      </div>
      <div v-else-if="title">
        {{ title }}
      </div>
    </div>
  </v-sheet>
</template>
<style scoped>
.thumb {
  --thumb-size: 30px;
  width: var(--thumb-size);
  height: var(--thumb-size);
  cursor: pointer;
  img {
    width: 100%;
  }
}
.linked-tag:hover {
  cursor: pointer;
  color: rgb(var(--v-theme-primary));
}
</style>
