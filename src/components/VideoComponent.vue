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
          <v-card elevation="2" class="mb-4" v-if="video">
            <video
              v-show="video"
              ref="videoElement"
              :poster="video.videoThumbnails[0]?.url"
              controls
              :src="video.adaptiveFormats[video.adaptiveFormats.length - 1]?.url"
              style="width: 100%; max-height: 600px; background: #000"
            ></video>
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
import { ref, onMounted, watch } from "vue";
import { InvidiousHelper } from "@/helper/invidious";
import type { VideoDetail } from "@/interfaces/videos";
const props = defineProps<{ videoId: string }>();

const video = ref<VideoDetail | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);

const invidious = new InvidiousHelper("https://tube.toc.homes");

// Compute video sources for VidStack
// const videoSources = computed(() => {
//   if (!video.value) return [];

//   const sources = [];

//   // Add HLS source if available
//   if (video.value.hlsUrl) {
//     console.log("HLS URL found:", video.value.hlsUrl);
//     sources.push({
//       src: video.value.hlsUrl,
//       type: "application/x-mpegurl",
//     });
//   }

//   // Add DASH source if available
//   if (video.value.dashUrl) {
//     console.log("DASH URL found:", video.value.dashUrl);
//     sources.push({
//       src: video.value.dashUrl,
//       type: "application/dash+xml",
//     });
//   }

//   // Add format streams as fallback
//   if (video.value.formatStreams && video.value.formatStreams.length > 0) {
//     console.log("Adding format streams:", video.value.formatStreams);
//     video.value.formatStreams.forEach((stream) => {
//       if (stream.url) {
//         sources.push({
//           src: stream.url,
//           type: stream.type || "video/mp4",
//         });
//       }
//     });
//   }

//   return sources;
// });

async function fetchVideo() {
  console.log("Fetching video for ID:", props.videoId);
  loading.value = true;
  error.value = null;

  try {
    const data = await invidious.getVideoById(props.videoId);
    console.log(JSON.stringify(data));
    video.value = data;
    console.log("Video loaded successfully");
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : "Failed to load video.";
  } finally {
    loading.value = false;
  }
}

onMounted(fetchVideo);
watch(() => props.videoId, fetchVideo);
</script>
