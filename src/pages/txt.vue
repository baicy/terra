<template>
  <v-sheet class="w-100 h-100 d-flex flex-column pa-4 position-relative">
    <div
      class="b1 px-8 py-4 position-relative text-white"
      style="height: calc(100% - 50px); font-size: 24px; background-size: cover"
      :style="{
        backgroundImage: `url(${AVG_SOURCE}${(story.contents[page] ? story.contents[page].bg.toLowerCase() : '') || 'backgrounds/bg_black'}.png)`,
        ...(story.contents[page] ? story.contents[page].bgStyle : {})
      }"
    >
      <div
        class="position-absolute top-0 left-0 w-100 h-100 d-flex justify-center"
        style="z-index: 2"
      >
        <img
          v-if="story.contents[page] && story.contents[page].cgitem"
          :src="`${AVG_SOURCE}items/${story.contents[page].cgitem}.png`"
          class="position-absolute bottom-0"
          style="max-height: 100%"
        />
      </div>
      <div
        v-if="
          story.contents[page] && story.contents[page].texts.length && !hideText
        "
        ref="modalRef"
        class="d-flex flex-column ga-3 overflow-auto py-4 position-relative"
        style="
          height: calc(100% - 16px);
          background-color: #00000099;
          z-index: 10;
        "
      >
        <div
          v-for="(line, index) in story.contents[page].texts.filter(
            (v) => !hiddenRows.has(v.rid)
          )"
          :key="index"
          class="d-flex flex-column"
        >
          <div v-if="line.decisions" class="text-center w-100 px-4">
            <div
              class="d-flex flex-column ga-1 align-center py-2"
              style="background-color: #ffffff33"
            >
              <div
                v-for="decision in line.decisions"
                :key="decision.value"
                class="b1 px-2 w600 cursor-pointer"
                :class="{ 'text-primary': decision.selected }"
                style="background-color: #00000099"
                @click="decide(decision, line.decisions)"
              >
                {{ decision.option }}
              </div>
            </div>
          </div>
          <div v-else class="d-flex">
            <div class="pr-4 text-right" style="flex: 1.5 50px">
              {{ line.speaker }}
            </div>
            <reader-text style="flex: 6 300px" :text="line.text"> </reader-text>
          </div>
        </div>
      </div>
    </div>
    <div
      class="w-100 d-flex justify-center align-center h50"
      style="z-index: 20"
    >
      <div class="d-flex align-center">
        <v-breadcrumbs :items="selection">
          <template #divider>
            <v-icon icon="mdi-chevron-right"></v-icon>
          </template>
          <template #title="{ item, index }">
            <div v-if="index === 0" class="cursor-pointer">
              {{ item.title }}
              <v-menu activator="parent" open-on-hover open-on-click>
                <v-list
                  v-model:selected="selection[0].value"
                  active-color="primary"
                >
                  <v-list-item
                    v-for="(storyline, storyType) in switches"
                    :key="storyline.storyType"
                    link
                    :value="storyType"
                    @click="selectLine(storyline, storyType)"
                  >
                    {{ storyline.title }}
                  </v-list-item>
                </v-list>
              </v-menu>
            </div>
            <div v-else-if="index === 1">
              {{ item.title }}
              <v-menu activator="parent" open-on-hover open-on-click>
                <v-list
                  v-model:selected="selection[1].value"
                  active-color="primary"
                >
                  <v-list-item
                    v-for="episode in selection[0].eps"
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
              {{ story.title || item.title }}
              <v-menu activator="parent" open-on-hover open-on-click>
                <v-list
                  v-model:selected="selection[2].value"
                  active-color="primary"
                >
                  <v-list-item
                    v-for="(stage, order) in selection[1].stages"
                    :key="stage.storyId"
                    link
                    :value="stage.storyId"
                    @click="selectStage(stage, order)"
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
        <!-- <v-btn @click="loadTest">测试</v-btn> -->
      </div>
      <v-spacer></v-spacer>
      <div class="d-flex ga-1">
        <!-- <v-btn>CN</v-btn> -->
        <v-btn
          :icon="hideText ? 'mdi-eye-off' : 'mdi-eye'"
          :size="36"
          @click="hideText = !hideText"
        ></v-btn>
        <!-- <v-btn icon="mdi-volume-high" :size="36"></v-btn> -->
        <v-btn id="setting-btn" icon="mdi-cog" :size="36"></v-btn>
        <v-btn to="/" icon="mdi-home" :size="36"></v-btn>
        <v-dialog activator="#setting-btn" max-width="400px">
          <v-sheet class="pa-4">
            <div>
              <div>ID信息</div>
              <v-text-field v-model="terraReader.nickname"></v-text-field>
            </div>
          </v-sheet>
        </v-dialog>
      </div>
      <div class="position-absolute d-flex">
        <!-- <v-btn v-if="selection[0].type === 'main'">上一章</v-btn>
        <v-div v-else class="w100"></v-div> -->
        <v-btn
          v-if="siblings.prev"
          class="w100"
          color="warning"
          @click="optStage(true)"
        >
          上一节
        </v-btn>
        <v-div v-else class="w100"></v-div>
        <v-btn v-if="page > 0" class="w100" @click="optPage(true)">
          上一页
        </v-btn>
        <v-div v-else class="w100"></v-div>
        <v-btn
          v-if="page + 1 < story.contents.length"
          class="w100"
          @click="optPage(false)"
        >
          下一页
        </v-btn>
        <v-div v-else class="w100"></v-div>
        <v-btn
          v-if="siblings.next"
          class="w100"
          color="warning"
          @click="optStage(false)"
        >
          下一节
        </v-btn>
        <v-div v-else class="w100"></v-div>
        <!-- <v-btn v-if="selection[0].type === 'main'">下一章</v-btn>
        <v-div v-else class="w100"></v-div> -->
      </div>
    </div>
  </v-sheet>
