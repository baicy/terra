<template>
  <v-text-field
    v-model="text"
    min-width="200px"
    :prepend-inner-icon="icon"
    :placeholder="placeholder"
    color="primary"
    hide-details
    density="compact"
    @compositionstart="startComposition"
    @compositionend="endComposition"
    @input="normalInput"
  ></v-text-field>
</template>
<script setup>
const { icon, placeholder } = defineProps({
  icon: { type: String, default: () => '' },
  placeholder: { type: String, default: () => '' }
})
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
