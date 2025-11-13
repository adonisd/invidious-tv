<template>
  <v-container>
    <!-- Search Info Header -->
    <v-row>
      <v-card width="100%"
        ><h2>Search results for: "{{ searchQuery }}"</h2>
        <div v-if="activeFilters.length > 0" class="mt-2">
          <v-chip
            v-for="filter in activeFilters"
            :key="filter"
            class="mr-2"
            size="small"
            closable
            @click:close="removeFilter(filter)"
          >
            {{ filter }}
          </v-chip>
        </div>
        <!-- Tabs for different result types -->
        <v-tabs v-model="activeTab" bg-color="surface">
          <v-tab value="all">
            All
            <v-chip v-if="allResults.length > 0" size="x-small" class="ml-2">
              {{ allResults.length }}
            </v-chip>
          </v-tab>
          <v-tab value="videos">
            Videos
            <v-chip v-if="videos.length > 0" size="x-small" class="ml-2">
              {{ videos.length }}
            </v-chip>
          </v-tab>
          <v-tab value="channels">
            Channels
            <v-chip v-if="channels.length > 0" size="x-small" class="ml-2">
              {{ channels.length }}
            </v-chip>
          </v-tab>
          <v-tab value="playlists">
            Playlists
            <v-chip v-if="playlists.length > 0" size="x-small" class="ml-2">
              {{ playlists.length }}
            </v-chip>
          </v-tab>
        </v-tabs>
      </v-card>

      <v-divider></v-divider>

      <!-- Loading State -->
      <v-row v-if="loading" class="mt-4">
        <v-col class="text-center">
          <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
          <p class="mt-4">Searching...</p>
        </v-col>
      </v-row>

      <!-- Error State -->
      <v-row v-else-if="error" class="mt-4">
        <v-col>
          <v-alert type="error" variant="tonal">
            {{ error }}
          </v-alert>
        </v-col>
      </v-row>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch, onUnmounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { InvidiousHelper } from "@/helper/invidious";
import type { Video } from "@/interfaces/videos";
import type { Playlist } from "@/interfaces/playlists";
import type { Channel } from "@/interfaces/channels";
import type { SearchParams } from "@/interfaces/search";
import type { HashTag } from "@/interfaces/hashtags";

const props = defineProps<SearchParams>();

const router = useRouter();
const route = useRoute();
const invidious = new InvidiousHelper();

const loading = ref(false);
const error = ref<string | null>(null);
const activeTab = ref("all");
const currentPage = ref(props.page || 1);
const searchQuery = ref(props.query || "");

// Results arrays
const allResults = ref<Array<Video | Channel | Playlist | HashTag>>([]);
const videos = ref<Video[]>([]);
const channels = ref<Channel[]>([]);
const playlists = ref<Playlist[]>([]);

// Computed active filters
const activeFilters = computed(() => {
  const filters: string[] = [];
  if (props.sort) filters.push(`Sort: ${props.sort}`);
  if (props.type && props.type !== "all") filters.push(`Type: ${props.type}`);
  if (props.date) filters.push(`Date: ${props.date}`);
  if (props.duration) filters.push(`Duration: ${props.duration}`);
  // if props.features filters.push(`Features ${props.features}`)
  if (props.region) filters.push(`Region: ${props.region}`);
  return filters;
});

const performSearch = async (page: number = 1) => {
  if (!searchQuery.value) return;

  loading.value = true;
  error.value = null;

  try {
    const searchParams: SearchParams = {
      query: searchQuery.value,
      page,
      // ...(props.sort && { sort: props.sort }),
      // ...(props.date && { date: props.date }),
      // ...(props.duration && { duration: props.duration }),
      // ...(props.type && { type: props.type }),
      // ...(props.features && { features: props.features }),
      // ...(props.region && { region: props.region }),
    };

    const results = await invidious.search(searchParams);

    // Type guard and categorize results
    allResults.value = Array.isArray(results) ? results : [];

    videos.value = allResults.value.filter(
      (item): item is Video => item.type === "video" || item.type === "shortVideo",
    );

    channels.value = allResults.value.filter((item): item is Channel => item.type === "channel");

    playlists.value = allResults.value.filter((item): item is Playlist => item.type === "playlist");
  } catch (err) {
    console.error("Search failed:", err);
    error.value = "Failed to perform search. Please try again.";
  } finally {
    loading.value = false;
  }
};

// const handlePageChange = (page: number) => {
//   currentPage.value = page;
//   router.push({
//     query: { ...route.query, page: String(page) },
//   });
//   window.scrollTo({ top: 0, behavior: "smooth" });
// };

const removeFilter = (filter: string) => {
  const query = { ...route.query };

  if (filter.startsWith("Sort:")) delete query.sort;
  else if (filter.startsWith("Type:")) delete query.type;
  else if (filter.startsWith("Date:")) delete query.date;
  else if (filter.startsWith("Duration:")) delete query.duration;
  else if (filter.startsWith("Features:")) delete query.features;
  else if (filter.startsWith("Region:")) delete query.region;

  router.push({ query });
};

// Watch for query changes
watch(
  () => route.query,
  () => {
    searchQuery.value = (route.query.query as string) || "";
    currentPage.value = route.query.page ? Number(route.query.page) : 1;
    performSearch(currentPage.value);
  },
);

onMounted(() => {
  performSearch(currentPage.value);
});

onUnmounted(() => {
  // if (observer) {
  //   observer.disconnect();
  // }
});
</script>

<style scoped>
.custom-col {
  flex: 0 0 22%;
  max-width: 22%;
  cursor: pointer;
}

.channel-card {
  cursor: pointer;
  transition: transform 0.2s;
}

.channel-card:hover {
  transform: translateY(-4px);
}

.playlist-card {
  cursor: pointer;
  transition: transform 0.2s;
  position: relative;
}

.playlist-card:hover {
  transform: translateY(-4px);
}

.playlist-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
}

.playlist-count {
  margin-top: 8px;
  font-size: 14px;
  font-weight: 500;
}
</style>
