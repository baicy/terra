/**
 * plugins/vuetify.ts
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import { md1 } from 'vuetify/blueprints'

// Composables
import { createVuetify } from 'vuetify'
import { VChip } from 'vuetify/components'

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  blueprint: md1,
  aliases: {
    VChipKey: VChip
  },
  defaults: {
    VChipKey: { size: 'small', class: 'mr-2' }
  },
  theme: {
    defaultTheme: 'rhodes',
    themes: {
      rhodes: {
        dark: false,
        colors: {
          background: '#e8e8e8',
          surface: '#fafafa',
          primary: '#0098dc',
          secondary: '#313131',
          success: '#aacb62',
          warning: '#ffd900',
          error: '#9d4d64'
        }
      }
    }
  }
})
