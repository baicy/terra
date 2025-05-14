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
        v-if="scene && scene.texts.length && !hiding"
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
      <!-- gradient toolbar layer:19 -->
      <div
        class="w-100 h60 position-absolute top-0 z19"
        style="background: linear-gradient(#00000099 0%, transparent 100%)"
        @click.stop
      ></div>
      <!-- setting buttons layer: 20 -->
      <div class="position-absolute top-0 left-0 z20 d-flex ga-1 pa-2 ts24">
        <v-btn
          to="/"
          icon="mdi-home"
          size="medium"
          title="首页"
          color="white"
          variant="text"
        ></v-btn>
        <v-btn
          icon="mdi-cog"
          size="medium"
          title="设置(O)"
          color="white"
          variant="text"
          @click.stop="setting = true"
        ></v-btn>
        <v-btn
          id="btn-switch"
          icon="mdi-book-sync-outline"
          size="medium"
          title="切换剧情(O)"
          color="white"
          variant="text"
        ></v-btn>
        <v-btn
          :icon="hiding ? 'mdi-eye-off' : 'mdi-eye'"
          size="medium"
          title="隐藏对话框(H)"
          color="white"
          variant="text"
          @click.stop="hiding = !hiding"
        ></v-btn>
      </div>
      <!-- page option buttons layer: 20 -->
      <div
        v-if="terraReader.pageOptionPanelShown"
        class="w-100 d-flex justify-center align-center position-absolute top-0"
      >
        <div class="z20 pt-1 d-flex">
          <template v-for="btn in OPT_BUTTONS" :key="btn.id">
            <v-btn
              v-if="btn.show()"
              :icon="btn.icon"
              size="x-small"
              class="w32"
              :title="btn.title"
              @click.stop="btn.target"
            ></v-btn>
            <div v-else class="w32"></div>
          </template>
        </div>
      </div>
      <!-- info layer: 20 -->
      <div class="position-absolute top-0 right-0 z20 ts16 pa-1">
        {{
          `${story.title} ${page < 9 ? '&nbsp;' : ''}${page + 1} / ${scenes.length < 9 ? '&nbsp;' : ''}${scenes.length}`
        }}
      </div>
    </div>
  </v-sheet>
  <v-dialog v-model="setting" max-width="800px" opacity="0">
    <v-sheet class="d-flex">
      <v-sheet class="pa-4" width="450px">
        <div class="d-flex">
          <v-text-field
            v-model="terraReader.nickname"
            hide-details
            placeholder="{@nickname}"
            density="compact"
            color="primary"
          >
            <template #prepend>
              <div class="text-medium-emphasis w150">ID信息</div>
            </template>
          </v-text-field>
        </div>
        <div class="d-flex">
          <v-slider
            v-model="terraReader.modalAlpha"
            step="1"
            density="compact"
            hide-details
          >
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
                @click="system.resetTerraReader('modalAlpha')"
              ></v-btn>
            </template>
            <template #prepend>
              <div class="text-medium-emphasis w150 text-left">
                对话框透明度
              </div>
            </template>
          </v-slider>
        </div>
        <div class="d-flex">
          <v-slider
            v-model="terraReader.fontSize"
            step="1"
            min="12"
            max="72"
            density="compact"
            hide-details
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
                @click="system.resetTerraReader('fontSize')"
              ></v-btn>
            </template>
            <template #prepend>
              <div class="text-medium-emphasis w150 text-left">字体大小</div>
            </template>
          </v-slider>
        </div>
        <div class="d-flex">
          <v-slider
            v-model="terraReader.pageOptionPercent"
            step="1"
            max="50"
            density="compact"
            hide-details
          >
            <template #append>
              {{ terraReader.pageOptionPercent }} %
              <v-btn
                size="xsmall"
                class="ml-2"
                icon="mdi-restart"
                variant="text"
                @click="system.resetTerraReader('pageOptionPercent')"
              ></v-btn>
            </template>
            <template #prepend>
              <div class="text-medium-emphasis w150 text-left">
                两侧可翻页占比
              </div>
            </template>
          </v-slider>
        </div>
        <div class="d-flex align-center">
          <div class="text-medium-emphasis w150 text-left">翻页模式</div>
          <v-radio-group
            v-model="terraReader.pageOptionType"
            inline
            class="d-flex"
            hide-details
            density="compact"
            color="primary"
          >
            <v-radio label="双手" value="double"></v-radio>
            <v-radio label="单手(左)" value="left"></v-radio>
            <v-radio label="单手(右)" value="right"></v-radio>
          </v-radio-group>
        </div>
        <div class="d-flex">
          <v-switch
            v-model="terraReader.pageOptionPanelShown"
            color="primary"
            density="compact"
          >
            <template #prepend>
              <div class="text-medium-emphasis w150">显示页面操作按钮</div>
            </template>
          </v-switch>
        </div>
      </v-sheet>
      <v-divider vertical></v-divider>
      <v-sheet class="pa-4 d-flex flex-column ga-1 text-body-2">
        <div class="text-body-1">快捷键（不区分大小写）</div>
        <div>
          <v-chip-key>R</v-chip-key>
          切换剧情
        </div>
        <div>
          <v-chip-key>H</v-chip-key>
          隐藏对话框
        </div>
        <div>
          <v-chip-key>O</v-chip-key>
          设置/帮助面板
        </div>
        <div>
          <v-chip-key>W</v-chip-key>
          <v-chip-key>S</v-chip-key>
          上一节 / 下一节
        </div>
        <div>
          <v-chip-key>A</v-chip-key>
          <v-chip-key>D</v-chip-key>
          上一页 / 下一页
        </div>
        <div>
          <v-chip-key>Q</v-chip-key>
          <v-chip-key>E</v-chip-key>
          第一页 / 最后一页
        </div>
        <div>
          <v-chip-key>J</v-chip-key>
          <v-chip-key>K</v-chip-key>
          往上一行 / 往下一行
        </div>
        <div>
          <v-chip-key>N</v-chip-key>
          <v-chip-key>L</v-chip-key>
          回到顶部 / 滚到底部
        </div>
      </v-sheet>
    </v-sheet>
  </v-dialog>
  <v-menu
    v-model="switching"
    activator="#btn-switch"
    :close-on-content-click="false"
  >
    <v-sheet>
      <reader-switch
        v-if="allStages"
        :all-stages="allStages"
        :selected-stage="readerStage"
        @stages="switchStages"
        @stage="switchStage"
      ></reader-switch
    ></v-sheet>
  </v-menu>
