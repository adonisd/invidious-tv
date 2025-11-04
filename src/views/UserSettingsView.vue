<template>
  <h1 v-if="user === null">What are you doing here and how did you get here?</h1>
  <div v-else>
    <v-card elevation="2">
      <form>
        <v-container>
          <v-row>
            <v-col>
              <v-switch :label="`Show Shorts`" v-model="showShorts"></v-switch>
            </v-col>
          </v-row>
        </v-container>
      </form>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { InvidiousHelper, type UserSettings } from "@/helper/invidious";
import { computed, ref } from "vue";

const user = ref<string>();
const settings = ref<UserSettings>();
const invidious = new InvidiousHelper();
settings.value = invidious.getUserSettings();

const showShorts = computed({
  get: () => settings.value?.showShorts ?? true,
  set: (val) => {
    if (settings.value) {
      settings.value.showShorts = val;
      localStorage.setItem("invidious_settings", JSON.stringify(settings.value));
    }
  },
});
</script>
