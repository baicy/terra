<template>
  <v-footer
    height="40"
    color="secondary"
    app
  >
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

<script setup lang="ts">
  const items = [
    {
      id: 'log',
      title: '事务',
      href: '/log',
    },
    {
      id: 'material',
      title: '资源',
      href: '/material',
    },
    {
      id: 'story',
      title: '故事',
      href: '/story',
    },
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
