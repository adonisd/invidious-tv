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
          <v-card elevation="2" class="mb-4" v-if="video && videoPoster && videoSrc">
            <video
              v-show="video"
              ref="videoElement"
              :poster="videoPoster"
              controls
              :src="videoSrc"
              style="width: 100%; max-height: 600px; background: #000"
            ></video>
          </v-card>

          <v-card elevation="1" v-if="video">
            <v-card-title class="text-h5">
              {{ videoTitle }}
            </v-card-title>

            <v-card-subtitle class="d-flex flex-wrap align-center ga-2">
              <span v-if="videoAuthor && videoAuthorUrl">
                By
                <a :href="videoAuthorUrl" target="_blank" class="text-primary text-decoration-none">
                  {{ videoAuthor }}
                </a>
              </span>
              <v-divider vertical v-if="videoPublishedText"></v-divider>
              <span v-if="videoPublishedText">{{ videoPublishedText }}</span>
              <v-divider vertical thickness="3" v-if="videoViewCount"></v-divider>
              <span v-if="videoViewCount">{{ videoViewCount }} views</span>
            </v-card-subtitle>

            <v-card-text>
              <v-sheet color="grey-lighten-4" rounded class="pa-4">
                <div v-if="videoDescriptionHtml" v-html="videoDescriptionHtml"></div>
              </v-sheet>
            </v-card-text>
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
const props = defineProps<{ videoId: string }>();

const video = ref<VideoDetail | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);

const invidious = new InvidiousHelper("https://tube.toc.homes");

// Computed properties for all video.value accesses (with @ts-ignore)
const videoPoster = computed(() => {
  return video.value?.videoThumbnails?.[0]?.url;
});
const videoSrc = computed(() => {
  return video.value?.adaptiveFormats?.[
    video.value?.adaptiveFormats?.length ? video.value.adaptiveFormats.length - 1 : 0
  ]?.url;
});
const videoTitle = computed(() => {
  return video.value?.title;
});
const videoAuthor = computed(() => {
  return video.value?.author;
});
const videoAuthorUrl = computed(() => {
  return video.value?.authorUrl;
});
const videoPublishedText = computed(() => {
  return video.value?.publishedText;
});
const videoViewCount = computed(() => {
  return video.value?.viewCount;
});
const videoDescriptionHtml = computed(() => {
  return video.value?.descriptionHtml;
});

async function fetchVideo() {
  console.log("Fetching video for ID:", props.videoId);
  loading.value = true;
  error.value = null;

  try {
    const data = await invidious.getVideoById(props.videoId);
    console.log(JSON.stringify(data));
    video.value = data;
    if (!video.value) {
      error.value = "No video data returned.";
      return;
    }
    // All property accesses below should use video.value?.property if needed
    // Example: video.value?.hlsUrl, video.value?.dashUrl, etc.
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
