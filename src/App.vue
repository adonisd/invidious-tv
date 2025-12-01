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
import { useRoute, useRouter } from "vue-router";
import { useSpatialNavigation } from "./helper/navigation";
import { onMounted, nextTick, onBeforeUnmount, watch, ref } from "vue";
import { LocalUsers } from "./helper/users";

const $route = useRoute();
const spatial = useSpatialNavigation({
  straightOnly: false,
  selectors: [".spatial-item", ".shaka-tooltip", ".shaka-overflow-button", "button"],
});
const router = useRouter();
const localUsers = new LocalUsers();

const isLoading = ref(true);
const error = ref("");

onMounted(async () => {
  console.log("Current URL:", window.location.href);
  console.log("Search params:", window.location.search);

  try {
    const token = localUsers.parseAuthCallback();

    if (token) {
      console.log("Authentication successful! Token:", token.substring(0, 10) + "...");
      // Give user feedback before redirecting
      setTimeout(() => {
        router.push("/");
      }, 500);
    } else {
      console.error("No token found in URL");
      error.value = "No authentication token found in the URL";
      isLoading.value = false;
    }
  } catch (e) {
    console.error("Error parsing token:", e);
    error.value = "Failed to parse authentication token";
    isLoading.value = false;
  }
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

<style>
* {
  font-family: "Roboto", sans-serif;
}

body {
  background-color: rgb(var(--v-theme-background));
}

.spatial-focus {
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
  transform: scale(1.07);
}

.spatial-focus.shaka-tooltip {
  /* Your CSS styles here */
  background-color: rgba(var(--v-theme-primary), 0.2);
  border: 1px solid rgba(var(--v-theme-primary), 0.2);
  border-radius: 25%;
}

.v-btn__overlay,
.v-list-item__overlay,
.v-card__overlay {
  opacity: 0.08 !important;
}

.v-btn:hover .v-btn__overlay,
.v-list-item:hover .v-list-item__overlay {
  opacity: 0.12 !important;
}

.v-btn:active .v-btn__overlay,
.v-list-item:active .v-list-item__overlay {
  opacity: 0.18 !important;
}

.v-btn:focus .v-btn__overlay,
.v-list-item:focus .v-list-item__overlay {
  opacity: 0.1 !important;
}

.v-ripple__container {
  opacity: 0.2 !important;
}
</style>
