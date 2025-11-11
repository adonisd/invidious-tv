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
import VideoCard from "@/components/VideoCard.vue";
import { InvidiousHelper } from "@/helper/invidious";
import type { VideoDetail } from "@/interfaces/videos";
import { onMounted, ref } from "vue";

const videos = ref<VideoDetail[]>([]);
const invidious = new InvidiousHelper();
onMounted(async () => {
  try {
    const videoIds = await invidious.getHistory();
    for (const videoId of videoIds) {
      try {
        const video = await invidious.getVideoById(videoId, true, false);
        videos.value.push(video);
      } catch (error) {
        console.warn("Failed to fetch video:", error);
        continue;
      }
    }
  } catch (error) {
    console.error("Failed to fetch videos", error);
  }
});
</script>

<style scoped>
.custom-col {
  flex: 0 0 25%;
  max-width: 20%;
}
</style>
