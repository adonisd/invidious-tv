<template>
  <v-row style="width: 100%">
    <v-col
      v-for="video in videos"
      :key="video.videoId"
      :data-video-id="video.videoId"
      class="custom-col"
    >
      <!-- Add click listener -->
      <div @click="openDeleteDialog(video)">
        <VideoCard :video="video" :disable-interaction="true" />
      </div>
    </v-col>
  </v-row>

  <!-- Confirmation Dialog -->
  <v-dialog v-model="showDialog" max-width="400">
    <v-card>
      <v-card-title class="text-h6">Delete Video?</v-card-title>
      <v-card-text> Do you want to delete this video from your history? </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="grey" text @click="closeDialog">No</v-btn>
        <v-btn color="red" text @click="confirmDelete">Yes</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import VideoCard from "@/components/VideoCard.vue";
import { InvidiousHelper } from "@/helper/invidious";
import type { VideoDetail } from "@/interfaces/videos";
import { onMounted, ref } from "vue";

const videos = ref<VideoDetail[]>([]);
const invidious = new InvidiousHelper();

// dialog states
const showDialog = ref(false);
const selectedVideo = ref<VideoDetail | null>(null);

// Open the dialog
function openDeleteDialog(video: VideoDetail) {
  selectedVideo.value = video;
  showDialog.value = true;
}

// Close dialog (No button)
function closeDialog() {
  showDialog.value = false;
  selectedVideo.value = null;
}

// Yes button — currently does nothing
async function confirmDelete() {
  if (!selectedVideo.value) return;
  await invidious.deleteVideoFromHistory(selectedVideo.value.videoId);
  // Remove video from list
  videos.value = videos.value.filter((v) => v.videoId !== selectedVideo.value?.videoId);
  // Placeholder for future delete logic
  showDialog.value = false;
  selectedVideo.value = null;
}

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
  cursor: pointer;
}
</style>
