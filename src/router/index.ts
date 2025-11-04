import { createRouter, createWebHistory } from "vue-router";
import VideosListView from "../views/VideosList.vue";
import AuthView from "@/views/AuthView.vue";
import PlaylistsView from "@/views/PlaylistsView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "Popular",
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
      component: () => import("../views/VideoView.vue"),
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
