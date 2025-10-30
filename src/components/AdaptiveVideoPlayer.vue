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
    responsive: true,
    controls: true,
    preload: "auto",
    autoplay: props.autoplay,
    html5: {
      vhs: {
        overrideNative: true,
      },
      nativeVideoTracks: false,
      nativeAudioTracks: false,
      nativeTextTracks: false,
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
    }
  },
);
</script>

<style scoped>
.video-player-wrapper {
  width: 100%;
  max-width: 100%;
}

.video-js {
  width: 100%;
  height: auto;
  max-height: 600px;
}

/* Override Video.js default height */
:deep(.video-js) {
  font-size: 14px;
}

/* Ensure proper aspect ratio */
:deep(.video-js .vjs-tech) {
  position: relative;
  width: 100%;
  height: auto;
}
</style>
