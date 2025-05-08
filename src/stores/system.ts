import { ref, reactive } from 'vue'
import { defineStore } from 'pinia'

export const useSystemStore = defineStore('system', () => {
  const infoDialog = reactive({ open: false, type: '', item: null })
  const operatorDialog = reactive({ open: false, char: null })
  const selectedMaterial = ref('')
  const terraReader = reactive({
    nickname: '{@nickname}',
    modalAlpha: 40,
    fontSize: 24
  })

  const btrData = localStorage.getItem('btr') || JSON.stringify(terraReader)
  Object.assign(terraReader, JSON.parse(btrData))

  return { infoDialog, operatorDialog, selectedMaterial, terraReader }
})
