<template>
  <v-sheet class="w-100 h-100 d-flex flex-column pa-4 position-relative">
    <div
      ref="readerRef"
      class="b1 px-8 py-4 position-relative text-white d-flex justify-center align-center"
      style="height: 100%; background-color: black"
      :style="{
        fontSize: `${terraReader.fontSize}px`
      }"
      @click="optAll($event)"
    >
      <!-- bg layer: 1 -->
      <div
        v-if="scene"
        class="position-absolute top-0 left-0 w-100 h-100 overflow-hidden text-center z1"
      >
        <div
          v-if="scene.bg.split('/').length > 1"
          class="d-flex flex-wrap position-absolute bottom-0"
        >
          <img
            v-for="(bg, index) in scene.bg.split('/')"
            :key="index"
            :src="`${AVG_SOURCE}${scene.bgFolder}/${bg}.png`"
            :alt="`bg${index}`"
            :style="{
              width: '50%',
              ...scene.bgStyle
            }"
          />
        </div>
        <img
          v-else
          :src="`${AVG_SOURCE}${scene.bgFolder}/${scene.bg}.png`"
          alt="bg"
          :style="{
            width: scene.bgFolder === 'backgrounds' ? '100%' : 'auto',
            height: scene.bgFolder === 'images' ? '100%' : 'auto',
            ...scene.bgStyle
          }"
        />
      </div>
      <!-- blocker layer: 2 -->
      <div
        v-if="scene"
        class="position-absolute top-0 left-0 w-100 h-100 z2"
        :style="{ backgroundColor: blockerColor }"
      ></div>
      <!-- cgitems layer: 3 -->
      <div
        class="position-absolute top-0 left-0 w-100 h-100 d-flex justify-center z3"
      >
        <img
          v-if="scene && scene.cgitem"
          :src="`${AVG_SOURCE}items/${scene.cgitem}.png`"
          class="position-absolute bottom-0"
          style="max-height: 100%"
        />
      </div>
      <!-- modal layer: 10 -->
      <div
        v-if="scene && scene.texts.length && !hideText"
        ref="modalRef"
        class="d-flex flex-column ga-3 overflow-auto px-2 py-6 position-relative z10"
        style="width: calc(100% - 16px); height: calc(100% - 16px)"
        :style="{
          backgroundColor: `rgba(0,0,0,${terraReader.modalAlpha / 100})`
        }"
      >
        <div
          v-for="(line, index) in scene.texts.filter(
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
                class="b1 px-2 cursor-pointer"
                :class="{ 'text-primary': decision.selected }"
                style="
                  background-color: #00000099;
                  min-width: 600px;
                  max-width: calc(100% - 12px);
                "
                @click="decide(decision, line.decisions)"
              >
                <reader-text :text="decision.option"></reader-text>
              </div>
            </div>
          </div>
          <div
            v-else-if="line.type === 'sticker'"
            class="d-flex justify-center"
          >
            <div
              :class="[`text-${line.info.align}`]"
              style="max-width: calc(100% - 32px)"
              :style="{
                fontSize: `${(line.info.size || 24) / 24}em`
              }"
            >
              <reader-text :text="line.text"></reader-text>
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
      <!-- options layer: 20, 21 -->
      <div
        v-if="optPanelOn"
        class="w-100 d-flex justify-center align-center h50 position-absolute bottom-0 z20 ts18"
      >
        <div
          class="w-100 h-100 bg-surface position-absolute opacity-40 z20"
        ></div>
        <div class="z21">
          <reader-switch
            v-if="allStages"
            :all-stages="allStages"
            :selected-stage="readerStage"
            @stages="switchStages"
            @stage="switchStage"
          ></reader-switch>
        </div>
        <v-spacer></v-spacer>
        <div class="d-flex ga-1 z21">
          <!-- <v-btn>CN</v-btn> -->
          <v-btn
            :icon="hideText ? 'mdi-eye-off' : 'mdi-eye'"
            :size="36"
            @click.stop="hideText = !hideText"
          ></v-btn>
          <!-- <v-btn icon="mdi-volume-high" :size="36"></v-btn> -->
          <v-btn id="setting-btn" icon="mdi-cog" :size="36"></v-btn>
          <v-btn to="/" icon="mdi-home" :size="36"></v-btn>
          <v-dialog activator="#setting-btn" max-width="400px" opacity="0">
            <v-sheet class="pa-4">
              <div>ID信息</div>
              <v-text-field v-model="terraReader.nickname"></v-text-field>
              <div>对话框透明度</div>
              <v-slider v-model="terraReader.modalAlpha" step="1">
                <template #append>
                  <v-text-field
                    v-model="terraReader.modalAlpha"
                    :min-width="60"
                    hide-details
                    density="compact"
                  >
                    <template #append>%</template>
                  </v-text-field>
                  <v-btn
                    size="xsmall"
                    class="ml-2"
                    icon="mdi-restart"
                    variant="text"
                    @click="terraReader.modalAlpha = 40"
                  ></v-btn>
                </template>
              </v-slider>
              <div>字体大小</div>
              <v-slider
                v-model="terraReader.fontSize"
                step="1"
                min="12"
                max="72"
              >
                <template #append>
                  <v-text-field
                    v-model="terraReader.fontSize"
                    :min-width="60"
                    hide-details
                    density="compact"
                  >
                  </v-text-field>
                  <v-btn
                    size="xsmall"
                    class="ml-2"
                    icon="mdi-restart"
                    variant="text"
                    @click="terraReader.fontSize = 24"
                  ></v-btn>
                </template>
              </v-slider>
              <div>两侧可翻页占比</div>
              <v-slider v-model="terraReader.optPercent" step="1" max="50">
                <template #append>
                  {{ terraReader.optPercent }}%
                  <v-btn
                    size="xsmall"
                    class="ml-2"
                    icon="mdi-restart"
                    variant="text"
                    @click="terraReader.optPercent = 15"
                  ></v-btn>
                </template>
              </v-slider>
            </v-sheet>
          </v-dialog>
        </div>
        <div v-if="!mobile" class="position-absolute d-flex z21">
          <!-- <v-btn v-if="selection[0].type === 'main'">上一章</v-btn>
        <v-div v-else class="w100"></v-div> -->
          <v-btn
            v-if="siblings.prev"
            class="w100"
            color="warning"
            @click.stop="optStage(true)"
          >
            上一节
          </v-btn>
          <v-div v-else class="w100"></v-div>
          <v-btn v-if="page > 0" class="w100" @click.stop="optPage(true)">
            上一页
          </v-btn>
          <v-div v-else class="w100"></v-div>
          <v-btn
            v-if="page + 1 < story.scenes.length"
            class="w100"
            @click.stop="optPage(false)"
          >
            下一页
          </v-btn>
          <v-div v-else class="w100"></v-div>
          <v-btn
            v-if="siblings.next"
            class="w100"
            color="warning"
            @click.stop="optStage(false)"
          >
            下一节
          </v-btn>
          <v-div v-else class="w100"></v-div>
          <!-- <v-btn v-if="selection[0].type === 'main'">下一章</v-btn>
        <v-div v-else class="w100"></v-div> -->
        </div>
      </div>
    </div>
  </v-sheet>
