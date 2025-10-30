<template>
  <v-card
    class="video-card spatial-item"
    style="cursor: pointer"
    :to="`/video/${videoId}`"
    elevation="2"
  >
    <v-img height="160px" :src="thumbnail" cover></v-img>
    <v-card-title>
      {{ author }}
    </v-card-title>
    <v-card-subtitle>
      <v-chip size="small" variant="tonal" color="primary" label>
        {{ formatViews(views) }} views
      </v-chip>
    </v-card-subtitle>
    <v-card-text>
      <v-divider vertical> </v-divider>
      {{ title }}
      {{ videoId }}
    </v-card-text>
    <!-- TODO HANDLE CREATOR IMAGE IF ANY -->
    <!-- Channel info -->
  </v-card>
</template>

<script setup lang="ts">
defineProps<{
  thumbnail: string;
  title: string;
  views: number | string;
  duration: string;
  channel: string;
  author: string;
  videoId: string;
  creatorImage?: string;
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
  /* display: flex; */
  /* flex-direction: column; */
  height: 100%;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.video-card:hover,
.spatial-focus {
  transform: scale(1.07);
  color: rgba(47, 0, 69, 0.1) !important;
}
.v-card-text,
.v-card-title,
.v-card-subtitle {
  color: white !important;
}
</style>
