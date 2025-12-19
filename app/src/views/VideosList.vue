<template>
  <div>
    <v-row style="justify-content: space-evenly">
      <v-col v-for="v in videos" :key="v.videoId" class="video-col">
        <VideoCard :video="v" />
      </v-col>
    </v-row>
    <v-row v-if="loading" class="justify-center">
      <v-progress-circular indeterminate color="primary" />
    </v-row>
    <div ref="sentinel" class="sentinel"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from "vue";
import { useRoute } from "vue-router";
import VideoCard from "@/components/VideoCard.vue";
import { InvidiousHelper } from "@/helper/invidious";
import type { Video } from "@/interfaces/videos";
import { LocalUsers } from "@/helper/users";

const route = useRoute();
const invidious = new InvidiousHelper();
const users = new LocalUsers();
const currentUser = users.getCurrentUser() || "guest";
if (!currentUser || currentUser === "guest") {
  console.warn("User not logged in - some features may be limited.");
}

const videos = ref<Video[]>([]);
const loading = ref(false);
const page = ref(1);
const hasMore = ref(true);

const sentinel = ref<HTMLElement | null>(null);
let observer: IntersectionObserver | null = null;

const fetchVideos = async () => {
  if (loading.value || !hasMore.value) {
    return;
  }

  loading.value = true;

  try {
    const userSettings = users.getUserSettings(currentUser);
    const showShorts = userSettings ? userSettings.showShorts : true;

    let fetched: Video[] = [];

    switch (route.name) {
      case "Popular":
      case "Root":
        fetched = await invidious.getPopular();
        break;

      case "Gaming":
        fetched = await invidious.getTrending("gaming");
        console.log("➡ Fetched gaming videos:", fetched);
        break;

      case "Livestreams":
        fetched = await invidious.getTrending("default");
        console.log("➡ Fetched livestreams:", fetched);
        break;

      case "Feed":
        fetched = await invidious.getPersonalFeed(undefined, page.value);
        break;

      default:
        console.warn("⚠ Unknown route:", route.name);
    }

    if (!showShorts) {
      // shorts and livestreams don't have lengthSeconds. Livestreams always have "0 seconds ago" as publishedText
      // this way we can filter out shorts and keep livestreams
      fetched = fetched.filter((v) => v.lengthSeconds !== 0 || v.publishedText === "0 seconds ago");
    }

    if (fetched.length === 0) {
      hasMore.value = false;
    } else {
      videos.value.push(...fetched);
      page.value++;
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
.sentinel {
  height: 1px;
}
.video-col {
  display: flex;
  max-width: 30%;
}

.video-card {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.video-card .v-card {
  display: flex;
  flex-direction: column;
  flex: 1;
}

@media (max-width: 768px) {
  .video-col {
    max-width: 100%; /* one video per column */
  }
}
</style>
