<template>
  <div style="white-space: pre-wrap">
    <template v-for="(line, index) in outputs" :key="index">
      <i v-if="line.type === 'i'">{{ line.text }}</i>
      <span v-else>{{ line.text }}</span>
    </template>
  </div>
</template>
<script setup>
const { text } = defineProps({
  text: {
    type: String,
    default() {
      return ''
    }
  }
})
const outputs = computed(() => {
  const rows = []
  const hasItalic = /(\s*)<i>(.*)<\/i>(\s*)/g.exec(text)
  if (hasItalic) {
    const [, pre, content, append] = hasItalic
    rows.push({ text: pre })
    rows.push({ type: 'i', text: content })
    rows.push({ text: append })
  } else {
    rows.push({ text })
  }
  console.log(rows)
  return rows
})
</script>
