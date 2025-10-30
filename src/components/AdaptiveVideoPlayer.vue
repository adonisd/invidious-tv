<template>
  <div class="video-player-wrapper">
    <video
      ref="videoElement"
      class="video-js vjs-big-play-centered"
      controls
      preload="auto"
      :poster="poster"
    ></video>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from "vue";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import "videojs-contrib-dash";
import type Player from "video.js/dist/types/player";

interface Props {
  dashUrl?: string;
  fallbackUrl?: string;
  poster?: string;
  autoplay?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  autoplay: false,
});

const videoElement = ref<HTMLVideoElement | null>(null);
let player: Player | null = null;

const initPlayer = () => {
  if (!videoElement.value) return;

  // Initialize Video.js player
  player = videojs(videoElement.value, {
    fluid: true,
    responsive: false,
    controls: true,
    preload: "auto",
    autoplay: props.autoplay,
    enableSmoothSeeking: true,
    experimentalSvgIcons: true,
    nativeControlsForTouch: true,
    playbackRates: [0.5, 1, 1.5, 2],
    playsinline: true,
    html5: {
      vhs: {
        overrideNative: true,
      },
      nativeVideoTracks: true,
      nativeAudioTracks: true,
      nativeTextTracks: true,
    },
  });

  // Load the source
  if (props.dashUrl) {
    player.src({
      src: props.dashUrl,
      type: "application/dash+xml",
    });
  } else if (props.fallbackUrl) {
    player.src({
      src: props.fallbackUrl,
      type: "video/mp4",
    });
  }

  // Error handling
  player.on("error", () => {
    const error = player?.error();
    console.error("Video.js error:", error);

    // Fallback to direct URL if DASH fails
    if (props.dashUrl && props.fallbackUrl) {
      console.log("DASH failed, trying fallback URL");
      player?.src({
        src: props.fallbackUrl,
        type: "video/mp4",
      });
    }
  });

  player.on("loadedmetadata", () => {
    console.log("Video metadata loaded");
  });
};

const destroyPlayer = () => {
  if (player) {
    player.dispose();
    player = null;
  }
};

onMounted(() => {
  initPlayer();
});

onBeforeUnmount(() => {
  destroyPlayer();
});

// Watch for source changes
watch(
  () => [props.dashUrl, props.fallbackUrl],
  () => {
    if (player) {
      if (props.dashUrl) {
        player.addSourceElement(props.dashUrl, "application/dash+xml");
      }
      if (props.fallbackUrl) {
        player.addSourceElement(props.fallbackUrl, "video/mp4");
      }
    }
  },
);
</script>

<style scoped>
:deep(.vjs-control-bar) {
  display: flex !important;
  opacity: 1 !important;
  visibility: visible !important;
}
</style>
