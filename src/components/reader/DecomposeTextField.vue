<template>
  <v-text-field
    v-model="text"
    :prepend-inner-icon="icon"
    color="primary"
    hide-details
    density="compact"
    @compositionstart="startComposition"
    @compositionend="endComposition"
    @input="normalInput"
  ></v-text-field>
</template>
<script setup>
const { icon } = defineProps({ icon: { type: String, default: () => '' } })
const text = ref('')
const composing = ref(false)

const emit = defineEmits(['input'])
function startComposition() {
  composing.value = true
}
function endComposition() {
  composing.value = false
  emit('input', text.value.trim())
}
function normalInput() {
  if (composing.value) return
  emit('input', text.value.trim())
}
</script>
