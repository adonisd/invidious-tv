<template>
  <div style="width: 100%; height: 100%">
    <v-progress-circular
      v-if="loading"
      indeterminate
      color="primary"
      class="d-flex mx-auto mt-8"
    ></v-progress-circular>

    <!-- Channel Content -->
    <div v-if="!loading && channel" class="mt-4">
      <!-- Banner -->
      <v-img :src="channel.authorBanners[0]?.url" cover class="channel-banner">
        <template v-slot:placeholder>
          <v-sheet color="grey-lighten-2" height="100%"></v-sheet>
        </template>
      </v-img>

      <!-- Channel Header -->
      <!-- <v-container class="py-6"> -->
      <v-row align="center">
        <v-col cols="auto">
          <v-avatar size="80" class="elevation-2">
            <v-img :src="channel.authorThumbnails[0]?.url"></v-img>
          </v-avatar>
        </v-col>

        <v-col>
          <div class="d-flex align-center mb-1">
            <h1 class="text-h5 font-weight-medium">{{ channel.author }}</h1>
            <div
              class="text-body-1"
              style="white-space: pre-wrap"
              v-html="channel.descriptionHtml"
            ></div>
            <v-icon v-if="channel.authorVerified" size="20" class="ml-2" color="grey-darken-1">
              mdi-check-circle
            </v-icon>
          </div>
          <div class="text-body-2 text-grey-darken-1">
            <!-- {{ formatSubscribers(channel.subCount) }} subscribers • -->
            {{ formatViews(channel.totalViews) }} views
          </div>
        </v-col>

        <v-col cols="auto">
          <v-btn
            color="black"
            variant="flat"
            size="large"
            rounded="pill"
            class="px-6 text-none font-weight-medium"
          >
            Subscribe
          </v-btn>
        </v-col>
      </v-row>

      <!-- Channel Navigation Tabs -->
      <v-tabs v-model="activeTab" color="black" class="mt-4">
        <v-tab v-for="tab in tabs" :key="tab" :value="tab" class="text-none">
          {{ tab }}
        </v-tab>
      </v-tabs>

      <v-divider></v-divider>

      <!-- Channel Description -->
      <v-card flat class="mt-4" v-if="activeTab === 'home'">
        <v-card-text>
          <div class="text-body-1 mb-4" v-html="channel.descriptionHtml"></div>
          <v-divider class="my-4"></v-divider>
          <div class="text-body-2 text-grey-darken-1">
            <div class="mb-2"><strong>Joined:</strong> {{ formatDate(channel.joined) }}</div>
            <div v-if="channel.tags.length > 0">
              <strong>Tags:</strong> {{ channel.tags.join(", ") }}
            </div>
          </div>
        </v-card-text>
      </v-card>

      <!-- Videos -->
      <div v-else-if="activeTab === 'videos' && videos.length">
        <v-row>
          <v-col v-for="video in videos" :key="video.videoId" cols="12" sm="6" md="4" lg="3">
            <VideoCard :video="video"></VideoCard>
          </v-col>
        </v-row>
      </div>

      <!-- Playlists -->
      <div v-else-if="activeTab === 'playlists' && playlists.length">
        <v-row>
          <v-col
            v-for="playlist in playlists"
            :key="playlist.playlistId"
            cols="12"
            sm="6"
            md="4"
            lg="3"
          >
            <v-card flat hover>
              <v-img
                :src="playlist.videos[0]?.videoThumbnails[0]?.url"
                aspect-ratio="16/9"
                cover
              ></v-img>
              <v-card-text class="px-0">
                <div class="text-body-1 font-weight-medium line-clamp-2 mb-1">
                  {{ playlist.title }}
                </div>
                <div class="text-body-2 text-grey-darken-1">{{ playlist.videoCount }} videos</div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </div>

      <!-- Other tabs (podcasts, releases, shorts, streams) -->
      <div v-else-if="['shorts', 'streams'].includes(activeTab)">
        <v-row>
          <v-col
            v-for="video in getTabVideos()"
            :key="video.videoId"
            cols="12"
            sm="6"
            md="4"
            lg="3"
          >
            <VideoCard :video="video"></VideoCard>
          </v-col>
        </v-row>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import VideoCard from "@/components/VideoCard.vue";
import { InvidiousHelper } from "@/helper/invidious";
import type { Channel } from "@/interfaces/channels";
import type { Playlist } from "@/interfaces/playlists";
import type { Video } from "@/interfaces/videos";
import { computed, ref, onMounted, watch } from "vue";
import { useRoute } from "vue-router";

const invidious = new InvidiousHelper();

const channel = ref<Channel | null>(null);
const loading = ref(true);
const activeTab = ref("videos");
const route = useRoute();
const channelId = computed(() => route.params.id as string);

const tabs = ["home", "videos", "podcasts", "releases", "shorts", "streams"];

// Content for each tab
const videos = ref<Video[]>([]);
const playlists = ref<Playlist[]>([]);
const podcasts = ref<Video[]>([]);
const releases = ref<Video[]>([]);
const shorts = ref<Video[]>([]);
const streams = ref<Video[]>([]);

onMounted(async () => {
  await loadChannel();
  await loadTabContent(activeTab.value);
});

// When tab changes, load new data
watch(activeTab, async (newTab) => {
  await loadTabContent(newTab);
});

async function loadChannel() {
  loading.value = true;
  try {
    const data = await invidious.getChannelDetails(channelId.value);
    if (!data) throw new Error("Couldn't get channel");
    channel.value = data;
    activeTab.value = data.tabs[0] || "videos";
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
}

async function loadTabContent(tab: string) {
  if (!channelId.value) return;

  loading.value = true;
  try {
    switch (tab) {
      case "videos":
        console.log("fetching videos");
        videos.value = await invidious.getChannelVideos(channelId.value);
        break;
      case "playlists":
        console.log("fetching playlists");
        playlists.value = await invidious.getChannelPlaylists(channelId.value);
        break;
      case "shorts":
        console.log("fetching shorts");
        shorts.value = await invidious.getChannelShorts(channelId.value);
        break;
      case "streams":
        console.log("fetching streams");
        streams.value = await invidious.getChannelStreams(channelId.value);
        break;
      default:
        break;
    }
  } catch (error) {
    console.error(`Error loading ${tab}:`, error);
  } finally {
    loading.value = false;
  }
}

// ---- Formatting helpers ----
// const formatSubscribers = (count: number): string => {
//   if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
//   if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
//   return count.toString();
// };

const formatViews = (count: number): string => {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return count.toString();
};

// const formatDuration = (seconds: number): string => {
//   const hours = Math.floor(seconds / 3600);
//   const minutes = Math.floor((seconds % 3600) / 60);
//   const secs = seconds % 60;
//   return hours > 0
//     ? `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
//     : `${minutes}:${secs.toString().padStart(2, "0")}`;
// };

const formatDate = (timestamp: number): string => {
  if (timestamp === 0) return "Unknown";
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
};

// const capitalizeTab = (tab: string): string => tab.charAt(0).toUpperCase() + tab.slice(1);

const getTabVideos = () => {
  switch (activeTab.value) {
    case "podcasts":
      return podcasts.value;
    case "releases":
      return releases.value;
    case "shorts":
      return shorts.value;
    case "streams":
      return streams.value;
    case "videos":
      return videos.value;
    default:
      return [];
  }
};
</script>

<style scoped>
.channel-banner {
  border-radius: 0;
}

.video-duration {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
