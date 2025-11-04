<template>
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
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import VideoCard from "@/components/VideoCard.vue";
import { InvidiousHelper } from "@/helper/invidious";
import type { Video } from "@/interfaces/videos";
import { useRoute } from "vue-router";

const videos = ref<Video[]>([]);
const invidious = new InvidiousHelper();
const route = useRoute();

onMounted(async () => {
  try {
    if (route.name === "Popular" || route.name === "Root") {
      videos.value = await invidious.getPopular();
    } else if (route.name === "Trending") {
      videos.value = await invidious.getTrending();
    } else if (route.name === "Feed") {
      videos.value = await invidious.getAuthFeed();
    }
  } catch (error) {
    console.error("Failed to fetch popular videos", error);
  }
});
</script>

<style scoped>
.custom-col {
  flex: 0 0 25%;
  max-width: 20%;
}
</style>
