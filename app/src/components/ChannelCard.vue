<template>
  <div>
    <v-card
      class="creator-card spatial-item"
      style="cursor: pointer"
      hover
      rounded
      height="300px"
      max-width="350px"
      @click="navigateToChannel(channel.authorId)"
    >
      <v-img height="120px" :src="banner" cover></v-img>

      <v-card-item class="text-center mt-n8">
        <v-avatar size="80" class="elevation-4 mb-2">
          <v-img :src="channel.authorThumbnails[0]?.url"></v-img>
        </v-avatar>

        <v-card-title class="d-flex align-center justify-center">
          {{ channel.author }}
          <v-icon v-if="channel.authorVerified" size="small" color="primary" class="ml-1">
            mdi-check-circle
          </v-icon>
        </v-card-title>

        <v-card-subtitle>
          <v-chip size="small" variant="tonal" color="primary" label>
            {{ formatCount(channel.subCount) }} subscribers
          </v-chip>
          <span style="margin-left: 4px"></span>
          <v-chip size="small" variant="tonal" color="secondary" label>
            {{ formatCount(channel.totalViews) }} views
          </v-chip>
        </v-card-subtitle>
      </v-card-item>

      <v-card-text class="text-center">
        {{ channel.description }}
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import type { Channel } from "@/interfaces/channels";
import { navigateToChannel } from "@/router";
import { computed, onMounted } from "vue";

const props = defineProps<{
  channel: Channel;
  disableInteraction?: boolean;
}>();
console.log(`PROPS: ${JSON.stringify(props.channel)}`);

const formatCount = (count?: number): string => {
  if (!count) return "0";
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
};

const banner = computed(() => {
  if (props.channel && props.channel.authorBanners) {
    return props.channel.authorBanners[0]?.url;
  } else if (props.channel.authorThumbnails) {
    return props.channel.authorThumbnails[0]?.url;
  } else {
    return undefined;
  }
});

onMounted(() => {
  console.log(`PROPS on MOUNTED: ${JSON.stringify(props.channel)}`);
});
</script>

<style scoped>
.creator-card {
  color: transparent !important;
  height: 100%;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.creator-card:hover,
.spatial-focus {
  transform: scale(1.07);
}

.v-card-text,
.v-card-title,
.v-card-subtitle {
  color: white !important;
}

.v-card-title {
  font-size: medium;
  font-weight: 500;
}

.v-card-text {
  font-size: small;
}
</style>
