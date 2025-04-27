import { ref, reactive } from 'vue'
import { defineStore } from 'pinia'
import type { Affair } from '@/utils/types'

export const useSystemStore = defineStore('system', () => {
  const infoDialog = reactive({ open: false, type: '', item: null })
  const activities = ref([] as Affair[])

  return { infoDialog, activities }
})
