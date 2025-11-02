import { createRouter, createWebHistory } from "vue-router";
import VideosListView from "../views/VideosList.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
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
      path: "/video/:id",
      name: "video",
      component: () => import("../views/VideoView.vue"),
      props: true,
    },
  ],
});

export default router;
