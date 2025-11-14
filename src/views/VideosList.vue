<template>
  <div>
    <v-row>
      <v-col v-for="v in videos" :key="v.videoId" class="video-col">
        <VideoCard :video="v" />
      </v-col>
    </v-row>

    <v-row v-if="loading" class="justify-center my-4">
      <v-progress-circular indeterminate color="primary" />
    </v-row>

    <!-- Sentinel -->
    <div ref="sentinel" class="sentinel"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from "vue";
import { useRoute } from "vue-router";
import VideoCard from "@/components/VideoCard.vue";
import { InvidiousHelper } from "@/helper/invidious";
import type { Video } from "@/interfaces/videos";

const route = useRoute();
const invidious = new InvidiousHelper();

const videos = ref<Video[]>([]);
const loading = ref(false);
const page = ref(1);
const hasMore = ref(true);

const sentinel = ref<HTMLElement | null>(null);
let observer: IntersectionObserver | null = null;

/* -----------------------------------------
   Fetch videos with FULL DEBUG LOGGING
------------------------------------------ */
const fetchVideos = async () => {
  console.log("%cfetchVideos called", "color: cyan; font-weight: bold;");
  console.log("loading:", loading.value, "hasMore:", hasMore.value);

  if (loading.value || !hasMore.value) {
    console.log("⛔ Skipping: Already loading or no more pages.");
    return;
  }

  loading.value = true;
  console.log("➡ Starting fetch for page:", page.value);

  try {
    const userSettings = invidious.getUserSettings();
    const showShorts = userSettings ? userSettings.showShorts : true;

    let fetched: Video[] = [];

    console.log("➡ Route:", route.name);

    switch (route.name) {
      case "Popular":
      case "Root":
        fetched = await invidious.getPopular();
        break;

      case "Trending":
        fetched = await invidious.getTrending();
        break;

      case "Feed":
        console.log("➡ Calling getPersonalFeed(page):", page.value);
        fetched = await invidious.getPersonalFeed(undefined, page.value);
        break;

      default:
        console.warn("⚠ Unknown route:", route.name);
    }

    console.log("➡ API returned videos:", fetched.length);

    if (!showShorts) {
      fetched = fetched.filter((v) => v.lengthSeconds !== 0);
      console.log("➡ After shorts filter:", fetched.length);
    }

    if (fetched.length === 0) {
      console.log("❌ No videos returned → stopping pagination");
      hasMore.value = false;
    } else {
      videos.value.push(...fetched);
      page.value++;
      console.log("✔ Added videos → new total:", videos.value.length);
    }

    console.log("➡ Waiting for nextTick() to re-render DOM…");
    await nextTick();
    console.log("✔ DOM updated");
  } catch (e) {
    console.error("❌ Error fetching videos:", e);
    hasMore.value = false;
  } finally {
    loading.value = false;
    console.log("➡ fetchVideos finished — loading set to false");
  }
};

/* -----------------------------------------
   Create IntersectionObserver
------------------------------------------ */
const createObserver = () => {
  console.log("%cSetting up IntersectionObserver…", "color: yellow;");
  const scrollContainer = document.querySelector("main.v-main.main-content");
  observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[0];
      if (!entry) {
        console.error("❌ No entries received in IntersectionObserver callback");
        return;
      }
      if (entry.isIntersecting) {
        fetchVideos();
      }
    },
    {
      root: scrollContainer,
      rootMargin: "200px",
      threshold: 0,
    },
  );

  if (!sentinel.value) {
    console.error("❌ Sentinel is null — cannot observe!");
    return;
  }

  console.log("✔ Observing sentinel:", sentinel.value);
  observer.observe(sentinel.value);
};

onMounted(async () => {
  console.log("%cComponent mounted", "color: magenta; font-weight: bold;");

  console.log("➡ Initial fetchVideos()");
  await fetchVideos();

  if (route.name === "Feed") {
    console.log("➡ Setting up observer for Feed route");
    createObserver();
  } else {
    console.log("ℹ Infinite scroll disabled on this route");
  }
});

onUnmounted(() => {
  if (observer) observer.disconnect();
});
</script>

<style scoped>
.video-col {
  flex: 0 0 22%;
  max-width: 22%;
  display: block;
}
.v-row {
  display: flex;
  flex-wrap: wrap; /* Critical: allows rows to wrap and increase vertical height */
}
.sentinel {
  height: 1px;
}
</style>
