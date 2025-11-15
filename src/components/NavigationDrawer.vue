<template>
  <v-navigation-drawer app rail expandOnHover permanent>
    <v-list>
      <v-list-item
        v-if="isLoggedIn"
        :prepend-avatar="avatar"
        :subtitle="currentUser"
        title="Logged In"
      ></v-list-item>
      <v-list-item
        v-else
        prepend-icon="mdi-account-off"
        subtitle="Not authenticated"
        title="Guest"
      ></v-list-item>
    </v-list>

    <v-divider></v-divider>

    <v-list density="compact" nav>
      <v-list-item
        v-if="hideTopBar"
        prepend-icon="mdi-magnify"
        title="Search"
        @click="hideTopBar = !hideTopBar"
        class="spatial-item"
      >
      </v-list-item>
      <v-list-item
        prepend-icon="mdi-fire"
        title="Popular"
        to="/popular"
        class="spatial-item"
      ></v-list-item>
      <v-list-item
        prepend-icon="mdi-trending-up"
        title="Trending"
        to="/trending"
        class="spatial-item"
      ></v-list-item>
      <v-list-item
        v-if="isLoggedIn"
        prepend-icon="mdi-rss"
        title="Feed"
        to="/feed"
        class="spatial-item"
      ></v-list-item>
      <v-list-item
        v-if="isLoggedIn"
        prepend-icon="mdi-playlist-play"
        title="Playlists"
        to="/playlists"
        class="spatial-item"
      ></v-list-item>
      <v-list-item
        v-if="isLoggedIn"
        prepend-icon="mdi-history"
        title="History"
        to="/history"
        class="spatial-item"
      ></v-list-item>
      <v-list-item
        prepend-icon="mdi-cog"
        title="Settings"
        to="/settings"
        class="spatial-item"
      ></v-list-item>
      <v-list-item
        prepend-icon="mdi-account"
        title="Switch User"
        to="/"
        class="spatial-item"
      ></v-list-item>
      <v-list-item
        v-if="!isLoggedIn"
        prepend-icon="mdi-login"
        title="Login"
        @click="users.authorize()"
        class="spatial-item"
      ></v-list-item>
      <v-list-item
        v-else
        prepend-icon="mdi-logout"
        title="Logout"
        @click="handleLogout"
        class="spatial-item"
      ></v-list-item>
    </v-list>
  </v-navigation-drawer>
  <v-app-bar
    scroll-behavior="fully-hide"
    scroll-target="main.v-main.main-content"
    flat
    floating
    class="app-bar"
    v-if="!hideTopBar"
  >
    <v-autocomplete
      v-model="selectedQuery"
      v-model:search="searchInput"
      :items="predictions"
      :loading="loading"
      label="Search"
      density="comfortable"
      flat
      variant="solo"
      hide-no-data
      single-line
      autocomplete="off"
      @click:prepend-inner="handleSearch"
      @update:model-value="handleSearch"
      menu-icon=""
      prepend-inner-icon="mdi-magnify"
      style="max-width: 350px"
      theme="dark"
      auto-select-first
      class="autocomplete-search-bar"
    >
    </v-autocomplete>
  </v-app-bar>
</template>

<script setup lang="ts">
import { InvidiousHelper } from "@/helper/invidious";
import { LocalUsers } from "@/helper/users";
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

const searchInput = ref<string | undefined>(undefined);
const selectedQuery = ref<string | null>(null);
const predictions = ref<string[]>([]);
const loading = ref(false);
const router = useRouter();
const invidiousHelper = new InvidiousHelper();
const users = new LocalUsers();
const currentUser = computed(() => users.getCurrentUser());
const settings = ref(users.getUserSettings(currentUser.value || "guest"));
const token = ref(settings.value ? settings.value.token : null);
const isLoggedIn = computed(() => !!token.value);
const hideTopBar = ref(false);
const route = useRoute();
watch(route, (newRoute) => {
  console.log("Route changed:", newRoute);
  if (newRoute.name?.toString().toLocaleLowerCase() === "video") {
    hideTopBar.value = true;
  } else {
    hideTopBar.value = false;
  }
});

const handleLogout = () => {
  users.clearToken(currentUser.value || "guest");
  token.value = null;
};

const avatar = computed(() => {
  // TODO Figure out if invidious has profile pictures if not maybe use gravatar or randomuser or implement upload
  const randomNum = Math.floor(Math.random() * 99) + 1;
  // return randomly men or women
  const gender = Math.random() < 0.5 ? "men" : "women";
  return `https://randomuser.me/api/portraits/${gender}/${randomNum}.jpg`;
});

// Watch search input and fetch predictions
watch(searchInput, (val) => {
  if (!val) {
    setTimeout(() => (predictions.value = []), 300);
  } else {
    if (val !== selectedQuery.value) {
      fetchPredictions(val);
    }
  }
});

const fetchPredictions = async (value: string) => {
  // TODO Make this more elaborate (If channel do this if video do that if playlist do that)
  if (value.length <= 2) {
    predictions.value = [];
    return;
  }

  loading.value = true;

  try {
    const suggestions = await invidiousHelper.getSearchSuggestions(value);

    // Drop response if search input changed (race condition)
    if (value !== searchInput.value) {
      return;
    }

    console.log("Search Predictions:", suggestions);
    predictions.value = suggestions
      .map((item) => {
        if ("title" in item) {
          return item.title;
        } else if ("author" in item) {
          return item.author;
        } else {
          return "";
        }
      })
      .filter((item) => item !== "");
  } catch (error) {
    console.error("Error fetching predictions:", error);
    predictions.value = [];
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  const query = selectedQuery.value || searchInput.value;

  console.log("Handling Search:", query);
  if (!query) {
    console.warn("Search query is empty.");
    return;
  }

  router.push({
    name: "Search",
    query: {
      // TODO ADD FILTERS
      query: query,
    },
  });
};

const $route = useRoute();

watch(
  () => $route.fullPath,
  () => {
    token.value = users.getUserSettings(currentUser.value || "guest")?.token || null;
  },
);
</script>

<style>
.v-list-item__content,
.v-list-item-title {
  font-weight: 500 !important;
}
.v-list-item__overlay {
  color: rgba(var(--v-theme-primary), 0.2);
}
.app-bar {
  justify-content: center;
  background-color: transparent !important;
  height: 42px;
}
.autocomplete-search-bar {
  margin-left: auto;
  margin-right: auto;
  margin-top: 35px;
}

.autocomplete-search-bar input {
  height: 100%;
  background-color: transparent;
  border: none;
  padding: 0 !important;
}

.autocomplete-search-bar .v-field__input {
  padding: 0px;
}
</style>
