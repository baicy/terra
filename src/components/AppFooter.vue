<template>
  <v-footer height="40" color="secondary" app>
    <v-btn
      v-for="item in items"
      :key="item.id"
      :to="item.href"
      color="secondary"
    >
      {{ item.title }}
    </v-btn>
  </v-footer>
</template>

<script setup>
const items = [
  {
    id: 'home',
    title: '首页',
    href: '/'
  },
  {
    id: 'log',
    title: '事务',
    href: '/log'
  },
  {
    id: 'operator',
    title: '干员',
    href: '/operator'
  },
  {
    id: 'material',
    title: '资源',
    href: '/material'
  },
  {
    id: 'story',
    title: '故事',
    href: '/story'
  },
  {
    id: 'furniture',
    title: '家具',
    href: '/furniture'
  },
  {
    id: 'txt',
    title: '剧情',
    href: '/txt'
  },
  {
    id: 'run',
    title: '旅行',
    href: '/run'
  }
]
</script>

<style scoped lang="sass">
.social-link :deep(.v-icon)
  color: rgba(var(--v-theme-on-background), var(--v-disabled-opacity))
  text-decoration: none
  transition: .2s ease-in-out

  &:hover
    color: rgba(25, 118, 210, 1)
</style>
