<template>
  <v-navigation-drawer app rail expandOnHover permanent>
    <v-list>
      <v-list-item
        v-if="isLoggedIn"
        prepend-avatar="https://randomuser.me/api/portraits/women/85.jpg"
        :subtitle="invidiousHelper.getUser() || 'guest'"
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
        v-if="!isLoggedIn"
        prepend-icon="mdi-login"
        title="Login"
        @click="handleLogin"
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
</template>

<script setup lang="ts">
import { InvidiousHelper } from "@/helper/invidious";
import { computed, ref } from "vue";

const invidiousHelper = new InvidiousHelper();

const token = ref(invidiousHelper.getToken());
const isLoggedIn = computed(() => !!token.value);

// const username = computed(() => (token.value ? token.value.split("username=")[1] : ""));
// console.log(`USERNAME: ${username.value}`);

const handleLogin = () => {
  invidiousHelper.authorize();
};

const handleLogout = () => {
  invidiousHelper.clearToken();
  token.value = null;
};
</script>

<style>
.v-list-item__content,
.v-list-item-title {
  font-weight: 500 !important;
}
.v-list-item__overlay {
  color: rgba(var(--v-theme-primary), 0.2);
}
</style>
