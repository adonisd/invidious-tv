<template>
  <div>
    <v-card
      class="video-card spatial-item"
      style="cursor: pointer"
      :to="`/video/${video.videoId}`"
      hover
      rounded
      height="300px"
    >
      <v-img height="160px" :src="video.videoThumbnails[0]?.url" cover></v-img>
      <v-card-title>
        <div class="video-title-custom">
          <span>{{ video.author }}</span>

          <v-chip size="small" variant="tonal" color="primary" label>
            {{ formatViews(video.viewCount) }} views
          </v-chip>
        </div>
      </v-card-title>
      <v-card-subtitle> </v-card-subtitle>
      <v-card-text>
        <v-divider vertical> </v-divider>
        {{ video.title }}
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import type { Video } from "@/interfaces/videos";

defineProps<{
  video: Video;
}>();

const formatViews = (views: number | string): string => {
  const num = typeof views === "string" ? parseInt(views) : views;
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
};
</script>

<style scoped>
.video-card {
  color: transparent !important;
  height: 100%;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.video-card:hover,
.spatial-focus {
  transform: scale(1.07);
}
.v-card-text,
.v-card-title,
.v-card-subtitle {
  color: white !important;
}

.video-title-custom {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}
</style>
