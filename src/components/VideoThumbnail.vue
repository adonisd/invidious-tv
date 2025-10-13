<template>
  <v-card class="video-thumbnail" elevation="1">
    <!-- Thumbnail Image -->
    <v-img :src="thumbnail" height="180px" class="video-thumbnail__image">
      <!-- Optional Duration Overlay -->
      <template #placeholder>
        <v-row
          class="fill-height ma-0"
          justify="center"
          style="background-color: rgba(0, 0, 0, 0.1)"
        >
          <v-progress-circular indeterminate color="grey lighten-5" />
        </v-row>
      </template>
    </v-img>

    <!-- Creator Avatar + Title -->
    <v-card-title class="d-flex align-center gap-3 px-4 pt-4 pb-1">
      <v-avatar size="40">
        <v-img v-if="creatorImage" :src="creatorImage" />
      </v-avatar>
      <div class="video-title text-subtitle-1 font-weight-medium">
        {{ title }}
      </div>
    </v-card-title>

    <!-- Chips for metadata -->
    <v-card-subtitle class="d-flex flex-wrap">
      <div class="text-truncate text-subtitle-1 font-weight-medium">
        {{ author }}
      </div>
      <v-chip density="comfortable" variant="tonal" color="primary"> {{ views }} views </v-chip>
      <v-chip density="comfortable" variant="tonal" color="green">
        {{ duration }}
      </v-chip>
      <v-chip density="comfortable" variant="tonal" color="grey">
        {{ channel }}
      </v-chip>
    </v-card-subtitle>

    <!-- Actions -->
    <v-card-actions class="d-flex justify-end px-4 pb-4">
      <!-- <v-btn icon @click="drawer = true">
        <v-icon>mdi-dots-vertical</v-icon>
      </v-btn> -->
    </v-card-actions>

    <!-- Right-side Drawer -->
    <!-- <v-navigation-drawer v-model="drawer" location="right" temporary width="300">
      <v-sheet class="pa-4" height="100%">
        <v-avatar size="80" class="mx-auto mb-4">
          <v-img :src="creatorImage" />
        </v-avatar>
        <div class="text-h6 text-center mb-4">{{ channel }}</div>

        <v-list density="compact" nav>
          <v-list-item>
            <v-list-item-title>Go to Channel</v-list-item-title>
          </v-list-item>
          <v-list-item>
            <v-list-item-title>Subscribe</v-list-item-title>
          </v-list-item>
          <v-list-item>
            <v-list-item-title>Share Profile</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-sheet>
    </v-navigation-drawer> -->
  </v-card>
</template>

<script setup lang="ts">
// import { ref } from "vue";

// const drawer = ref(false);

defineProps<{
  thumbnail: string;
  title: string;
  views: number | string;
  duration: string;
  channel: string;
  author: string;
  creatorImage?: string;
}>();
</script>

<style scoped>
.video-thumbnail__image {
  object-fit: cover;
}
.text-truncate {
  overflow: visible;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 450px;
}

.video-title {
  white-space: normal;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2; /* Change to 3 if needed */
  -webkit-box-orient: vertical;
}
</style>
