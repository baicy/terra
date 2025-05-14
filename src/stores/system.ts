import { ref, reactive } from 'vue'
import { defineStore } from 'pinia'

export const useSystemStore = defineStore('system', () => {
  const infoDialog = reactive({ open: false, type: '', item: null })
  const operatorDialog = reactive({ open: false, char: null })
  const selectedMaterial = ref('')

  const terraReaderDefault = {
    nickname: '{@nickname}',
    modalAlpha: 40,
    fontSize: 24,
    pageOptionPercent: 20,
    pageOptionType: 'double',
    pageOptionPanelShown: false
  }
  const terraReader = reactive({ ...terraReaderDefault })
  const btrData = localStorage.getItem('btr') || JSON.stringify(terraReader)
  Object.assign(terraReader, JSON.parse(btrData))
  function resetTerraReader(...params: string[]) {
    params.forEach((p) => (terraReader[p] = terraReaderDefault[p]))
  }

  return {
    infoDialog,
    operatorDialog,
    selectedMaterial,
    terraReader,
    resetTerraReader
  }
})
