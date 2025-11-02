import { createRouter, createWebHistory } from "vue-router";
import DashboardView from "../views/DashboardView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/popular",
      name: "Popular",
      component: DashboardView,
    },
    {
      path: "/trending",
      name: "Trending",
      component: DashboardView,
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
