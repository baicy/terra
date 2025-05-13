<template>
  <v-sheet class="w-100 h-100 d-flex flex-column position-absolute top-0">
    <div
      ref="readerRef"
      class="px-8 py-6 position-relative text-white d-flex justify-center align-center"
      style="height: 100%; background-color: black"
      :style="{
        fontSize: `${terraReader.fontSize}px`
      }"
      @click="optAll($event)"
    >
      <!-- loading layer: 99 -->
      <div
        v-if="loading"
        class="w-100 h-100 bg-black position-absolute z99 d-flex align-center justify-center"
      >
        加载中
      </div>
      <!-- bg/largebg layer: 1 -->
      <div
        v-if="scene"
        class="position-absolute top-0 left-0 w-100 h-100 overflow-hidden z1"
        :class="{
          'd-flex justify-center align-center':
            story.resources[scene.bg].length > 1
        }"
      >
        <div
          :class="{
            'd-flex flex-wrap': story.resources[scene.bg].length > 1
          }"
        >
          <img
            v-for="(url, index) in story.resources[scene.bg]"
            :key="index"
            :src="url"
            :alt="`bg${index}`"
            :style="{
              width: story.resources[scene.bg].length > 1 ? '50%' : '100%',
              ...bgStyle
            }"
          />
        </div>
      </div>
      <!-- image/gridbg layer: 2 -->
      <div
        v-if="scene && scene.img"
        class="position-absolute top-0 left-0 w-100 h-100 overflow-hidden text-center z2"
      >
        <div
          :class="{
            'd-flex flex-wrap position-absolute bottom-0':
              story.resources[scene.img].length > 1
          }"
        >
          <img
            v-for="(url, index) in story.resources[scene.img]"
            :key="index"
            :src="url"
            :alt="`img${index}`"
            :style="{
              width: story.resources[scene.img].length > 1 ? '50%' : '100%',
              ...bgStyle
            }"
          />
        </div>
      </div>
      <!-- blocker layer: 3 -->
      <div
        v-if="scene"
        class="position-absolute top-0 left-0 w-100 h-100 z3"
        :style="{ backgroundColor: blockerColor }"
      ></div>
      <!-- cgitems layer: 4 -->
      <div
        v-if="scene && scene.item"
        class="position-absolute top-0 left-0 w-100 h-100 d-flex justify-center align-center z4"
      >
        <img :src="story.resources[scene.item][0]" style="max-height: 100%" />
      </div>
      <!-- modal layer: 10 -->
      <div
        v-if="scene && scene.texts.length && !hideText"
        ref="modalRef"
        class="d-flex flex-column ga-3 overflow-auto px-2 py-6 position-relative z10 btr-modal"
        style="width: calc(100% - 16px); height: calc(100% - 16px)"
        :style="{
          backgroundColor: `rgba(0,0,0,${terraReader.modalAlpha / 100})`
        }"
      >
        <div
          v-for="(line, index) in scene.texts.filter(
            (l) => !story.hiddens.has(l.id)
          )"
          :key="index"
          class="d-flex flex-column btr-modal-line"
        >
          <div v-if="line.type === 'decision'" class="text-center w-100 px-4">
            <div
              class="d-flex flex-column ga-1 align-center py-2"
              style="background-color: #ffffff33"
            >
              <div
                v-for="(option, value) in line.options"
                :key="value"
                class="b1 px-2 cursor-pointer"
                :class="{ 'text-primary': line.choice === value }"
                style="
                  background-color: #00000099;
                  min-width: 600px;
                  max-width: calc(100% - 12px);
                "
                @click.stop="decide(value, line)"
              >
                <reader-text :text="option"></reader-text>
              </div>
            </div>
          </div>
          <div
            v-else-if="line.type === 'sticker'"
            class="d-flex justify-center"
          >
            <div
              :class="[`text-${line.align}`]"
              style="max-width: calc(100% - 32px)"
              :style="{
                fontSize: `${(line.size || 24) / 24}em`
              }"
            >
              <reader-text :text="line.text"></reader-text>
            </div>
          </div>
          <div v-else class="d-flex">
            <div class="pr-4 text-right" style="flex: 1.5 50px">
              {{ line.speaker }}
            </div>
            <reader-text style="flex: 6 300px" :text="line.text"></reader-text>
          </div>
        </div>
      </div>
      <!-- options layer: 20, 21 -->
      <div
        v-if="optPanelOn"
        class="w-100 d-flex justify-center align-center position-absolute bottom-0 z20 ts18"
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
        <div class="d-flex ga-1 z21 mr-2">
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
          <template v-for="btn in OPT_BUTTONS" :key="btn.id">
            <v-btn
              v-if="btn.show()"
              :icon="btn.icon"
              :size="36"
              :title="btn.title"
              @click.stop="btn.target"
            ></v-btn>
            <div v-else class="w36"></div>
          </template>
          <!-- <v-btn v-if="selection[0].type === 'main'">下一章</v-btn>
        <v-div v-else class="w100"></v-div> -->
        </div>
      </div>
      <!-- info layer: 22 -->
      <div class="position-absolute top-0 right-0 h20 z22 ts16 pa-1">
        {{
          `${page < 9 ? '&nbsp;' : ''}${page + 1} / ${scenes.length < 9 ? '&nbsp;' : ''}${scenes.length}`
        }}
      </div>
    </div>
  </v-sheet>
