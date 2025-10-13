<template>
  <div class="video-view">
    <VideoComponent :videoId="videoId" />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import VideoComponent from "@/components/VideoComponent.vue";

const route = useRoute();
const videoId = computed(() => route.params.id as string);
</script>

<style scoped>
.video-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2em 0;
}
</style>
