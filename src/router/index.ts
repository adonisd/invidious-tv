import { createRouter, createWebHistory } from "vue-router";
import VideosListView from "../views/VideosList.vue";
import AuthView from "@/views/AuthView.vue";
import PlaylistsView from "@/views/PlaylistsView.vue";
import VideoView from "@/views/VideoView.vue";
import HistoryView from "@/views/HistoryView.vue";
import UserSettingsView from "@/views/UserSettingsView.vue";
import ChannelView from "@/views/ChannelView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // PUBLIC CALLS
    {
      path: "/",
      name: "Root",
      component: VideosListView,
    },
    {
      path: "/popular",
      name: "Popular",
      component: VideosListView,
    },
    {
      path: "/trending",
      name: "Trending",
      component: VideosListView,
    },
    // AUTH CALLS
    {
      path: "/feed",
      name: "Feed",
      component: VideosListView,
    },
    {
      path: "/playlists",
      name: "Playlists",
      component: PlaylistsView,
    },
    {
      path: "/history",
      name: "History",
      component: HistoryView,
    },
    {
      path: "/settings",
      name: "Settings",
      component: UserSettingsView,
    },
    {
      path: "/video/:id",
      name: "video",
      component: VideoView,
      props: true,
    },
    {
      path: "/channel/:id",
      name: "channel",
      component: ChannelView,
      props: true,
    },
    {
      path: "/auth/callback",
      name: "auth",
      component: AuthView,
    },
  ],
});

export default router;
