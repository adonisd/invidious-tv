<template>
  <div style="width: 30em">
    <v-card
      class="video-card spatial-item"
      style="cursor: pointer"
      @click="navigateToVideo(video.videoId)"
      hover
      rounded
    >
      <v-img
        :src="video.videoThumbnails[0]?.url"
        aspect-ratio="16/9"
        cover
        class="video-thumb"
      ></v-img>

      <v-card-item>
        <v-card-title>
          <v-avatar size="32" class="elevation-2" v-if="author">
            <v-img :src="author.authorThumbnails[0]?.url"></v-img>
          </v-avatar>
          {{ video.author }}
        </v-card-title>

        <v-card-subtitle>
          <v-chip size="small" variant="tonal" color="primary" label>
            {{ formatViews(video.viewCount) }} views
          </v-chip>
          <v-chip size="small" variant="tonal" color="secondary" label>
            {{ formateLength(video.lengthSeconds) }}
          </v-chip>
        </v-card-subtitle>
      </v-card-item>

      <v-card-text>
        {{ video.title }}
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { InvidiousHelper } from "@/helper/invidious";
import type { Channel } from "@/interfaces/channels";
import type { Video, VideoDetail } from "@/interfaces/videos";
import { onMounted, ref } from "vue";
import { navigateToVideo } from "@/router";

const props = defineProps<{
  video: Video | VideoDetail;
  disableInteraction?: boolean;
}>();

const author = ref<Channel | null>(null);

const formatViews = (views: number | string): string => {
  const num = typeof views === "string" ? parseInt(views) : views;
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
};

const formateLength = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
};
const invidious = new InvidiousHelper();
onMounted(async () => {
  author.value = await invidious.getChannelDetails(props.video.authorId);
});
</script>

<style scoped>
.video-card {
  height: 100%;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.video-card:hover,
.spatial-focus {
  transform: scale(1.08);
}

/* Typography */
.v-card-title {
  color: white !important;
}

.v-card-subtitle {
  color: white !important;
}

.v-card-text {
  color: white !important;
}

/* Thumbnail spacing (optional) */
.video-thumb {
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
}
</style>
