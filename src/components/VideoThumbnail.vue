<template>
  <v-card class="video-card" elevation="2" hover>
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
  display: flex;
  flex-direction: column;
  height: 100%;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
  overflow: hidden;
}

.video-card:hover {
  transform: translateY(-4px);
}
</style>
