import { defineStore } from 'pinia'
import { getJSON } from '@/utils/utils'
import type { Line, Episode, EpisodeOrigin } from '@/utils/types'

export const useStoryStore = defineStore('story', () => {
  const DATA_SOURCE =
    'https://raw.githubusercontent.com/Kengxxiao/ArknightsGameData/master/'
  const LANG = 'zh_CN'
  const dbSource = `${DATA_SOURCE}${LANG}`

  const lines: Record<string, Line> = reactive({})
  const loadStories = async () => {
    const STORY_TYPES = {
      MAIN_STORY: { id: 'main', title: '主题曲' },
      ACTIVITY_STORY: { id: 'side', title: '插曲/别传' },
      MINI_STORY: { id: 'mini', title: '故事集' }
    }
    for (const type in STORY_TYPES) {
      const { id, title } = STORY_TYPES[type]
      lines[id] = { id, title, eps: {} as Record<string, Episode> }
    }
    const list: Record<string, EpisodeOrigin> = (await getJSON(
      `${dbSource}/gamedata/excel/story_review_table.json`
    )) as Record<string, EpisodeOrigin>
    for (const id in list) {
      const { name, actType, infoUnlockDatas } = list[id]
      if (actType !== 'NONE') {
        const type = STORY_TYPES[actType].id as 'main' | 'side' | 'mini'
        const ep = {
          id,
          title: `${type === 'main' ? `EP ${id.split('_')[1].length < 2 ? 0 : ''}${id.split('_')[1]} ` : ''}${name}`,
          type,
          total: infoUnlockDatas.length,
          stages: infoUnlockDatas.map((v, k) => ({
            ...v,
            type,
            order: k
          }))
        }
        lines[type].eps[id] = ep
      }
    }
  }

  loadStories()

  return { lines }
})
