<template>
  <div>
    <v-card
      class="playlist-card spatial-item"
      style="cursor: pointer"
      hover
      rounded
      height="300px"
      min-width="230px"
      @click="navigateToPlaylist(playlist.playlistId)"
    >
      <!-- Thumbnail -->
      <v-img height="160px" :src="playlist.videos[0]?.videoThumbnails[0]?.url" cover>
        <!-- Overlay for video count -->
        <template>
          <v-chip size="small" color="black" text-color="white" class="ma-2" variant="flat">
            {{ playlist.videoCount }} videos
          </v-chip>
        </template>
      </v-img>

      <!-- Title & Author -->
      <v-card-title>
        <div class="playlist-title-custom">
          <span>{{ playlist.author }}</span>
          <v-chip size="small" variant="tonal" color="primary" label>
            {{ formatViews(playlist.viewCount) }} views
          </v-chip>
        </div>
      </v-card-title>

      <v-card-text>
        <v-divider class="mb-2"></v-divider>
        {{ playlist.title }}
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import type { Playlist } from "@/interfaces/playlists";
import { navigateToPlaylist } from "@/router";

defineProps<{
  playlist: Playlist;
}>();

const formatViews = (views: number | string): string => {
  const num = typeof views === "string" ? parseInt(views) : views;
  if (isNaN(num)) return "0";
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toString();
};
</script>

<style scoped>
.playlist-card {
  color: transparent !important;
  height: 100%;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.playlist-card:hover,
.spatial-focus {
  transform: scale(1.07);
}

.v-card-text,
.v-card-title,
.v-card-subtitle {
  color: white !important;
}

.playlist-title-custom {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}
</style>
