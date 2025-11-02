<template>
  <v-progress-circular v-if="loading" indeterminate color="primary"></v-progress-circular>

  <v-alert v-else-if="error" type="error" variant="tonal" class="my-4">
    {{ error }}
  </v-alert>

  <!-- Adaptive Video Player -->
  <v-card elevation="2" v-else-if="video" class="adaptive-video-player">
    <AdaptiveVideoPlayer
      :dash-url="proxiedDashUrl"
      :fallback-url="proxiedFallbackUrl"
      :poster="video.videoThumbnails[0]?.url"
      :autoplay="false"
    />
    <v-card-title class="text-h5">
      {{ video.title }}
    </v-card-title>

    <v-card-subtitle class="d-flex flex-wrap align-center ga-2">
      <span>
        By
        <a :href="video.authorUrl" target="_blank" class="text-primary text-decoration-none">
          {{ video.author }}
        </a>
      </span>
      <v-divider vertical></v-divider>
      <span>{{ video.publishedText }}</span>
      <v-divider vertical thickness="3"></v-divider>
      <span>{{ formatViewCount(video.viewCount) }} views</span>
      <v-divider vertical></v-divider>
      <v-chip size="small" color="success" variant="outlined">
        <v-icon start size="small">mdi-check-circle</v-icon>
        Proxied Playback
      </v-chip>
    </v-card-subtitle>

    <v-card-text>
      <v-sheet color="grey-lighten-4" rounded class="pa-4">
        <div v-html="video.descriptionHtml"></div>
      </v-sheet>
    </v-card-text>

    <!-- Quality Information -->
    <v-expansion-panels v-if="video.adaptiveFormats" class="ma-4">
      <v-expansion-panel>
        <v-expansion-panel-title>
          <v-icon start>mdi-quality-high</v-icon>
          Available Qualities ({{ uniqueQualities.length }})
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
              <span class="text-grey ml-1"> ({{ format.encoding || format.container }}) </span>
            </v-chip>
          </v-chip-group>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </v-card>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed, nextTick, onBeforeUnmount } from "vue";
import { InvidiousHelper } from "@/helper/invidious";
import AdaptiveVideoPlayer from "@/components/AdaptiveVideoPlayer.vue";
import type { VideoDetail } from "@/interfaces/videos";
import { useSpatialNavigation } from "@/helper/navigation";

const props = defineProps<{ videoId: string }>();

const video = ref<VideoDetail | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);

const INVIDIOUS_INSTANCE = "https://tube.toc.homes";
const invidious = new InvidiousHelper(INVIDIOUS_INSTANCE);

// Proxied URLs through Invidious
const proxiedDashUrl = computed(() => {
  if (!video.value?.dashUrl) return undefined;
  // Add local=true to proxy through Invidious
  return `${video.value.dashUrl}${video.value.dashUrl.includes("?") ? "&" : "?"}local=true`;
});

const proxiedFallbackUrl = computed(() => {
  if (!video.value?.formatStreams[0]?.url) return undefined;
  // Proxy the fallback URL through Invidious
  const videoId = props.videoId;
  const itag = video.value.formatStreams[0].itag;
  return `${INVIDIOUS_INSTANCE}/latest_version?id=${videoId}&itag=${itag}&local=true`;
});

// Compute unique video qualities
const uniqueQualities = computed(() => {
  if (!video.value?.adaptiveFormats) return [];

  const videoFormats = video.value.adaptiveFormats.filter((format) =>
    format.type?.startsWith("video/"),
  );

  // Get unique qualities
  const seen = new Set();
  return videoFormats
    .filter((format) => {
      const key = format.qualityLabel;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => {
      // Sort by resolution (descending)
      const resA = parseInt(a.qualityLabel || "0");
      const resB = parseInt(b.qualityLabel || "0");
      return resB - resA;
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
    console.log("Original DASH URL:", data.dashUrl);
    console.log("Proxied DASH URL:", proxiedDashUrl.value);
    console.log("Proxied Fallback URL:", proxiedFallbackUrl.value);
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : "Failed to load video.";
    console.error("Error loading video:", e);
  } finally {
    loading.value = false;
  }
}

// initialize spatial navigation with selector matching the v-col wrapper
const spatial = useSpatialNavigation({
  selector: ".vjs-control",
  straightOnly: false,
});

onMounted(async () => {
  await fetchVideo();
  await nextTick();
  spatial.init();
  spatial.refresh();
  spatial.focusFirst();
});

onBeforeUnmount(() => {
  spatial.cleanup();
});
watch(() => props.videoId, fetchVideo);
</script>

<style scoped>
.adaptive-video-player {
  width: 95%;
  height: auto;
  margin: 20px;
  margin-top: 100px;
}
</style>
