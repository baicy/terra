<template>
  <v-sheet
    class="w-100 h-100 overflow-auto d-flex justify-center align-center position-relative"
  >
    <div
      class="position-absolute"
      :style="{
        width: `${width * size}px`,
        height: `${(height + 2) * size}px`
      }"
    >
      <v-sheet
        v-for="cube in cubes"
        :key="cube.id"
        :elevation="3"
        class="bt-map position-absolute d-flex align-center justify-center cursor-pointer"
        :color="cube.id === player.location ? 'primary' : 'white'"
        :style="{
          left: `${cube.x}px`,
          top: `${cube.y}px`,
          width: `${size}px`,
          height: `${size}px`
        }"
        @click="showMapInfo(cube)"
      >
        {{ cube.id }}
      </v-sheet>
    </div>
    <v-dialog v-model="mapInfo.open" max-width="400px">
      <v-sheet class="pa-4">{{ mapInfo.id }}</v-sheet>
    </v-dialog>
    <div class="b1 h500 w1200">
      <div>
        <v-btn variant="text" readonly class="w100">San</v-btn>
        <v-btn variant="text" readonly class="w100">{{ player.sanity }}</v-btn>
      </div>
      <div>
        <v-btn :disabled="!player.dice" class="w100" @click="roll()">
          Roll({{ player.dice }})
        </v-btn>
        <v-btn variant="text" readonly>{{ player.point }}</v-btn>
      </div>
      <div>
        <v-btn class="w100" @click="stay()">stay</v-btn>
      </div>
      <div>
        <div>{{ player.action }}</div>
      </div>
    </div>
  </v-sheet>
</template>
<script setup>
const cubes = reactive({})
const total = 100
const width = 35
const height = total / 2 - width
const size = 40
// const mapNations = {
// yan:5,
// egir:2,
// columbia:4,
// siesta:1,
// iberia:3,
// kazimierz:3,
// kjerag:1,
// laterano:1,
// leithanien:3,
// sami:2,
// sargon:5,
// siracusa:3,
// ursus:5,
// victoria:5,
// kazdel:1
// }
for (let i = 0; i < total; i++) {
  let x = 0
  let y = 0
  if (i < width) {
    x = size * i
    y = 0
  } else if (i < width + height) {
    x = size * (width - 1)
    y = size * (i - width + 1)
  } else if (i < total - height) {
    x = size * (total - height - i - 1)
    y = size * (height + 1)
  } else {
    x = 0
    y = size * (total - i)
  }
  cubes[i] = {
    id: i,
    x,
    y,
    content: i
  }
}
const mapInfo = reactive({
  open: false,
  id: -1
})
function showMapInfo(cube) {
  mapInfo.open = true
  mapInfo.id = cube.id
}
const player = reactive({
  sanity: 180,
  gold: 10,
  dice: 10,
  diceLimit: 6,
  point: 0,
  location: 0,
  action: ''
})
function roll() {
  player.point = Math.ceil(Math.random() * player.diceLimit)
  player.dice--
  player.location += player.point
  if (player.location > total - 1) player.location = total - player.location
  action()
}
function stay() {
  player.dice++
  action()
}
function action() {
  const act = Math.ceil(Math.random() * 100)
  if (act < 5) {
    player.sanity += 10
    player.gold += 1
    player.action = '找到收藏品，理智+10，源石锭+1'
  } else if (act < 20) {
    player.sanity -= 8
    player.gold += 3
    player.action = '遭遇敌人并战斗胜利，理智-8，源石锭+3'
  } else if (act < 50) {
    player.sanity -= 6
    player.gold += 1
    player.action = '发现固源岩，理智-6，源石锭+1'
  } else {
    player.sanity -= 5
    player.action = '什么也没有找到，理智-5'
  }
}
</script>