</template>
<script setup>
import { useDisplay } from 'vuetify'
import { getTEXT } from '@/utils/utils'
import { useSystemStore } from '@/stores/system'

const DATA_SOURCE =
  'https://raw.githubusercontent.com/Kengxxiao/ArknightsGameData/master/'
const LANG = 'zh_CN'
const dbSource = `${DATA_SOURCE}${LANG}`
const AVG_SOURCE =
  'https://raw.githubusercontent.com/akgcc/arkdata/main/assets/torappu/dynamicassets/avg/'

const { readerStage, allStages } = defineProps({
  readerStage: {
    type: Object,
    default() {
      return {}
    }
  },
  allStages: {
    type: Object,
    default() {
      return {}
    }
  }
})

const story = reactive({
  title: '',
  scenes: []
})
const page = ref(0)
const selection = reactive({ stages: [] })
const scene = computed(() =>
  story.scenes.length ? story.scenes[page.value] : null
)

watch(
  () => readerStage,
  (_, oldValue) => {
    if (!oldValue.storyId) formatStory(readerStage)
  }
)

function switchStages(stages) {
  selection.stages = stages
}
function switchStage(stage) {
  selectStage(stage)
}
const emit = defineEmits(['change'])
function selectStage(stage) {
  formatStory(stage)
  let str = stage.storyId.split('_level_')[1]
  if (stage.type !== 'main') {
    str = str.substring(
      str.indexOf(stage.storyGroup) + stage.storyGroup.length + 1
    )
  }
  emit('change', [stage.type, stage.storyGroup, str])
}

const system = useSystemStore()
const terraReader = computed(() => system.terraReader)
system.$subscribe(() => {
  localStorage.setItem('btr', JSON.stringify(terraReader.value))
})

