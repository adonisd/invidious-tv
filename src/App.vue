<template>
  <v-app id="invidious-vue-app" dark>
    <HeaderBar />

    <v-main>
      <v-container fluid>
        <RouterView />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import HeaderBar from "./components/HeaderBar.vue";
</script>