</template>
<script setup>
import { getJSON, getTEXT } from '@/utils/utils'
import { useSystemStore } from '@/stores/system'
const system = useSystemStore()
const terraReader = computed(() => system.terraReader)
system.$subscribe((mutation) => {
  if (mutation.events.key === 'nickname') {
    localStorage.setItem(
      'btr',
      JSON.stringify({ nickname: mutation.events.newValue.trim() })
    )
  }
})
const page = ref(0)
const LANG = 'zh_CN'
const DATA_SOURCE =
  'https://raw.githubusercontent.com/Kengxxiao/ArknightsGameData/master/'
const dbSource = `${DATA_SOURCE}${LANG}`
const AVG_SOURCE =
  'https://raw.githubusercontent.com/akgcc/arkdata/main/assets/torappu/dynamicassets/avg/'
const switches = reactive({
  main: { title: '主题曲', eps: {} },
  side: { title: '插曲/别传', eps: {} },
  mini: { title: '故事集', eps: {} }
})
const selection = reactive([{ title: '—— 选择曲谱 ——', disabled: false }])
const story = reactive({
  title: '',
  contents: []
})
const hideText = ref(false)
const hiddenRows = ref(new Set())
const shownRows = ref(new Set())
onBeforeMount(async () => {
  const list = await getJSON(
    `${dbSource}/gamedata/excel/story_review_table.json`
  )
  const storyType = {
    MAIN_STORY: 'main',
    ACTIVITY_STORY: 'side',
    MINI_STORY: 'mini'
  }
  for (const id in list) {
    if (list[id].actType !== 'NONE') {
      switches[storyType[list[id].actType]].eps[id] = {
        id,
        type: storyType[list[id].actType],
        title: list[id].name,
        stages: list[id].infoUnlockDatas
      }
    }
  }
  // console.log(switches)
})
// async function loadTest() {
//   // activities/act42side/level_act42side_st01.txt
//   // activities/act42side/level_act42side_st04.txt
//   // activities/act13side/level_act13side_09_beg.txt
//   // activities\act12d0\level_act12d0_01_beg.txt
//   // act18side_level_act18side_st03
//   // act42side_level_act42side_01_beg
//   // act18side_level_act18side_st01
//   // act37side_level_act37side_07_end
//   selectStage('act37side_level_act37side_07_end')
// }
async function formatStory(stage) {
  story.title = `${stage.storyCode} ${stage.storyName} ${stage.avgTag}`
  const txt = await getTEXT(`${dbSource}/gamedata/story/${stage.storyTxt}.txt`)
  const lines = txt.matchAll(/^(\[[^\]]+])?(.*)?$/gim)
  const speakers = new Set()
  story.contents = []
  page.value = 0
  let index = 0
  let bgGray = 0
  let cgitem = ''
  let decisionStack = []
  let decisionStatus = []
  for (const line of lines) {
    let cmd = ''
    let args = ''
    if (line[1]) {
      ;[, cmd, args] =
        /\[\s*?(?:([^=(\]]+)(?=[(\]])\(?)?([^\]]*?)\)?\s*?\]/.exec(line[1])
      // console.log(cmd, ':', args)
      if (args) {
        const tmp = {}
        Array.from(
          args.matchAll(/("?[^=", ]+"?)\s*=\s*"?((?<=")[^"]*|[^,]*)/gim)
        ).forEach((l) => (tmp[l[1].toLowerCase()] = l[2]))
        args = tmp
      }
    }
    if (
      line[1] &&
      args &&
      'name' in args &&
      line[2] &&
      line[2].trim() &&
      !cmd
    ) {
      speakers.add(args.name)
      addText(line[2], args.name)
    } else if (line[1] && cmd) {
      //
    }
    if (cmd === 'CameraEffect') {
      if (args.effect === 'Grayscale') {
        if (!args.initamount) {
          bgGray = args.amount
          if (
            story.contents[index - 1] &&
            !story.contents[index - 1].texts.length
          ) {
            story.contents[index - 1].bgStyle = {
              filter: `grayscale(${args.amount})`
            }
          }
        }
      }
    }
    if (['Background', 'Image'].includes(cmd)) {
      if (args.image) {
        story.contents.push({
          bg: `${cmd.toLowerCase()}s/${args.image}`,
          bgStyle: bgGray ? { filter: `grayscale(${bgGray})` } : {},
          cgitem,
          texts: []
        })
        index++
        decisionStatus = []
        decisionStack = []
      }
    }
    if (cmd === 'cgitem') {
      cgitem = args.image
      story.contents[index - 1].cgitem = cgitem
    }
    if (cmd === 'hidecgitem') {
      cgitem = ''
    }
    if (cmd === 'Subtitle') {
      if (args.text) addText(args.text)
    }
    if (cmd === 'Sticker') {
      if (args.text) addText(args.text)
    }
    if (cmd === 'animtext') {
      if (args.name === 'group_location_stamp') {
        const title = line[2].match(/<p=1>(.*?)<\/>/)
        const content = line[2].match(/<p=2>(.*?)<\/>/)
        addText(`${title[1]}\n${content[1]}`)
      }
    }
    if (cmd === 'Decision') {
      const options = args.options.split(';')
      const values = args.values.split(';')
      const decisions = []
      const newStack = []
      decisionStack.forEach((d) => {
        newStack.push({ ...d })
      })
      values.forEach((v, k) => {
        decisions.push({ option: options[k], value: v, refers: [] })
        const d = newStack.find((d) => d.value === v)
        if (d) {
          d.pid = index - 1
          d.rid = story.contents[index - 1].texts.length
        } else {
          newStack.push({
            value: v,
            pid: index - 1,
            rid: story.contents[index - 1].texts.length
          })
        }
      })
      const rid = story.contents[index - 1].texts.length
      story.contents[index - 1].texts.push({
        rid,
        decisions
      })
      addToDecision(rid)
      decisionStack = [...newStack]

      // decisionStack = [...newStack]
      // story.contents[index - 1].texts[rid].dicisions = decisions
    }
    if (cmd === 'Predicate') {
      decisionStatus = args.references.split(';')
    }
    if (cmd == 'Dialog') {
      // decisionStatus = []
      // decisionStack = []
    }
    if (!line[1]) {
      addText(line[0])
    }
    function addText(text, speaker = '') {
      let rid = 0
      text = text.replace(/\\n/g, '\n')
      if (story.contents[index - 1]) {
        rid = story.contents[index - 1].texts.length
        story.contents[index - 1].texts.push({
          rid,
          text,
          speaker
        })
      } else {
        story.contents.push({
          bg: '',
          texts: [
            {
              rid,
              text,
              speaker
            }
          ]
        })
        index++
        decisionStatus = []
        decisionStack = []
      }
      addToDecision(rid)
    }
    function addToDecision(rid) {
      // console.log(rid, decisionStatus, decisionStack)
      if (decisionStatus.length) {
        decisionStatus.forEach((d) => {
          const decision = decisionStack.find((v) => v.value === d)
          // if (decision.pid === 3) {
          //   console.log(rid, decision)
          // }
          if (decision && decision.rid !== rid) {
            story.contents[decision.pid].texts[decision.rid].decisions
              .find((v) => v.value === d)
              .refers.push(rid)
          }
        })
      }
    }
  }
  // console.log(story)
  reset()
}
function reset() {
  if (modalRef.value) modalRef.value.scrollTop = 0
  calDecisions()
}
function calDecisions() {
  if (!story.contents.length) return
  hiddenRows.value.clear()
  shownRows.value.clear()
  for (const t in story.contents[page.value].texts) {
    const text = story.contents[page.value].texts[t]
    if (text.decisions) {
      if (hiddenRows.value.has(text.rid)) {
        text.decisions.forEach((d) => {
          d.refers.forEach((r) => {
            hiddenRows.value.add(r)
          })
        })
      } else {
        let d = text.decisions.findIndex((v) => v.selected)
        if (d === -1) {
          text.decisions[0].selected = true
          d = 0
        }
        const shows = new Set(text.decisions[d].refers)
        const hiddens = new Set()
        text.decisions.forEach((v, k) => {
          if (k != d) {
            v.refers.forEach((r) => {
              if (!shows.has(r)) {
                hiddens.add(r)
                shows.delete(r)
              }
            })
          }
        })
        shownRows.value = new Set([...shownRows.value, ...shows])
        hiddenRows.value = new Set([...hiddenRows.value, ...hiddens])
      }
      shownRows.value.forEach((v) => {
        if (hiddenRows.value.has(v)) {
          hiddenRows.value.delete(v)
        }
      })
    }
  }
}
function decide(d, ds) {
  ds.forEach((v) => {
    v.selected = v.value === d.value
  })
  calDecisions()
}

