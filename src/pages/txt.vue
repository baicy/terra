<template>
  <reader
    :reader-stage="readerStage"
    :all-stages="switches"
    @change="changeStage"
  ></reader>
</template>
<script setup>
import { getJSON } from '@/utils/utils'
const DATA_SOURCE =
  'https://raw.githubusercontent.com/Kengxxiao/ArknightsGameData/master/'
const LANG = 'zh_CN'
const dbSource = `${DATA_SOURCE}${LANG}`
const router = useRouter()
const route = useRoute()
const switches = ref(null)
const readerStage = ref({})
onBeforeMount(async () => {
  const list = await getJSON(
    `${dbSource}/gamedata/excel/story_review_table.json`
  )
  switches.value = {
    main: { title: '主题曲', id: 'main', eps: {} },
    side: { title: '插曲/别传', id: 'side', eps: {} },
    mini: { title: '故事集', id: 'mini', eps: {} }
  }
  const storyType = {
    MAIN_STORY: 'main',
    ACTIVITY_STORY: 'side',
    MINI_STORY: 'mini'
  }
  for (const id in list) {
    if (list[id].actType !== 'NONE') {
      switches.value[storyType[list[id].actType]].eps[id] = {
        id,
        type: storyType[list[id].actType],
        title: list[id].name,
        total: list[id].infoUnlockDatas.length,
        stages: list[id].infoUnlockDatas.map((v, k) => ({
          ...v,
          type: storyType[list[id].actType],
          order: k
        }))
      }
    }
  }
  router.push({ force: true })
})
watch(route, () => {
  const [c, e, s] = route.params.chapters
  let stage = null
  if (c && e) {
    if (switches.value && switches.value[c]) {
      const eps = switches.value[c].eps
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
