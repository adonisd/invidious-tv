<template>
  <VideoComponent :videoId="videoId" />
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import VideoComponent from "@/components/VideoComponent.vue";

const route = useRoute();
const videoId = computed(() => route.params.id as string);
</script>