const readerRef = ref()
const modalRef = ref()
const readerScreen = reactive({ width: 0, height: 0, x: 16, y: 16 })
const { mobile } = useDisplay()
onMounted(() => {
  setReader()
})
window.onresize = () => {
  setReader()
}
function setReader() {
  const screen = getComputedStyle(readerRef.value)
  readerScreen.width = Number(screen.width.match(/(.*)px/)[1])
  readerScreen.height = Number(screen.height.match(/(.*)px/)[1])
}
const siblings = computed(() => {
  let prev = null
  let next = null
  const stages = selection.stages
  const pos = readerStage.order
  if (pos > 0) {
    prev = stages[pos - 1]
  }
  if (pos + 1 < stages.length) {
    next = stages[pos + 1]
  }
  return { prev, next }
})

const optPanelOn = ref(true)
function optAll(e) {
  const { width, height, x: ox, y: oy } = readerScreen
  const x = e.clientX - ox
  const y = e.clientY - oy
  const modalPercent = terraReader.value.optPercent / 100
  const optHeight = 50
  if (y > height - optHeight) {
    // 按钮区
    optPanelOn.value = !optPanelOn.value
    return
  }
  if (x < width * modalPercent) {
    if (!optPage(true)) {
      optStage(true)
    }
  } else if (x > width * (1 - modalPercent)) {
    if (!optPage(false)) {
      optStage(false)
    }
  }
}
function optPage(prev) {
  let res = false
  if (prev) {
    if (page.value > 0) {
      page.value--
      res = true
    }
  } else {
    if (page.value + 1 < story.scenes.length) {
      page.value++
      res = true
    }
  }
  reset()
  return res
}
function optStage(prev) {
  if (prev) {
    if (siblings.value.prev) {
      selectStage(siblings.value.prev)
    }
  } else {
    if (siblings.value.next) {
      selectStage(siblings.value.next)
    }
  }
}

const blockerColor = computed(() => {
  let r = 0
  let g = 0
  let b = 0
  let a = 0
  const blocker = scene.value.blocker
  if (blocker.a != 0) {
    r = blocker.r
    g = blocker.g
    b = blocker.b
    a = blocker.a
  }
  return `rgba(${255 * r},${255 * g},${255 * b},${a})`
})
const hideText = ref(false)
const hiddenRows = ref(new Set())
const shownRows = ref(new Set())

