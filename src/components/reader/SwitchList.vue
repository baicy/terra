<template>
  <div ref="listRef" class="switch-list d-flex h300 flex-column overflow-auto">
    <div
      v-for="item in items"
      :key="item[idProp]"
      class="switch-list-item cursor-pointer pa-2"
      :class="{ 'text-primary switch-list-item-selected': item[idProp] === id }"
      @click="select(item)"
    >
      <slot name="item" v-bind="item">
        {{ item.title }}
      </slot>
    </div>
  </div>
</template>
<script setup>
const { items, selected, idProp } = defineProps({
  items: {
    type: Object,
    default: () => ({})
  },
  selected: {
    type: String,
    default: () => ''
  },
  idProp: {
    type: String,
    default: () => 'id'
  }
})
const id = ref('')
const listRef = ref()
onMounted(async () => {
  id.value = selected
  await nextTick()
  const selectedItem = listRef.value.querySelector('.text-primary')
  if (selectedItem) selectedItem.scrollIntoView()
})
watch(
  () => items,
  () => {
    listRef.value.scrollTop = 0
  }
)
const emit = defineEmits(['select'])
function select(item) {
  id.value = item[idProp]
  emit('select', item)
}
</script>
<style scoped lang="sass">
.switch-list-item
  &:hover
    color: rgb(var(--v-theme-primary))
  &.switch-list-item-selected
    background-color: rgb(var(--v-theme-primary), var(--v-activated-opacity))
</style>
