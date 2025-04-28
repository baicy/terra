<template>
  <v-sheet
    class="h-100 d-flex ga-2 overflow-auto storyline position-relative"
    color="background"
  >
    <div
      v-for="year in years"
      :key="year"
      class="bg-surface w600 h1200 text-center"
    >
      <div>{{ year }}</div>
    </div>
    <v-sheet
      v-for="(story, index) in stories"
      :key="index"
      :elevation="6"
      :color="nations[story.nation].color"
      class="position-absolute w260 h80 pa-2 d-flex flex-column"
      :style="{
        left: `${(story.year - startYear) * 608 + story.half * 300}px`,
        top: `${story.row * 80 + 60}px`,
        fontSize: '14px'
      }"
    >
      <span>{{ story.title }}</span>
      <span>{{ story.time }}</span>
      <span>{{ story.location }}</span>
      <!-- <div class="position-absolute bottom-0 right-0">{{ story.row }}</div> -->
    </v-sheet>
  </v-sheet>
</template>
<script setup>
import stories from '@/data/stories.json'
import _nations from '@/data/nations.json'
import { ato } from '@/utils/utils'

const startYear = 1096
const endYear = 1102
const years = ref([])
for (let i = startYear; i <= endYear; i++) {
  years.value.push(i)
}
const nations = ato(_nations, 'id')
</script>
