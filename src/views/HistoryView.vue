<template>
  <h1>hello</h1>
</template>
<script setup lang="ts">
import { InvidiousHelper } from "@/helper/invidious";
import type { VideoDetail } from "@/interfaces/videos";
import { onMounted, ref } from "vue";

const videos = ref<VideoDetail[]>([]);
const invidious = new InvidiousHelper();
onMounted(async () => {
  try {
    const videoIds = await invidious.getHistory();
    for (const videoId of videoIds) {
      const video = await invidious.getVideoById(videoId, true, false);
      videos.value.push(video);
    }
  } catch (error) {
    console.error("Failed to fetch playlists", error);
  }
});
</script>
