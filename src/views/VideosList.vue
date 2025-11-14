<template>
  <div>
    <v-row style="width: 100">
      <v-col
        v-for="video in videos"
        :key="video.videoId"
        :data-video-id="video.videoId"
        class="custom-col"
      >
        <VideoCard :video="video" />
      </v-col>
    </v-row>

    <!-- Loading indicator -->
    <div v-if="loading" class="text-center my-4">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </div>

    <!-- Intersection observer target - placed outside v-row -->
    <div ref="loadMoreTrigger" style="height: 20px; width: 100%; background: red"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from "vue";
import VideoCard from "@/components/VideoCard.vue";
import { InvidiousHelper } from "@/helper/invidious";
import type { Video } from "@/interfaces/videos";
import { useRoute } from "vue-router";

const videos = ref<Video[]>([]);
const invidious = new InvidiousHelper();
const route = useRoute();
const loading = ref(false);
const currentPage = ref(1);
const hasMorePages = ref(true);
const loadMoreTrigger = ref<HTMLElement | null>(null);
let observer: IntersectionObserver | null = null;

const loadVideos = async (page: number) => {
  if (loading.value || !hasMorePages.value) return;

  loading.value = true;
  const userSettings = invidious.getUserSettings();
  const showShorts = userSettings ? userSettings.showShorts : true;

  try {
    let newVideos: Video[] = [];
    if (route.name === "Popular" || route.name === "Root") {
      newVideos = await invidious.getPopular();
    } else if (route.name === "Trending") {
      newVideos = await invidious.getTrending();
    } else if (route.name === "Feed") {
      newVideos = await invidious.getPersonalFeed(undefined, page);
    }

    if (!showShorts) {
      newVideos = newVideos.filter((video) => video.lengthSeconds !== 0);
    }

    // Check if we got any videos back
    if (newVideos.length === 0) {
      hasMorePages.value = false;
    } else {
      videos.value = [...videos.value, ...newVideos];
      currentPage.value = page;
    }
  } catch (error) {
    console.error("Failed to fetch videos", error);
    hasMorePages.value = false;
  } finally {
    loading.value = false;
  }
};

const setupIntersectionObserver = () => {
  console.log("Setting up intersection observer for infinite scroll");
  observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[0];
      if (!entry) {
        console.warn("No intersection entry found");
        return;
      }

      console.log("Intersection detected:", {
        isIntersecting: entry.isIntersecting,
        intersectionRatio: entry.intersectionRatio,
        loading: loading.value,
        hasMorePages: hasMorePages.value,
      });

      if (entry.isIntersecting && !loading.value && hasMorePages.value) {
        console.log("Loading more videos...");
        loadVideos(currentPage.value + 1);
      }
    },
    {
      root: null, // Use viewport as root
      rootMargin: "200px", // Start loading 200px before reaching the trigger
      threshold: 0.1, // Trigger when 10% of the element is visible
    },
  );

  if (loadMoreTrigger.value) {
    console.log("Observing trigger element:", loadMoreTrigger.value);
    observer.observe(loadMoreTrigger.value);
  } else {
    console.error("loadMoreTrigger ref is null!");
  }
};

onMounted(async () => {
  // Load initial videos
  await loadVideos(1);

  // Setup infinite scroll only for Feed route (since that's the only one with pagination)
  if (route.name === "Feed") {
    // Wait for DOM to be fully updated before setting up observer
    await nextTick();
    setupIntersectionObserver();
  }
});

onUnmounted(() => {
  if (observer) {
    observer.disconnect();
  }
});
</script>

<style scoped>
.custom-col {
  flex: 0 0 22%;
  max-width: 22%;
}
</style>
