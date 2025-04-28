<script setup>
import { ref, watch } from 'vue'
import { useSystemStore } from '@/stores/system'
import { useCharacterStore } from '@/stores/character'
import dayjs from 'dayjs'
import professions from '@/data/professions'

const dev = import.meta.env.DEV

// eslint-disable-next-line vue/require-default-prop
const { char } = defineProps({ char: Object })
const typeLabel = {
  limited: '限定',
  linkage: '联动',
  linkageActivity: '联动'
}
const limitedLabel = {
  fes: '庆典',
  spring: '春节',
  summer: '夏季'
}

const lastUp = ref('')
const lastShop = ref('')

const system = useSystemStore()

const operators = useCharacterStore().list
const switchOperator = (char) => {
  system.infoDialog.item = char
}
watch(
  system.infoDialog,
  (cur) => {
    if (cur.type === 'char') {
      lastUp.value = (
        (char.pools || []).find((p) => ['shop', 'up'].includes(p.status)) || { start: '' }
      ).start.substring(0, 10)
      lastShop.value = (
        (char.pools || []).find((p) => ['shop'].includes(p.status)) || { start: '' }
      ).start.substring(0, 10)
    }
  },
  { immediate: true, deep: true }
)
</script>
<template>
  <div class="w-100 h-100 d-flex justify-space-between">
    <div class="d-flex flex-column ga-1 text-button">
      <div>
        <v-icon
          v-for="i in char.rarity"
          :key="i"
          icon="mdi-star"
        />
      </div>
      <div class="d-flex ga-2 align-baseline">
        <span class="text-h6">{{ char.name }}</span>
        <v-chip
          v-if="typeLabel[char.type]"
          color="error"
          variant="flat"
        >
          {{ typeLabel[char.type] }}
        </v-chip>
      </div>
      <div>
        {{ professions[char.profession].name }} -
        {{ professions[char.profession].subs[char.subProfession].name }}
      </div>
      <div class="d-flex">
        <span class="w120">上线日期</span>
        <span>
          {{ char.onlineTime.substring(0, 10) }}
          ({{ dayjs().diff(dayjs(char.onlineTime), 'day') }}天前)
        </span>
      </div>
      <div
        v-if="char.classicTime"
        class="d-flex"
      >
        <span class="w120">转入中坚</span>
        <span>
          {{ char.classicTime.substring(0, 10) }}
        </span>
      </div>
      <div
        v-if="char.recruitTime"
        class="d-flex"
      >
        <span class="w120">加入公招</span>
        <span>
          {{ char.recruitTime.substring(0, 10) }}
        </span>
      </div>
      <div
        v-if="dev"
        class="d-flex align-center"
      >
        <span class="w120">罗德岛123!?</span>
        <v-btn
          v-if="char.comic"
          :href="`https://terra-historicus.hypergryph.com/comic/6253/episode/${char.comic}`"
          target="_blank"
        >
          阅读
        </v-btn>
        <v-btn
          v-else
          variant="text"
          readonly
        >
          暂无
        </v-btn>
      </div>
      <div
        v-if="!['linkage', 'linkageActivity'].includes(char.type) && !/_amiya\d/.test(char.id)"
        class="d-flex align-center"
      >
        <span class="w120">通行证系列</span>
        <v-btn
          v-if="char.passport"
          variant="text"
          readonly
        >
          {{ char.passport }}
        </v-btn>
        <v-btn
          v-else
          variant="text"
          readonly
        >
          暂无
        </v-btn>
      </div>
    </div>
    <v-divider vertical />
    <div class="h-100">
      <div
        class="d-flex ga-1"
        style="height: 35px"
      >
        <v-chip
          v-if="char.type === 'activity'"
          color="primary"
        >
          活动奖励
        </v-chip>
        <v-chip
          v-if="char.type === 'linkageActivity'"
          color="error"
        >
          联动活动奖励
        </v-chip>
        <v-chip
          v-if="char.type === 'linkage'"
          color="error"
        >
          联动限时寻访
        </v-chip>
        <v-chip
          v-if="char.type === 'limited'"
          color="error"
        >
          限定寻访·{{ limitedLabel[char.source] }}
        </v-chip>
        <v-chip
          v-if="char.type === '' && ((char.rarity > 4 && !char.classicTime) || char.rarity === 4)"
          color="primary"
        >
          标准寻访
        </v-chip>
        <v-chip
          v-if="char.classicTime"
          color="primary"
        >
          中坚寻访
        </v-chip>
        <v-chip
          v-if="char.recruitTime"
          color="primary"
        >
          公开招募
        </v-chip>
      </div>
      <div
        v-if="char.pools.length"
        style="height: calc(100% - 35px)"
        class="text-button"
      >
        <div style="height: 80px">
          <div class="d-flex">
            <span>最近概率提升日期</span>
            <v-spacer />
            <span>{{ lastUp }}({{ dayjs().diff(dayjs(lastUp), 'day') }}天前)</span>
          </div>
          <div
            v-if="char.rarity > 4 && !char.type"
            class="d-flex"
          >
            <span>最近进店日期</span>
            <v-spacer />
            <span>
              {{ lastShop ? `${lastShop}(${dayjs().diff(dayjs(lastShop), 'day')}天前)` : '暂无' }}
            </span>
          </div>
        </div>
        <v-timeline
          side="end"
          truncate-line="start"
          style="height: calc(100% - 80px)"
          class="pr-6 overflow-auto"
        >
          <v-timeline-item
            v-for="pool in char.pools"
            :key="pool.id"
            :dot-color="
              pool.status === 'shop' ? '#ffd800' : '#0098dc'
            "
            :icon="
              pool.status === 'shop'
                ? 'mdi-cart'
                : 'mdi-chevron-double-up'
            "
            fill-dot
          >
            <template #opposite>
              <div class="d-flex">
                <span class="w100">{{ pool.start.substring(0, 10) }}</span>
                <span class="w180">
                  {{ pool.name || (pool.type === 'standard' ? '标准寻访' : '中坚寻访') }}
                </span>
              </div>
            </template>
            <div
              v-if="pool.duration"
              class="d-flex"
            >
              <span>{{ pool.duration }} 天</span>
            </div>
          </v-timeline-item>
        </v-timeline>
      </div>
    </div>
    <v-divider vertical />
    <div class="d-flex flex-column ga-4">
      <v-sheet
        class="position-relative px-4 py-8"
        elevation="3"
        :min-width="300"
      >
        <v-chip
          color="primary"
          size="small"
          class="position-absolute top-0 right-0 text-caption"
          variant="flat"
        >
          时装：{{ char.skins.length }}件
        </v-chip>
        <div class="d-flex flex-column ga-2 text-body-2">
          <div
            v-for="skin in char.skins"
            :key="skin.id"
            class="d-flex align-center ga-2"
          >
            <v-chip
              v-if="skin.tag"
              color="#0224ff"
              variant="flat"
              size="small"
            >
              {{ skin.tag }}
            </v-chip>
            <span>{{ skin.name }} / {{ skin.groupName }}</span>
            <v-chip
              v-if="skin.dynamic"
              color="#ffd800"
              variant="flat"
              size="small"
            >
              动态
            </v-chip>
            <v-chip
              v-if="skin.voice"
              color="#ffd800"
              variant="flat"
              size="small"
            >
              语音
            </v-chip>
            <v-spacer />
            <span>{{ skin.online.substring(0, 10) }}</span>
          </div>
          <div
            v-if="!char.skins.length"
            class="text-center"
          >
            暂无
          </div>
        </div>
      </v-sheet>
      <v-sheet
        v-if="char.sp != -1"
        class="position-relative px-4 py-8"
        elevation="3"
      >
        <v-chip
          color="primary"
          size="small"
          class="position-absolute top-0 right-0 text-caption"
          variant="flat"
        >
          异格
        </v-chip>
        <div class="d-flex flex-column ga-2 text-body-2">
          <div
            v-for="c in Object.values(operators).filter(
              (v) => v.spMeta === char.spMeta && v.id !== char.id
            )"
            :key="c.id"
            class="d-flex"
          >
            <span
              class="cursor-pointer"
              @click="switchOperator(c)"
            >
              {{ c.name }}
            </span>
            <v-spacer />
            <span>{{ c.onlineTime.substring(0, 10) }}</span>
          </div>
        </div>
      </v-sheet>
    </div>
  </div>
</template>
