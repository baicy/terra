<template>
  <div class="d-flex align-center">
    <v-breadcrumbs :items="breadcrumbs">
      <template #divider>
        <v-icon icon="mdi-chevron-right"></v-icon>
      </template>
      <template #title="{ item, index }">
        <div v-if="index === 0" class="cursor-pointer">
          {{ item.title }}
          <v-menu activator="parent" open-on-hover open-on-click>
            <v-list v-model:selected="item.value" active-color="primary">
              <v-list-item
                v-for="line in allStages"
                :key="line.id"
                link
                :value="line.id"
                @click="selectLine(line.id)"
              >
                {{ line.title }}
              </v-list-item>
            </v-list>
          </v-menu>
        </div>
        <div v-else-if="index === 1">
          {{ item.title }}
          <v-menu activator="parent" open-on-hover open-on-click>
            <v-list v-model:selected="item.value" active-color="primary">
              <v-list-item
                v-for="episode in selections.episodes"
                :key="episode.id"
                link
                :value="episode.id"
                @click="selectEpisode(episode)"
              >
                {{ episode.title }}
              </v-list-item>
            </v-list>
          </v-menu>
        </div>
        <div v-else>
          {{ item.title }}
          <v-menu activator="parent" open-on-hover open-on-click>
            <v-list v-model:selected="item.value" active-color="primary">
              <v-list-item
                v-for="stage in selections.stages"
                :key="stage.storyId"
                link
                :value="stage.storyId"
                @click="selectStage(stage)"
              >
                {{ stage.storyCode }}
                {{ stage.storyName }}
                {{ stage.avgTag }}
              </v-list-item>
            </v-list>
          </v-menu>
        </div>
      </template>
    </v-breadcrumbs>
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
const selections = reactive({
  line: '',
  episodes: null,
  episode: '',
  stages: []
})
const breadcrumbs = computed(() => {
  const crumbs = []
  if (selectedStage.storyId) {
    selectStage(selectedStage, true)
  }
  crumbs.push({
    title: selections.line
      ? allStages[selections.line].title
      : '—— 选择曲谱 ——',
    disabled: false,
    value: [selections.line]
  })
  if (selections.episodes) {
    crumbs.push({
      title: selections.episode ? selections.episode.title : '—— 选择章节 ——',
      disabled: false,
      value: [selections.episode.id]
    })
  }
  if (selections.stages.length) {
    crumbs.push({
      title: selectedStage.storyId
        ? `${selectedStage.storyCode} ${selectedStage.storyName} ${selectedStage.avgTag}`
        : '—— 选择章节 ——',
      disabled: false,
      value: [selectedStage.storyId]
    })
  }
  return crumbs
})
const emit = defineEmits(['stages', 'stage'])
function selectLine(line) {
  selections.line = line
  selections.episodes = allStages[line].eps
}
function selectEpisode(episode) {
  selections.episode = episode
  selections.stages = episode.stages
  emit('stages', selections.stages)
}
function selectStage(stage, init = false) {
  if (!selections.line) {
    selectLine(stage.type)
  }
  if (!selections.episode) {
    selectEpisode(allStages[stage.type].eps[stage.storyGroup])
  }
  if (!init) emit('stage', stage)
}
</script>
