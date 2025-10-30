<template>
  <v-app id="invidious-vue-app" dark>
    <NavigationDrawer />

    <v-main>
      <v-container fluid>
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
</style>