function reset() {
  if (modalRef.value) modalRef.value.scrollTop = 0
  calDecisions()
}
function calDecisions() {
  if (!story.scenes.length) return
  hiddenRows.value.clear()
  shownRows.value.clear()
  for (const t in story.scenes[page.value].texts) {
    const text = story.scenes[page.value].texts[t]
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
async function formatStory(stage) {
  story.title = `${stage.storyCode} ${stage.storyName} ${stage.avgTag}`
  story.scenes = []
  const txt = await getTEXT(`${dbSource}/gamedata/story/${stage.storyTxt}.txt`)
  const lines = txt.matchAll(/^(\[[^\]]+])?(.*)?$/gim)
  const speakers = new Set()
  page.value = 0
  let index = 0
  let row = 0
  let bg = 'bg_black'
  let bgFolder = 'backgrounds'
  let bgGray = 0
  let blocker = { a: 0 }
  let cgitem = ''
  let stickerHolder = false
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

    cmd = typeof cmd === 'string' ? cmd.toLowerCase() : cmd
    const prevScene = computed(() => story.scenes[index - 1])

    if (
      line[1] &&
      args &&
      'name' in args &&
      line[2] &&
      line[2].trim() &&
      !cmd
    ) {
      speakers.add(args.name)
      addText(line[2], { speaker: args.name })
    }
    if (cmd === 'cameraeffect') {
      if (args.effect === 'Grayscale') {
        bgGray = args.amount
        if (
          prevScene.value &&
          !prevScene.value.texts.length &&
          !args.initamount
        ) {
          Object.assign(prevScene.value.bgStyle, {
            filter: `grayscale(${bgGray})`
          })
        }
      }
    }
    if (row === 238) {
      // console.log(row)
    }
    if (['background', 'image', 'gridbg'].includes(cmd)) {
      if (args.image || args.imagegroup) {
        bg = (cmd === 'gridbg' ? args.imagegroup : args.image).toLowerCase()
        bgFolder = `${cmd === 'gridbg' ? 'background' : cmd}s`
        // 如果上一张是空白的blocker或者sticker，覆盖，否则新建scene
        if (
          (prevScene.value &&
            prevScene.value.type === 'blocker' &&
            !prevScene.value.texts.length) ||
          stickerHolder
        ) {
          Object.assign(prevScene.value, {
            type: '',
            bg,
            bgFolder,
            bgStyle: {
              filter: `grayscale(${bgGray})`,
              scale: args.xscale || 1
            },
            cgitem,
            blocker: { a: 0 },
            texts: []
          })
        } else {
          story.scenes.push({
            bg,
            bgFolder,
            bgStyle: {
              filter: `grayscale(${bgGray})`,
              scale: args.xscale || 1
            },
            cgitem,
            blocker:
              cmd === 'background' && blocker.a != 1 ? blocker : { a: 0 },
            texts: []
          })
          index++
          decisionStatus = []
          decisionStack = []
        }
      }
    }
    if (cmd === 'blocker') {
      const { a, r, g, b } = args
      blocker = { a, r, g, b }
      // 如果透明度为1并且上一张不是空白blocker/sticker则新建scene
      if (
        a == 1 &&
        !(
          prevScene.value &&
          prevScene.value.type === 'blocker' &&
          !prevScene.value.texts.length
        ) &&
        !stickerHolder
      ) {
        story.scenes.push({
          type: 'blocker',
          bg,
          bgFolder,
          bgStyle: {},
          cgitem,
          blocker,
          texts: []
        })
        index++
        decisionStatus = []
        decisionStack = []
      }
    }
    if (cmd === 'cgitem') {
      cgitem = args.image
      prevScene.value.cgitem = cgitem
    }
    if (cmd === 'hidecgitem') {
      cgitem = ''
    }
    if (cmd === 'subtitle') {
      if (args.text) addText(args.text)
    }
    if (cmd === 'sticker') {
      if (args.text || args.id === 'st1') {
        addText(args.text || '', {
          type: 'sticker',
          force: args.id === 'st1' && !args.multi,
          info: { align: args.alignment, width: args.width, size: args.size }
        })
      }
    }
    if (cmd === 'animtext') {
      if (args.name === 'group_location_stamp') {
        const title = line[2].match(/<p=1>(.*?)<\/>/)
        const content = line[2].match(/<p=2>(.*?)<\/>/)
        addText(`${title[1]}\n${content[1]}`)
      }
    }
    if (cmd === 'decision') {
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
          d.rid = prevScene.value.texts.length
          d.row = row
        } else {
          newStack.push({
            value: v,
            pid: index - 1,
            rid: prevScene.value.texts.length,
            row
          })
        }
      })
      const rid = prevScene.value.texts.length
      prevScene.value.texts.push({
        rid,
        decisions,
        row
      })
      addToDecision(rid)
      decisionStack = [...newStack]
    }
    if (cmd === 'predicate') {
      decisionStatus = args.references.split(';')
    }
    if (!line[1]) {
      addText(line[0])
    }
    function addText(text, params = {}) {
      let rid = 0
      const { speaker, type, force, info } = params
      text = text.replace(/\\n/g, '\n')
      if (
        !prevScene.value ||
        (prevScene.value.texts.length &&
          !stickerHolder &&
          (force || prevScene.value.type !== type))
      ) {
        story.scenes.push({
          bg,
          bgFolder,
          blocker,
          type,
          texts: [
            {
              rid,
              row,
              text,
              speaker,
              type,
              info
            }
          ]
        })
        index++
        decisionStatus = []
        decisionStack = []
      } else {
        rid = prevScene.value.texts.length
        prevScene.value.type = type
        prevScene.value.blocker = blocker
        prevScene.value.texts.push({
          rid,
          row,
          text,
          speaker,
          type,
          info
        })
      }
      stickerHolder = !text
      addToDecision(rid)
    }
    function addToDecision(rid) {
      // console.log(rid, decisionStatus, decisionStack)
      if (decisionStatus.length) {
        decisionStatus.forEach((d) => {
          const decision = decisionStack.find((v) => v.value === d)
          if (decision && decision.rid !== rid) {
            story.scenes[decision.pid].texts[decision.rid].decisions
              .find((v) => v.value === d)
              .refers.push(rid)
          }
        })
      }
    }
    row++
  }
  const lastPage = story.scenes[story.scenes.length - 1]
  if (lastPage) {
    if (!lastPage.texts.length || stickerHolder) {
      story.scenes.pop()
    }
  }
  reset()
}
</script>
