<template>
  <div class="video-player-wrapper">
    <div ref="videoContainer" class="shaka-video-container">
      <video ref="videoElement" class="shaka-video" preload="auto" :poster="poster"></video>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, computed } from "vue";
import shaka from "shaka-player/dist/shaka-player.ui"; // UI version
import "shaka-player/dist/controls.css"; // Shaka default styles
import { InvidiousHelper } from "@/helper/invidious";
import { LocalUsers } from "@/helper/users";

interface Props {
  dashUrl?: string;
  fallbackUrl?: string;
  poster?: string;
  autoplay?: boolean;
  autoFullscreen?: boolean;
  videoId: string;
}

const props = withDefaults(defineProps<Props>(), {
  autoplay: true,
  autoFullscreen: true,
});

const invidiousHelper = new InvidiousHelper();
const localUsers = new LocalUsers();
const currentUser = ref(localUsers.getCurrentUser());
const userSettings = localUsers.getUserSettings(currentUser.value || "guest");

const preferredResolution = userSettings?.preferredResolution || "auto";

console.log(`User's preferred Resolution: ${preferredResolution}`);

const isLoggedIn = computed(() => currentUser.value !== null && currentUser.value !== "guest");

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
  if (!player) {
    console.error("Failed to create Shaka Player instance.");
    return;
  }

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
      "quality",
      "overflow_menu",
      "fullscreen",
    ],
    overflowMenuButtons: ["captions", "language", "playback_rate"],
    addBigPlayButton: true,
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

    applyPreferredResolution();
    // Enable captions by default (if available)
    player.addEventListener("trackschanged", () => {
      const textTracks = player!.getTextTracks();
      if (textTracks.length > 0) {
        player!.setTextTrackVisibility(true);
      }
    });

    if (props.autoplay) {
      console.log("Attempting to autoplay video...");
      if (videoElement.value) {
        await videoElement.value.play().catch((err) => {
          console.warn("Autoplay failed:", err);
        });
        console.log("Autoplaying video done");
      }
    }

    // check if in fullscreen
    if (!document.fullscreenElement && props.autoFullscreen) {
      ui.getControls()?.toggleFullScreen();
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

function applyPreferredResolution() {
  if (!player) return;

  const tracks = player.getVariantTracks();
  if (!tracks || tracks.length === 0) return;

  if (preferredResolution === "auto") {
    player.configure({ abr: { enabled: true } });
    return;
  }

  // Convert preferredResolution ("720p") → numeric height
  const match = preferredResolution.match(/(\d+)/);
  const targetHeight = match ? Number(match[1]) : null;
  if (!targetHeight) return;

  // Find the closest track ≥ or = desired height
  const selectedTrack =
    tracks.find((t) => t.height === targetHeight) ||
    tracks.filter((t) => t.height! <= targetHeight).sort((a, b) => b.height! - a.height!)[0]; // pick highest under desired

  if (selectedTrack) {
    player.configure({ abr: { enabled: false } }); // disable auto switching
    player.selectVariantTrack(selectedTrack, true);
    console.log("Selected quality:", selectedTrack.height, "p");
  }
}

onMounted(initPlayer);
onBeforeUnmount(destroyPlayer);

// Watch for prop changes (dashUrl or fallbackUrl)
watch(
  () => [props.dashUrl, props.fallbackUrl],
  () => initPlayer(),
);

// Trigger when video starts playing
onMounted(() => {
  if (videoElement.value) {
    videoElement.value.addEventListener("playing", async () => {
      // check if not fullscreen and toggle
      if (!document.fullscreenElement && props.autoFullscreen) {
        ui?.getControls()?.toggleFullScreen();
      }
      if (isLoggedIn.value) {
        console.log("User is logged in, marking video as watched");
        await invidiousHelper.markVideoAsWatched(props.videoId);
      }
    });
  }
});
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