</template>
<script setup>
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
const hiding = ref(false)
const setting = ref(false)
const switching = ref(false)

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
        blocker: { r: '0', g: '0', b: '0', a: '0' },
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
  switching.value = false
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

const system = useSystemStore()
const terraReader = computed(() => system.terraReader)
system.$subscribe(() => {
  localStorage.setItem('btr', JSON.stringify(terraReader.value))
})

const readerRef = ref()
const modalRef = ref()
const readerScreen = reactive({ width: 0, height: 0, x: 0, y: 0 })
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

function optAll(e) {
  if (loading.value || switching.value) return
  const modalPercent = terraReader.value.pageOptionPercent / 100
  const { width, x: ox, height, y: oy } = readerScreen
  const x = e.clientX - ox
  const y = e.clientY - oy
  const left = x < width * modalPercent
  const right = x > width * (1 - modalPercent)
  let status = 0
  switch (terraReader.value.pageOptionType) {
    case 'double':
      status = left ? -1 : right ? 1 : 0
      break
    case 'left':
      if (left) {
        status = y < height / 2 ? -1 : 1
      }
      break
    case 'right':
      if (right) {
        status = y < height / 2 ? -1 : 1
      }
      break
    default:
      break
  }
  if (status === -1) {
    if (!optPage(true)) {
      optStage(true)
    }
  } else if (status === 1) {
    if (!optPage(false)) {
      optStage(false)
    }
  }
}

const OPT_BUTTONS = [
  {
    id: 'ps',
    title: '上一节(W)',
    icon: 'mdi-chevron-double-left',
    target: () => optStage(true),
    show: () => siblings.value.prev
  },
  {
    id: 'fp',
    title: '第一页(Q)',
    icon: 'mdi-page-first',
    target: () => (page.value = 0),
    show: () => page.value
  },
  {
    id: 'pp',
    title: '上一页(A)',
    icon: 'mdi-chevron-left',
    target: () => optPage(true),
    show: () => page.value > 0
  },
  {
    id: 'np',
    title: '下一页(D)',
    icon: 'mdi-chevron-right',
    target: () => optPage(false),
    show: () => page.value + 1 < scenes.value.length
  },
  {
    id: 'lp',
    title: '最后一页(E)',
    icon: 'mdi-page-last',
    target: () => (page.value = scenes.value.length - 1),
    show: () => page.value !== scenes.value.length - 1
  },
  {
    id: 'ns',
    title: '下一节(S)',
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

document.addEventListener('keydown', optKey)
const KEYS = {
  a: () => optPage(true),
  d: () => optPage(false),
  q: () => (page.value = 0),
  e: () => (page.value = scenes.value.length - 1),
  w: () => optStage(true),
  s: () => optStage(false),
  j: () => {
    if (modalRef.value) modalRef.value.scrollTop += terraReader.value.fontSize
  },
  k: () => {
    if (modalRef.value) modalRef.value.scrollTop -= terraReader.value.fontSize
  },
  n: () => {
    if (modalRef.value) modalRef.value.scrollTop = 0
  },
  l: () => {
    if (modalRef.value) modalRef.value.scrollTop = modalRef.value.scrollHeight
  },
  h: () => (hiding.value = !hiding.value),
  o: () => (setting.value = !setting.value),
  r: () => {
    switching.value = !switching.value
  }
}
function optKey(e) {
  if (switching.value) return
  const key = e.key.toLowerCase()
  if (KEYS[key]) KEYS[key]()
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
.v-slider.v-input--horizontal
  margin: 0
</style>
