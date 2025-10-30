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
          <!-- Adaptive Video Player -->
          <v-card elevation="2" class="mb-4">
            <AdaptiveVideoPlayer
              :dash-url="video.dashUrl"
              :fallback-url="video.formatStreams[0]?.url"
              :poster="video.videoThumbnails[0]?.url"
              :autoplay="false"
            />
          </v-card>

          <!-- Video Information Card -->
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
              <span>{{ formatViewCount(video.viewCount) }} views</span>
            </v-card-subtitle>

            <v-card-text>
              <v-sheet color="grey-lighten-4" rounded class="pa-4">
                <div v-html="video.descriptionHtml"></div>
              </v-sheet>
            </v-card-text>

            <!-- Quality Information (Optional) -->
            <v-expansion-panels v-if="video.adaptiveFormats" class="ma-4">
              <v-expansion-panel>
                <v-expansion-panel-title>
                  <v-icon start>mdi-quality-high</v-icon>
                  Available Qualities
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <v-chip-group column>
                    <v-chip
                      v-for="format in uniqueQualities"
                      :key="format.itag"
                      size="small"
                      color="primary"
                      variant="outlined"
                    >
                      {{ format.qualityLabel }}
                      ({{ format.encoding || format.container }})
                    </v-chip>
                  </v-chip-group>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-card>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from "vue";
import { InvidiousHelper } from "@/helper/invidious";
import type { VideoDetail } from "@/interfaces/videos";
import AdaptiveVideoPlayer from "@/components/AdaptiveVideoPlayer.vue";

const props = defineProps<{ videoId: string }>();

const video = ref<VideoDetail | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);

const invidious = new InvidiousHelper("https://tube.toc.homes");

// Compute unique video qualities
const uniqueQualities = computed(() => {
  if (!video.value?.adaptiveFormats) return [];

  const videoFormats = video.value.adaptiveFormats.filter((format) =>
    format.type?.startsWith("video/"),
  );

  // Get unique qualities
  const seen = new Set();
  return videoFormats.filter((format) => {
    const key = format.qualityLabel;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
});

function formatViewCount(count: number): string {
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1) + "M";
  } else if (count >= 1000) {
    return (count / 1000).toFixed(1) + "K";
  }
  return count.toString();
}

async function fetchVideo() {
  console.log("Fetching video for ID:", props.videoId);
  loading.value = true;
  error.value = null;

  try {
    const data = await invidious.getVideoById(props.videoId);
    video.value = data;
    console.log("Video loaded successfully");
    console.log("DASH URL:", data.dashUrl);
    console.log("Fallback URL:", data.formatStreams[0]?.url);
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : "Failed to load video.";
  } finally {
    loading.value = false;
  }
}

onMounted(fetchVideo);
watch(() => props.videoId, fetchVideo);
</script>

<style scoped>
/* Add any additional styles here */
</style>
