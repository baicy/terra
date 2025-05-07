<template>
  <div style="white-space: pre-wrap">
    <template v-for="(line, index) in outputs" :key="index">
      <i v-if="line.type === 'i'">{{ line.text }}</i>
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
  const str = text.replace('{@nickname}', nickname.value)
  const hasItalic = /(\s*)<i>(.*)<\/i>(\s*)/g.exec(str)
  if (hasItalic) {
    const [, pre, content, append] = hasItalic
    rows.push({ text: pre })
    rows.push({ type: 'i', text: content })
    rows.push({ text: append })
  } else {
    rows.push({ text: str })
  }
  return rows
})
</script>
