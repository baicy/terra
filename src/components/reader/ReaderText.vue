<template>
  <div class="btr-modal-line-text" style="white-space: pre-wrap">
    <template v-for="(line, index) in outputs" :key="index">
      <i v-if="line.type === 'i'">{{ line.text }}</i>
      <span v-else-if="line.type === 'color'" :style="{ color: line.color }">
        {{ line.text }}
      </span>
      <span v-else>{{ line.text }}</span>
    </template>
  </div>
</template>
<script setup>
import { useSystemStore } from '@/stores/system'
const { text } = defineProps({
  text: {
    type: String,
    default() {
      return ''
    }
  }
})
const nickname = computed(() => useSystemStore().terraReader.nickname)

const outputs = computed(() => {
  const rows = []
  const str = text.replace(/{@nickname}/g, nickname.value)
  const hasItalic = /([\s\S]*)<i>([\s\S]*)<\/i>([\s\S]*)/g.exec(str)
  const hasColor = /<color=#/g.test(str)
  if (hasItalic) {
    const [, pre, content, append] = hasItalic
    rows.push({ text: pre })
    rows.push({ type: 'i', text: content })
    rows.push({ text: append })
  } else if (hasColor) {
    const begins = Array.from(str.matchAll(/<color=#/g)).map((v) => v.index)
    const ends = Array.from(str.matchAll(/<\/color>/g)).map((v) => v.index)
    for (let i = 0; i < begins.length; i++) {
      let begin = i === 0 ? 0 : ends[i - 1] + 8
      let end = begins[i]
      rows.push({ text: str.substring(begin, end) })
      begin = end + 7
      end = begin + 7
      const color = str.substring(begin, end)
      begin = end + 1
      end = ends[i]
      rows.push({ type: 'color', text: str.substring(begin, end), color })
      if (i === begins.length - 1) {
        begin = end + 8
        end = str.length
        rows.push({ text: str.substring(begin, end) })
      }
    }
  } else {
    rows.push({ text: str })
  }
  return rows
})
</script>
