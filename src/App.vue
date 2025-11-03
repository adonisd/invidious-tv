<template>
  <v-app id="invidious-vue-app" dark>
    <div class="app-layout">
      <NavigationDrawer />
      <v-main class="main-content">
        <v-container fluid class="fill-height">
          <RouterView :key="$route.fullPath" />
        </v-container>
      </v-main>
    </div>
  </v-app>
</template>

<script setup lang="ts">
import NavigationDrawer from "./components/NavigationDrawer.vue";
import { useRoute } from "vue-router";

const $route = useRoute();
</script>

<style scoped>
/* Parent layout: navigation drawer + main side by side */
.app-layout {
  display: flex;
  height: 100vh;
  width: 100%;
  overflow: hidden; /* prevent page scrollbars; we'll handle inside main */
}

/* Main takes the remaining space next to the drawer */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto; /* enables vertical scrolling */
  height: 100vh;
  margin: 0 auto;
}

/* Optional: ensure router content stretches properly */
.v-container {
  flex: 1;
  display: flex;
  flex-direction: column;
}
</style>
