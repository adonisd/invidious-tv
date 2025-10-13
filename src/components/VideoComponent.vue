<template>
  <div v-if="loading" class="video-loading">Loading...</div>
  <div v-else-if="error" class="video-error">{{ error }}</div>
  <div v-else-if="video">
    <div class="video-player-container">
      <h2>{{ streamUrl }}</h2>
      <video
        v-if="streamUrl"
        :src="streamUrl"
        controls
        style="width: 100%; max-width: 800px"
      ></video>
      <div v-else class="no-stream">No stream available</div>
    </div>
    <h2>{{ video.title }}</h2>
    <div class="video-meta">
      <span
        >By <a :href="video.authorUrl" target="_blank">{{ video.author }}</a></span
      >
      <span>• {{ video.publishedText }}</span>
      <span>• {{ video.viewCount }} views</span>
    </div>
    <div class="video-description" v-html="video.descriptionHtml"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { InvidiousHelper } from "@/helper/invidious";
import type { VideoDetail } from "@/interfaces/videos";

const props = defineProps<{ videoId: string }>();

const video = ref<VideoDetail | null>(null);
const streamUrl = ref<string | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);

const invidious = new InvidiousHelper("https://tube.toc.homes");

async function fetchVideo() {
  loading.value = true;
  error.value = null;
  try {
    const data = await invidious.getVideoById(props.videoId);
    video.value = data;
    // Prefer hlsUrl, then dashUrl, then first formatStream
    streamUrl.value = data.hlsUrl || data.dashUrl || data.formatStreams[0]?.url || null;
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
.video-player-container {
  margin-bottom: 1rem;
}
.video-meta {
  color: #888;
  font-size: 0.95em;
  margin-bottom: 1em;
}
.video-description {
  margin-top: 1em;
  background: #f8f8f8;
  padding: 1em;
  border-radius: 8px;
}
.video-loading,
.video-error {
  text-align: center;
  margin: 2em 0;
}
.no-stream {
  color: #c00;
  font-weight: bold;
}
</style>
