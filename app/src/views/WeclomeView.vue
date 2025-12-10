<template>
  <v-container class="fill-height" fluid>
    <v-row justify="center" align="center" style="width: 100%">
      <v-col cols="12" sm="8" md="6">
        <v-card elevation="4">
          <v-card-item>
            <v-card-title class="text-h5 text-center">Welcome!</v-card-title>
            <v-card-subtitle class="text-center mb-4">
              Please enter the base URL of your Invidious instance.
              <br />
              <strong>Note:</strong> Only <strong>HTTPS</strong> URLs are supported.
            </v-card-subtitle>
          </v-card-item>
          <v-card-item>
            <v-form @submit.prevent="onSubmit">
              <v-text-field
                v-model="baseUrl"
                label="Invidious Base URL"
                placeholder="https://invidious.example.com"
                density="compact"
                :rules="[httpsRule]"
                required
              />
              <v-btn type="submit" color="primary" block class="mt-4"> Continue </v-btn>
            </v-form>
          </v-card-item>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { INVIDIOUS_BASE_URL_KEY } from "@/helper/invidious";
import { ref } from "vue";
import { useRouter } from "vue-router";

const baseUrl = ref("");
const router = useRouter();
// Validation: must start with https://
const httpsRule = (value: string) => /^https:\/\/.+/.test(value) || "URL must start with https://";

function onSubmit() {
  console.log("Submit event triggered with baseUrl:", baseUrl.value);
  localStorage.setItem(INVIDIOUS_BASE_URL_KEY, baseUrl.value);
  router.push({ name: "Popular" });
}
</script>

<style scoped>
.fill-height {
  min-height: 100vh;
}
</style>
