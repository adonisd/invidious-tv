<template>
  <v-row style="width: 100">
    <v-col
      v-for="playlist in playlists"
      :key="playlist.playlistId"
      :data-playlist-id="playlist.playlistId"
      class="custom-col"
    >
      <PlaylistCard :playlist="playlist" />
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { InvidiousHelper } from "@/helper/invidious";
import type { Playlist } from "@/interfaces/playlists";
import PlaylistCard from "@/components/PlaylistCard.vue";

const playlists = ref<Playlist[]>([]);
const invidious = new InvidiousHelper();

onMounted(async () => {
  try {
    const response = await invidious.getAuthPlaylists();
    playlists.value = response;
  } catch (error) {
    console.error("Failed to fetch playlists", error);
  }
});
</script>

<style scoped>
.custom-col {
  flex: 0 0 25%;
  max-width: 20%;
}
</style>
