<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-progress-circular
          v-if="loading"
          indeterminate
          color="primary"
          class="d-flex mx-auto my-8"
        ></v-progress-circular>

        <v-alert v-else-if="error" type="error" variant="tonal" class="my-4">
          {{ error }}
        </v-alert>

        <div v-else-if="video">
          <v-card elevation="2" class="mb-4">
            <video
              ref="videoElement"
              :poster="video.videoThumbnails[0]?.url"
              controls
              style="width: 100%; max-height: 600px; background: #000"
            ></video>
            <v-alert v-if="!streamUrl" type="warning" variant="tonal" class="ma-0 rounded-0">
              No stream available
            </v-alert>
          </v-card>

          <v-card elevation="1">
            <v-card-title class="text-h5">
              {{ video.title }}
            </v-card-title>

            <v-card-subtitle class="d-flex flex-wrap align-center ga-2">
              <span>
                By
                <a
                  :href="video.authorUrl"
                  target="_blank"
                  class="text-primary text-decoration-none"
                >
                  {{ video.author }}
                </a>
              </span>
              <v-divider vertical></v-divider>
              <span>{{ video.publishedText }}</span>
              <v-divider vertical thickness="3"></v-divider>
              <span>{{ video.viewCount }} views</span>
            </v-card-subtitle>

            <v-card-text>
              <v-sheet color="grey-lighten-4" rounded class="pa-4">
                <div v-html="video.descriptionHtml"></div>
              </v-sheet>
            </v-card-text>
          </v-card>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onBeforeUnmount, nextTick } from "vue";
import { InvidiousHelper } from "@/helper/invidious";
import type { VideoDetail } from "@/interfaces/videos";
import * as dashjs from "dashjs";

const props = defineProps<{ videoId: string }>();

const video = ref<VideoDetail | null>(null);
const streamUrl = ref<string | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);
const videoElement = ref<HTMLVideoElement | null>(null);
let dashPlayer: dashjs.MediaPlayerClass | null = null;

const invidious = new InvidiousHelper("https://tube.toc.homes");

async function fetchVideo() {
  loading.value = true;
  error.value = null;

  // Cleanup previous player
  if (dashPlayer) {
    dashPlayer.reset();
    dashPlayer = null;
  }

  try {
    const data = await invidious.getVideoById(props.videoId);
    video.value = data;
    console.log(JSON.stringify(data, null, 2));

    // Prefer hlsUrl, then dashUrl, then first formatStream
    streamUrl.value = data.hlsUrl || data.dashUrl || data.formatStreams[0]?.url || null;

    // Initialize player after DOM update
    await nextTick();
    initializePlayer();
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : "Failed to load video.";
  } finally {
    loading.value = false;
  }
}

function initializePlayer() {
  if (!videoElement.value || !streamUrl.value) return;

  const url = streamUrl.value;

  // Check if it's a DASH manifest
  if (url.includes("/manifest/dash/") || url.endsWith(".mpd")) {
    // Use dash.js for DASH streams
    dashPlayer = dashjs.MediaPlayer().create();
    dashPlayer.initialize(videoElement.value, url, true);
  } else if (url.includes(".m3u8")) {
    // HLS - let native player handle it (works on Safari)
    videoElement.value.src = url;
  } else {
    // Direct video file
    videoElement.value.src = url;
  }
}

onMounted(fetchVideo);
watch(() => props.videoId, fetchVideo);

onBeforeUnmount(() => {
  if (dashPlayer) {
    dashPlayer.reset();
    dashPlayer = null;
  }
});
</script>
