<template>
  <div class="video-player-wrapper">
    <div ref="videoContainer" class="shaka-video-container">
      <video ref="videoElement" class="shaka-video" preload="auto" :poster="poster"></video>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from "vue";
import shaka from "shaka-player/dist/shaka-player.ui"; // UI version
import "shaka-player/dist/controls.css"; // Shaka default styles

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
const videoContainer = ref<HTMLDivElement | null>(null);
let player: shaka.Player | null = null;
let ui: shaka.ui.Overlay | null = null;

/** Initialize Shaka Player with UI */
async function initPlayer() {
  if (!videoElement.value || !videoContainer.value) return;

  destroyPlayer();

  if (!shaka.Player.isBrowserSupported()) {
    console.error("Shaka Player is not supported in this browser.");
    return;
  }

  // Create Shaka Player instance
  player = new shaka.Player(videoElement.value);

  // Create UI overlay (adds quality selector, captions, etc.)
  ui = new shaka.ui.Overlay(player, videoContainer.value, videoElement.value);

  // Enable settings panel for quality, captions, etc.
  ui.configure({
    controlPanelElements: [
      "play_pause",
      "time_and_duration",
      "mute",
      "volume",
      "spacer",
      "captions",
      "overflow_menu",
      "fullscreen",
    ],
    overflowMenuButtons: ["quality", "captions", "language", "playback_rate"],
    addBigPlayButton: false,
  });

  // Add event listener for player errors
  player.addEventListener("error", onErrorEvent);

  try {
    if (props.dashUrl) {
      await player.load(props.dashUrl);
      console.log("DASH source loaded!");
    } else if (props.fallbackUrl) {
      if (videoElement.value) videoElement.value.src = props.fallbackUrl;
    }

    // Auto adaptation for bitrate
    player.configure({
      abr: { enabled: true, defaultBandwidthEstimate: 1_000_000 },
    });

    // Enable captions by default (if available)
    player.addEventListener("trackschanged", () => {
      const textTracks = player!.getTextTracks();
      if (textTracks.length > 0) {
        player!.setTextTrackVisibility(true);
      }
    });

    if (props.autoplay) {
      if (videoElement.value)
        await videoElement.value.play().catch((err) => {
          console.warn("Autoplay failed:", err);
        });
    }
  } catch (error) {
    console.error("Error loading video:", error);
    if (props.fallbackUrl && videoElement.value) {
      console.log("Falling back to MP4...");
      videoElement.value.src = props.fallbackUrl;
      videoElement.value.play().catch(() => {});
    }
  }
}
/** Handle player error events */
function onErrorEvent(event: Event) {
  const errorObj = event as unknown as shaka.util.Error;
  console.error("Shaka Player Error:", errorObj);
  if (props.fallbackUrl && videoElement.value) {
    console.log("Switching to fallback MP4...");
    videoElement.value.src = props.fallbackUrl;
    videoElement.value.play().catch(() => {});
  }
}

/** Cleanup */
function destroyPlayer() {
  if (ui) {
    ui.destroy();
    ui = null;
  }
  if (player) {
    player.destroy();
    player = null;
  }
}

onMounted(initPlayer);
onBeforeUnmount(destroyPlayer);

// Watch for prop changes (dashUrl or fallbackUrl)
watch(
  () => [props.dashUrl, props.fallbackUrl],
  () => initPlayer(),
);
</script>

<style scoped>
.video-player-wrapper {
  border-radius: 12px;
  overflow: hidden;
  background-color: var(--v-theme-surface);
  width: 95%;
  margin: 20px auto;
}

.shaka-video-container {
  position: relative;
  width: 100%;
  max-width: 100%;
  background-color: black;
}

.shaka-video {
  width: 100%;
  height: auto;
  /* display: block; */
}
</style>
