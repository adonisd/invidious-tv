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
            {{ formatSubscribers(channel.subCount) }} subscribers •
            {{ formatViews(channel.totalViews) }} views
          </div>
          <div class="text-body-2 text-grey-darken-1">
            <div class="mb-2"><strong>Joined:</strong> {{ formatDate(channel.joined) }}</div>
            <div v-if="channel.tags.length > 0">
              <strong>Tags:</strong>
              <span v-for="(tag, index) in channel.tags" :key="index">
                <v-chip label>{{ tag }}</v-chip>
              </span>
            </div>
          </div>
        </v-col>

        <v-col cols="auto">
          <v-btn
            color="black"
            variant="flat"
            size="large"
            rounded="pill"
            class="px-6 text-none font-weight-medium"
            @click="buttonClicked"
          >
            {{ buttonLabel }}
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

      <!-- Videos -->
      <div v-if="activeTab === 'videos' && videos.length">
        <v-row>
          <v-col v-for="video in videos" :key="video.videoId" cols="12" sm="6" md="4" lg="3">
            <VideoCard :video="video"></VideoCard>
          </v-col>
        </v-row>
      </div>

      <!-- Shorts -->
      <div v-else-if="activeTab === 'shorts' && shorts.length">
        <v-row>
          <v-col v-for="video in shorts" :key="video.videoId" cols="12" sm="6" md="4" lg="3">
            <VideoCard :video="video"></VideoCard>
          </v-col>
        </v-row>
      </div>

      <!-- Streams -->
      <div v-else-if="activeTab === 'streams' && streams.length">
        <v-row>
          <v-col v-for="video in streams" :key="video.videoId" cols="12" sm="6" md="4" lg="3">
            <VideoCard :video="video"></VideoCard>
          </v-col>
        </v-row>
      </div>

      <!-- Podcasts -->
      <div v-else-if="activeTab === 'podcasts' && podcasts.length">
        <v-row>
          <v-col
            v-for="playlist in podcasts"
            :key="playlist.playlistId"
            cols="12"
            sm="6"
            md="4"
            lg="3"
          >
            <PlaylistCard :playlist="playlist" />
          </v-col>
        </v-row>
      </div>

      <!-- Releases -->
      <div v-else-if="activeTab === 'releases' && releases.length">
        <v-row>
          <v-col
            v-for="playlist in releases"
            :key="playlist.playlistId"
            cols="12"
            sm="6"
            md="4"
            lg="3"
          >
            <PlaylistCard :playlist="playlist" />
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
            <PlaylistCard :playlist="playlist" />
          </v-col>
        </v-row>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import PlaylistCard from "@/components/PlaylistCard.vue";
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
const isSubscribed = ref(false);
const buttonLabel = computed(() => (isSubscribed.value ? "Unsubscribe" : "Subscribe"));
const tabs = ["videos", "podcasts", "releases", "shorts", "streams", "playlists"];

// Content for each tab
const playlists = ref<Playlist[]>([]);
const podcasts = ref<Playlist[]>([]);
const releases = ref<Playlist[]>([]);

const videos = ref<Video[]>([]);
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

async function buttonClicked() {
  if (isSubscribed.value) {
    if (!channel.value?.authorId) {
      console.error("No authorId found for channel:", channel.value);
      return;
    }
    await invidious.subscribetToUcid(channel.value.authorId);
    console.log("User subscribed to:", channel.value.author);
  } else {
    if (!channel.value?.authorId) {
      console.error("No authorId found for channel:", channel.value);
      return;
    }
    await invidious.removeSubscriptionToUcid(channel.value.authorId);
    console.log("User unsubscribed from:", channel.value.author);
  }
  isSubscribed.value = !isSubscribed.value;
}

async function loadChannel() {
  loading.value = true;
  try {
    const data = await invidious.getChannelDetails(channelId.value);
    if (!data) throw new Error("Couldn't get channel");
    channel.value = data;
    activeTab.value = data.tabs[0] || "videos";
    console.log(`Checking subscription status for channel ID: ${channel.value.authorId}`);
    const subscriptionsList = await invidious.getUserSubscriptionList();
    isSubscribed.value = subscriptionsList.some((sub) => sub.authorId === channel.value?.authorId);
    console.log("isSubscribed:", isSubscribed.value);
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
}

async function loadTabContent(tab: string) {
  if (!channelId.value) return;

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
      case "podcasts":
        console.log("fetching podcasts");
        podcasts.value = await invidious.getChannelPodcasts(channelId.value);
      case "releases":
        console.log("fetching releases");
        releases.value = await invidious.getChannelReleases(channelId.value);
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
const formatSubscribers = (count: number): string => {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return count.toString();
};

const formatViews = (count: number): string => {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return count.toString();
};

const formatDate = (timestamp: number): string => {
  if (timestamp === 0) return "Unknown";
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
};
</script>

<style scoped>
.channel-banner {
  border-radius: 0;
}
</style>
