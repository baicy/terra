<script setup>
import { useCharacterStore } from '@/stores/character'
import { useSystemStore } from '@/stores/system'
import dayjs from 'dayjs'

// eslint-disable-next-line vue/require-default-prop
const { pool } = defineProps({ pool: Object })
const charStore = useCharacterStore()
const operators = charStore.list
const operatorArray = Object.values(operators)
const poolInfo = []
const puInfo = { r6: [], r5: [], r4: [], r3: [] }
const { type, start } = pool
for (const i in pool.pickup) {
  const { rarity, chars } = pool.pickup[i]
  const info = { ...pool.pickup[i] }
  if (rarity === 6) {
    if (['fes', 'spring', 'summer'].includes(type)) {
      info.chance = 35
      poolInfo.push(info)
      const limits = operatorArray.filter(
        (c) =>
          c.source === type &&
          dayjs(start).diff(dayjs(c.onlineTime), 'month') > 8
      )
      const weightLimits = limits.splice(0, 3)
      const normals = operatorArray.filter(
        (c) =>
          c.rarity === 6 &&
          c.type === '' &&
          dayjs(c.onlineTime).isBefore(dayjs(start)) &&
          (!c.classicTime || dayjs(c.classicTime).isAfter(dayjs(start)))
      )
      // console.log(weightLimits.map((v) => v.name))
      // console.log(limits.map((v) => v.name))
      // console.log(normals.map((v) => v.name))
      const chance =
        30 / (5 * weightLimits.length + limits.length + normals.length)
      poolInfo.push({
        rarity: 6,
        chars: weightLimits.map((c) => c.id),
        chance: 5 * chance
      })
      poolInfo.push({ rarity: 6, chars: limits.map((c) => c.id), chance })
    } else {
      if (['joint', 'mainline'].includes(type)) {
        info.chance = 100 / chars.length
      } else if (['special'].includes(type)) {
        info.chance = 100 / 3
      } else if (
        ['classic'].includes(type) &&
        pool.pickup[i].chars.length > 2
      ) {
        info.chance = 50 / 2
      } else {
        info.chance = 50 / chars.length
      }
      poolInfo.push(info)
      const others = operatorArray
        .filter(
          (c) =>
            c.rarity === 6 &&
            c.type === '' &&
            dayjs(c.onlineTime).isBefore(dayjs(start)) &&
            (!c.classicTime || dayjs(c.classicTime).isAfter(dayjs(start)))
        )
        .map((v) => v.id)
      puInfo.r6 = [
        { chars, chance: 50 },
        { chars: others, chance: 100 }
      ]
    }
  }
  if (rarity === 5) {
    if (['joint'].includes(type)) {
      info.chance = 100 / chars.length
    } else if (['special'].includes(type)) {
      info.chance = 50 / 3
    } else if (['classic'].includes(type) && pool.pickup[i].chars.length > 2) {
      info.chance = 50 / 3
    } else {
      info.chance = 50 / chars.length
    }
    poolInfo.push(info)
    const others = operatorArray
      .filter(
        (c) =>
          c.rarity === 5 &&
          c.type === '' &&
          dayjs(c.onlineTime).isBefore(dayjs(start)) &&
          (!c.classicTime || dayjs(c.classicTime).isAfter(dayjs(start)))
      )
      .map((v) => v.id)
    puInfo.r5 = [
      { chars, chance: 50 },
      { chars: others, chance: 100 }
    ]
  }
  if (rarity === 4) {
    info.chance = 50 / chars.length
    poolInfo.push(info)
    const others = operatorArray
      .filter(
        (c) =>
          c.rarity === 4 &&
          c.type === '' &&
          dayjs(c.onlineTime).isBefore(dayjs(start))
      )
      .map((v) => v.id)
    puInfo.r4 = [
      { chars, chance: 50 },
      { chars: others, chance: 100 }
    ]
  }
}
if (!puInfo.r4.length) {
  const alls = operatorArray
    .filter(
      (c) =>
        c.rarity === 4 &&
        c.type === '' &&
        dayjs(c.onlineTime).isBefore(dayjs(start))
    )
    .map((v) => v.id)
  puInfo.r4 = [{ chars: alls, chance: 100 }]
}
if (!puInfo.r3.length) {
  const alls = operatorArray
    .filter(
      (c) =>
        c.rarity === 3 &&
        c.type === '' &&
        dayjs(c.onlineTime).isBefore(dayjs(start))
    )
    .map((v) => v.id)
  puInfo.r3 = [{ chars: alls, chance: 100 }]
}

const system = useSystemStore()
const showOperator = (char) => {
  if (operators[char]) {
    system.operatorDialog.open = true
    system.operatorDialog.char = operators[char]
  }
}
</script>
<template>
  <div class="w-100 h-100 d-flex ga-2">
    <div class="d-flex flex-column">
      <div>
        <span class="text-h6">{{ pool.name }}</span>
      </div>
      <div class="d-flex flex-column pb-5">
        <span>{{ pool.start }}</span>
        <span>~</span>
        <span>
          {{
            dayjs(pool.start)
              .add(pool.days, 'day')
              .hour(4)
              .format('YYYY-MM-DD HH:mm')
          }}
        </span>
      </div>
      <div
        v-if="['attain', 'cattain'].includes(pool.type)"
        class="d-flex flex-column ga-2 w-33"
      >
        <div>首次获得的6星干员必定为以下干员之一（仅限一次）</div>
        <div class="d-flex flex-wrap ga-1">
          <span v-for="char in pool.pickup[0].chars" :key="char" class="w120">
            {{ operators[char].name }}
          </span>
        </div>
      </div>
      <div v-else>
        <div
          v-for="(up, index) in poolInfo"
          :key="index"
          class="d-flex flex-column"
        >
          <div>
            <v-icon
              v-for="i in up.rarity"
              :key="i"
              icon="mdi-star"
              size="xsmall"
            />
          </div>
          <div class="d-flex ga-3">
            <div>{{ up.chance ? up.chance.toFixed(2) : 50 }}%</div>
            <div class="d-flex ga-1 flex-wrap">
              <span
                v-for="char in up.chars"
                :key="char"
                :class="{ 'linked-tag': operators[char] }"
                @click="showOperator(char)"
              >
                {{ operators[char] ? operators[char].name : char }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.linked-tag:hover {
  cursor: pointer;
  color: rgb(var(--v-theme-primary));
}
</style>
