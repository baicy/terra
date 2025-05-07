import { ref, reactive } from 'vue'
import { defineStore } from 'pinia'

export const useSystemStore = defineStore('system', () => {
  const infoDialog = reactive({ open: false, type: '', item: null })
  const operatorDialog = reactive({ open: false, char: null })
  const selectedMaterial = ref('')
  const terraReader = reactive({ nickname: '{@nickname}' })

  const btrData = localStorage.getItem('btr') || JSON.stringify(terraReader)
  terraReader.nickname = JSON.parse(btrData).nickname

  return { infoDialog, operatorDialog, selectedMaterial, terraReader }
})
