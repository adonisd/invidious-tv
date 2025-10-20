import { createRouter, createWebHistory } from "vue-router";
import DashboardView from "../views/DashboardView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "Popular",
      component: DashboardView,
    },
    {
      path: "/about",
      name: "about",
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import("../views/AboutView.vue"),
    },
    {
      path: "/homeview",
      name: "homeview",
      component: () => import("../views/HomeView.vue"),
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
