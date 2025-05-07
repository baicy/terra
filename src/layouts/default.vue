<template>
  <v-main height="calc(100vh)" class="overflow-auto">
    <router-view />
  </v-main>

  <AppFooter v-if="!independents.includes(route.name)" />
</template>

<script setup>
const route = useRoute()
const independents = ['/txt', '/run']
</script>
