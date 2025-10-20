<template>
  <v-row>
    <v-col
      v-for="video in videos"
      :key="video.videoId"
      cols="12"
      sm="6"
      md="4"
      lg="3"
      :data-video-id="video.videoId"
    >
      <VideoThumbnail
        :author="video.author"
        :title="video.title"
        :thumbnail="video.thumbnail"
        :views="video.viewCount"
        :channel="video.author"
        :duration="formatDuration(video.lengthSeconds)"
        :videoId="video.videoId"
      />
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from "vue";
import VideoThumbnail from "@/components/VideoThumbnail.vue";
import { InvidiousHelper } from "@/helper/invidious";
import type { Video as InvidiousVideo } from "@/interfaces/videos";
import { useRouter } from "vue-router";
import { useSpatialNavigation } from "@/helper/navigation";

// Helper to format seconds into "m:ss"
function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

interface Video {
  videoId: string;
  title: string;
  thumbnail: string;
  viewCount: number;
  author: string;
  lengthSeconds: number;
}

const videos = ref<Video[]>([]);
const invidious = new InvidiousHelper("https://tube.toc.homes");
useRouter();

// initialize spatial navigation with selector matching the v-col wrapper
const spatial = useSpatialNavigation({
  selector: ".spatial-item",
  straightOnly: false,
});

onMounted(async () => {
  try {
    const response: InvidiousVideo[] = await invidious.getPopular();

    // Map API data to component-friendly format
    videos.value = response.map((vid) => ({
      videoId: vid.videoId,
      title: vid.title,
      thumbnail: vid.videoThumbnails[0]?.url ?? "", // fallback if no thumbnail
      viewCount: vid.viewCount,
      author: vid.author,
      lengthSeconds: vid.lengthSeconds,
    }));

    // Wait for DOM to update then refresh navigable elements and focus first
    await nextTick();
    spatial.init();
    spatial.refresh();
    spatial.focusFirst();
  } catch (error) {
    console.error("Failed to fetch popular videos", error);
  }
});

onUnmounted(() => {
  spatial.cleanup();
});
</script>

<style scoped>
html,
body,
#app {
  display: contents;
}
* {
  box-sizing: border-box;
}
</style>
