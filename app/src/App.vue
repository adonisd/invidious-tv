<template>
  <v-app id="invidious-vue-app" dark>
    <div class="app-layout">
      <NavigationDrawer />
      <v-main class="main-content">
        <v-container fluid class="fill-height" style="overflow: hidden">
          <RouterView v-slot="{ Component }">
            <v-fade-transition hide-on-leave>
              <component :is="Component" :key="$route.fullPath" />
            </v-fade-transition>
          </RouterView>
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

const localUsers = new LocalUsers();
const $route = useRoute();
const router = useRouter();
const spatial = useSpatialNavigation({
  straightOnly: false,
  selectors: [
    ".spatial-item",
    ".shaka-tooltip",
    ".shaka-overflow-button",
    "button",
    "input",
    "v-field__input",
    "select",
    ".v-select__selection",
    ".shaka-play-button",
  ],
  onBack: () => {
    // if full screen, should exit full screen
    if (document.fullscreenElement) {
      document.exitFullscreen();
      return;
    }
    // if video is playing, pause it
    const video = document.querySelector("video");
    if (video && !video.paused) {
      video.pause();
      return;
    }
    if (spatial.currentFocusedElement.value !== null) {
      const whoAmI = spatial.whoAmI(spatial.currentFocusedElement.value);
      if (whoAmI === "main-content") {
        const navDrawer = document.querySelector(".first-nav-item") as HTMLElement;
        if (navDrawer) spatial.focusElement(navDrawer);
        return;
      }

      if (whoAmI === "nav-drawer") {
        // TODO: if on nav bar then close the app
      }
    }
    router.back();
  },
});

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
    }, 1000);
  },
);
onBeforeUnmount(() => {
  spatial.cleanup();
});
</script>

<style>
* {
  font-family: "Roboto", sans-serif;
}

body {
  background-color: rgb(var(--v-theme-background));
}

.v-container {
  padding: 0 !important;
  margin: 0 !important;
}

.spatial-focus {
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
  transform: scale(1.2);
}

.spatial-focus.shaka-tooltip {
  background-color: rgba(var(--v-theme-background), 0.5);
  border: 1px solid rgba(var(--v-theme-background), 0.2);
  border-radius: 25%;
  color: rgb(var(--v-theme-on-surface));
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