const modalRef = ref()

function optPage(prev) {
  if (prev) {
    if (page.value > 0) {
      page.value--
    }
  } else {
    if (page.value + 1 < story.contents.length) {
      page.value++
    }
  }
  reset()
}
function optStage(prev) {
  if (prev) {
    if (siblings.value.prev) {
      selectStage(siblings.value.prev, selection[2].order - 1)
    }
  } else {
    if (siblings.value.next) {
      selectStage(siblings.value.next, selection[2].order + 1)
    }
  }
}
const siblings = computed(() => {
  let prev = null
  let next = null
  if (!selection[2] || !selection[2].value) {
    return { prev, next }
  }

  const stages = selection[1].stages
  const pos = selection[2].order
  if (pos > 0) {
    prev = stages[pos - 1]
  }
  if (pos + 1 < stages.length) {
    next = stages[pos + 1]
  }
  return { prev, next }
})
function selectLine(line, type) {
  selection[0].title = line.title
  selection[0].value = [type]
  selection[0].type = type
  selection[0].eps = line.eps
  if (!selection[1]) {
    selection.push({
      title: '—— 选择章节 ——',
      disabled: false
    })
  }
}
function selectEpisode(ep) {
  selection[1].title = ep.title
  selection[1].value = [ep.id]
  selection[1].stages = ep.stages
  if (!selection[2]) {
    selection.push({
      title: '—— 选择章节 ——',
      disabled: false
    })
  }
}
function selectStage(stage, order) {
  if (typeof stage === 'string') {
    const epid = stage.split('_')[0]
    const allStages = [
      ...Object.values(switches.main.eps),
      ...Object.values(switches.side.eps),
      ...Object.values(switches.mini.eps)
    ]
    const ep = allStages.find((v) => v.id === epid)
    selectLine(switches[ep.type], ep.type)
    selectEpisode(ep)
    order = ep.stages.findIndex((v) => v.storyId === stage)
    stage = ep.stages[order]
  }
  selection[2].value = [stage.storyId]
  selection[2].order = order
  selection[2].stage = stage
  formatStory(stage)
}
</script>
