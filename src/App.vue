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
import { useSpatialNavigation } from "./helper/navigation";
import { onMounted, nextTick, onBeforeUnmount, watch } from "vue";

const $route = useRoute();
const spatial = useSpatialNavigation({
  straightOnly: false,
  selectors: [".spatial-item"],
});

onMounted(async () => {
  await nextTick();
  spatial.init();
  spatial.refresh();
  spatial.focusFirst();
});
watch(
  () => $route.fullPath,
  async () => {
    setTimeout(() => {
      spatial.refresh();
      spatial.focusFirst();
    }, 1000);
  },
);
onBeforeUnmount(() => {
  spatial.cleanup();
});
</script>

<style scoped>
/* Parent layout: navigation drawer + main side by side */
.app-layout {
  display: flex;
  height: 100vh;
  width: 100%;
  overflow: hidden;
}

/* Main takes the remaining space next to the drawer */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  height: 100vh;
  margin: 0 auto;
}

.v-container {
  flex: 1;
  display: flex;
  flex-direction: column;
}
</style>
