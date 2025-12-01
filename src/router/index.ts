import { createRouter, createWebHashHistory } from "vue-router";
import VideosListView from "../views/VideosList.vue";
import AuthView from "@/views/AuthView.vue";
import PlaylistsView from "@/views/PlaylistsView.vue";
import VideoView from "@/views/VideoView.vue";
import HistoryView from "@/views/HistoryView.vue";
import UserSettingsView from "@/views/UserSettingsView.vue";
import ChannelView from "@/views/ChannelView.vue";
import SearchView from "@/views/SearchView.vue";
import WeclomeView from "@/views/WeclomeView.vue";
import WhoIsWatching from "@/views/WhoIsWatching.vue";

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    // PUBLIC CALLS
    {
      path: "/",
      name: "Root",
      component: WhoIsWatching,
    },
    {
      path: "/welcome",
      name: "Welcome",
      component: WeclomeView,
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
      path: "/callback",
      name: "auth",
      component: AuthView,
    },
    {
      path: "/search",
      name: "Search",
      component: SearchView,
      // Props function to pass query params as props
      props: (route) => ({
        query: route.query.query as string,
        page: route.query.page ? Number(route.query.page) : undefined,
        sort: route.query.sort as string | undefined,
        date: route.query.date as string | undefined,
        duration: route.query.duration as string | undefined,
        type: route.query.type as string | undefined,
        features: route.query.features ? (route.query.features as string).split(",") : undefined,
        region: route.query.region as string | undefined,
      }),
    },
  ],
});

export default router;
