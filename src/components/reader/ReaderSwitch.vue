<template>
  <div>
    <decompose-text-field
      icon="mdi-movie-search"
      @input="searchAll"
    ></decompose-text-field>
    <div v-if="resAll.length">
      <v-list
        width="100%"
        max-height="250px"
        class="position-absolute z20"
        border
        density="compact"
        active-color="primary"
        :elevation="5"
        :items="resAll"
        @click:select="selectStageById"
      >
      </v-list>
    </div>
  </div>
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
      :items="Object.values(sels.episodes).reverse()"
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
function selectStageById(id) {
  const stage = allTitles.value.find((v) => v.id === id.id).data
  selectStage(stage)
}

const strAll = ref('')
const resAll = ref([])
const allTitles = computed(() => {
  const titles = []
  for (const l in allStages) {
    for (const e in allStages[l].eps) {
      allStages[l].eps[e].stages.forEach((s) => {
        titles.push({
          id: s.storyId,
          search: `${s.storyCode}${s.storyName}`,
          code: s.storyCode,
          name: s.storyName,
          tag: s.avgTag,
          storyline: s.type,
          episode: s.storyGroup,
          data: s
        })
      })
    }
  }
  return titles
})
function searchAll(str) {
  if (str === strAll.value) return
  strAll.value = str
  if (str) {
    const res = []
    let group = ''
    allTitles.value
      .filter((t) =>
        t.search.toLowerCase().includes(strAll.value.toLowerCase())
      )
      .forEach((v) => {
        if (v.episode !== group) {
          group = v.episode
          res.push({
            type: 'subheader',
            title: allStages[v.storyline].eps[group].title
          })
        }
        res.push({
          title: `${v.code} ${v.name}${v.tag ? ` ${v.tag}` : ''}`,
          value: v.id
        })
      })
    resAll.value = res
  } else {
    resAll.value = []
  }
}
</script>
