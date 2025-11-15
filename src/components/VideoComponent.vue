<template>
  <v-progress-circular v-if="loading" indeterminate color="primary"></v-progress-circular>

  <v-alert v-else-if="error" type="error" variant="tonal">
    {{ error }}
  </v-alert>

  <!-- Adaptive Video Player -->
  <v-card elevation="2" v-else-if="video">
    <ShakaVideoPlayer
      :dash-url="proxiedDashUrl"
      :fallback-url="proxiedFallbackUrl"
      :poster="video.videoThumbnails[0]?.url"
      :autoplay="false"
      :videoId="videoId"
    />
    <v-card-title>
      {{ video.title }}
    </v-card-title>

    <v-card-subtitle>
      <!-- Author Row -->
      <div class="card-subtitle-layout">
        <div>
          <v-avatar size="32" color="primary">
            <v-icon size="large" icon="mdi-account-circle" color="green-darken-2"></v-icon>
          </v-avatar>
          <v-divider vertical thickness="10"></v-divider>
          <a :href="video.authorUrl" class="text-primary font-weight-medium text-decoration-none">
            {{ video.author }}
          </a>
        </div>
        <v-divider vertical thickness="2" class="custom-divider"></v-divider>
        <!-- Metadata Row -->
        <div>
          <div>
            <v-icon size="16" color="medium-emphasis" icon="mdi-clock-outline"></v-icon>
            <v-divider vertical thickness="10"></v-divider>
            <span>{{ video.publishedText }}</span>
          </div>
          <div>
            <v-icon size="16" color="medium-emphasis" icon="mdi-eye-outline"></v-icon>
            <v-divider vertical thickness="10"></v-divider>
            <span>{{ formatViewCount(video.viewCount) }} views</span>
          </div>
        </div>
      </div>
    </v-card-subtitle>

    <v-card-text>
      <div class="text-body-1" style="white-space: pre-wrap" v-html="video.descriptionHtml"></div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed, nextTick } from "vue";
import { baseUrl, InvidiousHelper } from "@/helper/invidious";
import type { VideoDetail } from "@/interfaces/videos";
import ShakaVideoPlayer from "@/components/ShakaVideoPlayer.vue";

const props = defineProps<{ videoId: string }>();

const video = ref<VideoDetail | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);

const invidious = new InvidiousHelper();

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
  return `${baseUrl}/latest_version?id=${videoId}&itag=${itag}&local=true`;
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
    const data = await invidious.getVideoById(props.videoId, true);
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

onMounted(async () => {
  await fetchVideo();
  await nextTick();
});

watch(() => props.videoId, fetchVideo);
</script>

<style>
.card-subtitle-layout {
  display: inline-flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}
.custom-divider {
  margin-left: 10px;
  margin-right: 10px;
}
</style>
