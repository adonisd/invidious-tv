<template>
  <v-container>
    <v-card v-if="isLoading">
      <v-card-title>Authenticating...</v-card-title>
      <v-card-text class="text-center">
        <v-progress-circular indeterminate color="primary" />
      </v-card-text>
    </v-card>

    <v-card v-else-if="error" color="error">
      <v-card-title>Authentication Failed</v-card-title>
      <v-card-text>
        {{ error }}
      </v-card-text>
      <v-card-actions>
        <v-btn @click="router.push('/')">Go Home</v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { InvidiousHelper } from "@/helper/invidious";
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const invidiousHelper = new InvidiousHelper();

const isLoading = ref(true);
const error = ref("");

onMounted(() => {
  console.log("Current URL:", window.location.href);
  console.log("Search params:", window.location.search);

  try {
    const token = invidiousHelper.parseAuthCallback();

    if (token) {
      console.log("Authentication successful! Token:", token.substring(0, 10) + "...");
      // Give user feedback before redirecting
      setTimeout(() => {
        router.push("/");
      }, 500);
    } else {
      console.error("No token found in URL");
      error.value = "No authentication token found in the URL";
      isLoading.value = false;
    }
  } catch (e) {
    console.error("Error parsing token:", e);
    error.value = "Failed to parse authentication token";
    isLoading.value = false;
  }
});
</script>
