<template>
  <reader
    :reader-stage="readerStage"
    :all-stages="lines"
    @change="changeStage"
  ></reader>
</template>
<script setup>
import { useStoryStore } from '@/stores/story'
const router = useRouter()
const route = useRoute()
const readerStage = ref({})

const storyStore = useStoryStore()
const lines = storyStore.lines
storyStore.$subscribe(() => {
  router.push({ force: true })
})
watch(route, () => {
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
