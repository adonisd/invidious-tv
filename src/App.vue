<script setup lang="ts">
import { RouterView } from "vue-router";
import HeaderBar from "./components/HeaderBar.vue";
</script>

<template>
  <HeaderBar />
  <RouterView />
</template>

<style>
@media (min-width: 1024px) {
  #app {
    grid-template-columns: auto;
  }
}
body {
  margin: 0;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #121212;
}
</style>
