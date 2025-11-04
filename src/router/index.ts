import { createRouter, createWebHistory } from "vue-router";
import VideosListView from "../views/VideosList.vue";
import AuthView from "@/views/AuthView.vue";
import PlaylistsView from "@/views/PlaylistsView.vue";
import VideoView from "@/views/VideoView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
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
      path: "/video/:id",
      name: "video",
      component: VideoView,
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
