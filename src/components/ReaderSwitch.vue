<template>
  <!-- <div>
    <v-text-field
      v-model="searchTitle"
      prepend-inner-icon="mdi-movie-search"
      color="primary"
      @update:model-value="searchAll"
    ></v-text-field>
    {{ searchTitle }}
  </div> -->
  <div class="d-flex">
    <v-list v-model:selected="sels.storyline">
      <v-list-item
        v-for="l in allStages"
        :key="l.id"
        :value="l.id"
        link
        active-color="primary"
        @click="selectStoryline(l.id)"
      >
        {{ l.title }}
      </v-list-item>
    </v-list>
    <switch-list
      v-if="sels.episodes"
      :items="sels.episodes"
      :selected="sels.episodeId"
      @select="selectEpisode"
    ></switch-list>
    <switch-list
      v-if="sels.stages"
      :items="sels.stages"
      :selected="selectedStage.storyId"
      id-prop="storyId"
      @select="selectStage"
    >
      <template #item="{ storyCode, storyName, avgTag }">
        {{ storyCode }} {{ storyName }}
        {{ avgTag === '幕间' ? '' : ` ${avgTag}` }}
      </template>
    </switch-list>
  </div>
</template>
<script setup>
const { allStages, selectedStage } = defineProps({
  allStages: {
    type: Object,
    default() {
      return null
    }
  },
  selectedStage: {
    type: Object,
    default() {
      return null
    }
  }
})
const sels = reactive({
  storyline: [],
  episodes: null,
  episodeId: '',
  stages: [],
  stageId: []
})
// const searchTitle = ref('')
// const allTitles = computed(() => {
//   const titles = []
//   for (const l in allStages) {
//     for (const e in allStages[l].eps) {
//       allStages[l].eps[e].stages.forEach((s) => {
//         titles.push({
//           id: s.storyId,
//           title: `${s.storyCode}${s.storyName}`,
//           code: s.storyCode,
//           name: s.storyName,
//           tag: s.avgTag
//         })
//       })
//     }
//   }
//   return titles
// })
onMounted(async () => {
  if (selectedStage.storyId) selectStage(selectedStage, true)
})
const emit = defineEmits(['stages', 'stage'])
function selectStoryline(slid) {
  sels.storyline = [slid]
  sels.episodes = allStages[slid].eps
}
function selectEpisode(episode) {
  sels.episodeId = episode.id
  sels.stages = episode.stages
  emit('stages', sels.stages)
}
function selectStage(stage, init = false) {
  if (!sels.storyline.length) {
    selectStoryline(stage.type)
  }
  if (!sels.episodeId) {
    selectEpisode(sels.episodes[stage.storyGroup])
  }
  if (!init) emit('stage', stage)
}
// function searchAll(str) {
//   const a = allTitles.value.filter((t) => t.title.includes(str))
//   console.log(a)
//   return a
// }
</script>