</template>
<script setup>
import { useDisplay } from 'vuetify'
import { useSystemStore } from '@/stores/system'
import { useStoryStore } from '@/stores/story'

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

const loading = ref(false)
const page = ref(0)
const selection = reactive({ stages: [] })
const storyStore = useStoryStore()
const story = computed(() => storyStore.story)
const scenes = computed(() =>
  story.value.scenes.filter((s) => !story.value.hiddens.has(s.id))
)
const scene = computed(() =>
  story
    ? scenes.value[page.value]
    : {
        id: '',
        bg: '',
        img: '',
        bgEffect: { gray: 0 },
        blocker: { r: '0', b: '0', b: '0', a: '0' },
        texts: []
      }
)
const bgStyle = computed(() => {
  const styles = {}
  for (const i in scene.value.bgEffect) {
    if (i === 'gray') {
      styles.filter = `grayscale(${scene.value.bgEffect[i]})`
    }
    if (i === 'scale') {
      styles.scale = scene.value.bgEffect[i]
    }
  }
  return styles
})
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

watch(
  () => readerStage,
  (_, oldValue) => {
    if (!oldValue.storyId) formatStory(readerStage)
  }
)

async function formatStory(stage) {
  loading.value = true
  await storyStore.loadStage(stage)
  loading.value = false
}
function decide(value, line) {
  line.choice = value
  storyStore.calHiddens(line)
}

function switchStages(stages) {
  selection.stages = stages
}
async function switchStage(stage) {
  await selectStage(stage)
  if (modalRef.value) modalRef.value.scrollTop = 0
  page.value = 0
}
const emit = defineEmits(['change'])
async function selectStage(stage) {
  await formatStory(stage)
  let str = stage.storyId.split('_level_')[1] || stage.storyId
  if (stage.type !== 'main') {
    str = str.substring(
      str.indexOf(stage.storyGroup) + stage.storyGroup.length + 1
    )
  }
  emit('change', [stage.type, stage.storyGroup, str])
}

const hideText = ref(false)

const system = useSystemStore()
const terraReader = computed(() => system.terraReader)
system.$subscribe(() => {
  localStorage.setItem('btr', JSON.stringify(terraReader.value))
})

const readerRef = ref()
const modalRef = ref()
const readerScreen = reactive({ width: 0, height: 0, x: 0, y: 0 })
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
  if (loading.value) return
  const { width, height, x: ox, y: oy } = readerScreen
  const x = e.clientX - ox
  const y = e.clientY - oy
  const modalPercent = terraReader.value.optPercent / 100
  const optHeight = 65
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

const OPT_BUTTONS = [
  {
    id: 'ps',
    title: '上一节',
    icon: 'mdi-chevron-double-left',
    target: () => optStage(true),
    show: () => siblings.value.prev
  },
  {
    id: 'fp',
    title: '第一页',
    icon: 'mdi-page-first',
    target: () => (page.value = 0),
    show: () => true
  },
  {
    id: 'pp',
    title: '上一页',
    icon: 'mdi-chevron-left',
    target: () => optPage(true),
    show: () => page.value > 0
  },
  {
    id: 'np',
    title: '下一页',
    icon: 'mdi-chevron-right',
    target: () => optPage(false),
    show: () => page.value + 1 < scenes.value.length
  },
  {
    id: 'lp',
    title: '最后一页',
    icon: 'mdi-page-last',
    target: () => (page.value = scenes.value.length - 1),
    show: () => true
  },
  {
    id: 'ns',
    title: '下一节',
    icon: 'mdi-chevron-double-right',
    target: () => optStage(false),
    show: () => siblings.value.next
  }
]
function optPage(prev) {
  let res = false
  if (prev) {
    if (page.value > 0) {
      page.value--
      res = true
      nextTick(() => {
        if (modalRef.value)
          modalRef.value.scrollTop = modalRef.value.scrollHeight
      })
    }
  } else {
    if (page.value + 1 < scenes.value.length) {
      page.value++
      nextTick(() => {
        if (modalRef.value) modalRef.value.scrollTop = 0
      })
      res = true
    }
  }
  return res
}
async function optStage(prev) {
  if (prev) {
    if (siblings.value.prev) {
      await selectStage(siblings.value.prev)
    }
  } else {
    if (siblings.value.next) {
      await selectStage(siblings.value.next)
    }
  }
  nextTick(() => {
    if (modalRef.value) modalRef.value.scrollTop = 0
    page.value = 0
  })
}
</script>
<style scoped lang="sass">
.btr-modal
  &-line:last-child
    :deep(.btr-modal-line-text::after)
      font-family: "Material Design Icons"
      content: '\F1C56'
      color: rgb(var(--v-theme-primary))
      position: relative
      right: -10px
</style>
