<template>
  <reader
    :reader-stage="readerStage"
    :all-stages="lines"
    @change="changeStage"
  ></reader>
</template>
<script setup>
import { useStorylineStore } from '@/stores/storyline'
const router = useRouter()
const route = useRoute()
const readerStage = ref({})

const storylineStore = useStorylineStore()
const lines = storylineStore.storylines
storylineStore.$subscribe(() => {
  router.push({ force: true })
})
watch(route, () => {
  // console.log('watch...', route.params.chapters)
  const [c, e, s] = route.params.chapters
  let stage = null
  if (c && e) {
    if (lines && lines[c]) {
      const eps = lines[c].eps
      if (eps[e]) {
        const str = `${e}_level_${c === 'main' ? '' : `${e}_`}${s}`
        stage = eps[e].stages.find((v) => v.storyId === str)
        if (!stage) {
          stage = eps[e].stages[0]
        }
      }
    }
  }
  if (stage) {
    readerStage.value = stage
  }
})
function changeStage(chapters) {
  router.push({
    params: {
      chapters
    }
  })
}
</script>
