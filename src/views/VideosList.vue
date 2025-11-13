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
    <v-row v-if="loading" class="justify-center my-4">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </v-row>

    <!-- Intersection observer target -->
    <div ref="loadMoreTrigger" style="height: 1px"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
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
  observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[0];
      if (!entry) return;
      if (entry.isIntersecting && !loading.value && hasMorePages.value) {
        loadVideos(currentPage.value + 1);
      }
    },
    {
      rootMargin: "200px", // Start loading 200px before reaching the trigger
    },
  );

  if (loadMoreTrigger.value) {
    observer.observe(loadMoreTrigger.value);
  }
};

onMounted(async () => {
  // Load initial videos
  await loadVideos(1);

  // Setup infinite scroll only for Feed route (since that's the only one with pagination)
  if (route.name === "Feed") {
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
