<template>
  <v-app id="invidious-vue-app" dark>
    <NavigationDrawer />
    <v-main>
      <v-container fluid class="fill-height d-flex justify-center align-center">
        <RouterView />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import NavigationDrawer from "./components/NavigationDrawer.vue";
</script>

<style>
.router-view {
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* Ensure main takes full viewport height and allows scrolling */
.v-main {
  display: flex;
  min-height: 100vh;
}

.v-main .v-container {
  overflow-y: auto;
}
</style>
