<template>
  <v-card class="video-card" elevation="2" hover>
    <!-- Thumbnail Image with fixed aspect ratio -->
    <div class="video-card__thumbnail-wrapper">
      <v-img :src="thumbnail" cover aspect-ratio="16/9" class="video-card__thumbnail">
        <template #placeholder>
          <v-row class="fill-height ma-0" justify="center" align="center">
            <v-progress-circular indeterminate color="grey-lighten-2" />
          </v-row>
        </template>

        <!-- Duration badge -->
        <div class="video-card__duration">
          {{ duration }}
        </div>
      </v-img>
    </div>

    <!-- Content section with fixed height -->
    <div class="video-card__content">
      <!-- Title with fixed height for 2 lines -->
      <div class="video-card__title">
        {{ title }}
      </div>

      <!-- Channel info -->
      <div class="video-card__channel d-flex align-center gap-2 mb-2">
        <v-avatar size="32" v-if="creatorImage">
          <v-img :src="creatorImage" />
        </v-avatar>
        <div class="d-flex justify-space-between align-center flex-grow-1">
          <div class="video-card__author text-body-2">
            {{ author }}
          </div>
          <v-chip size="small" variant="tonal" color="primary">
            {{ formatViews(views) }} views
          </v-chip>
        </div>
      </div>
    </div>
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
  border-radius: 12px !important;
  overflow: hidden;
}

.video-card:hover {
  transform: translateY(-4px);
}

.video-card__thumbnail-wrapper {
  position: relative;
  width: 100%;
  background-color: #000;
}

.video-card__thumbnail {
  width: 100%;
}

.video-card__duration {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background-color: rgba(0, 0, 0, 0.85);
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.video-card__content {
  padding: 16px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.video-card__title {
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.4;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  min-height: 2.8em; /* Ensures consistent height for 2 lines */
  color: rgba(0, 0, 0, 0.87);
}

.video-card__channel {
  margin-bottom: 8px;
}

.video-card__author {
  font-weight: 500;
  color: rgba(0, 0, 0, 0.6);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.video-card__metadata {
  margin-top: auto;
}

/* Dark theme support */
.v-theme--dark .video-card__title {
  color: rgba(255, 255, 255, 0.95);
}

.v-theme--dark .video-card__author {
  color: rgba(255, 255, 255, 0.7);
}
</style>
