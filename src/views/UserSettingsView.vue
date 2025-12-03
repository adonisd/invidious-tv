<template>
  <h1 v-if="user === null">What are you doing here and how did you get here?</h1>
  <div v-else>
    <form>
      <v-container>
        <v-row>
          <v-col cols="12">
            <v-switch label="Show Shorts" v-model="showShorts"></v-switch>
            <v-text-field
              label="Base URL"
              v-model="baseUrl"
              density="compact"
              color="primary"
              class="text-field"
            ></v-text-field>
            <v-row>
              <v-select
                label="Preferred Resolution"
                :items="supportedResolutions"
                v-model="selectedPreferredResolution"
                @update:model-value="changeResolution"
                style="padding: 2%"
              ></v-select>
              <v-select
                v-model="selectedTheme"
                :items="themesMap"
                label="Theme"
                item-title="label"
                item-value="value"
                @update:model-value="changeTheme"
                class="spatial-item"
                style="padding: 2%"
              ></v-select>
            </v-row>
            <v-divider></v-divider>
          </v-col>
          <v-col cols="12">
            <h3 class="mb-4">Subscriptions</h3>
            <div v-if="subscriptions.length === 0" class="text-center pa-4 text-grey">
              No subscriptions found.
            </div>
            <v-list v-else>
              <v-list-item v-for="sub in subscriptions" :key="sub.authorId" class="mb-2">
                <template v-slot:prepend>
                  <v-avatar color="primary">
                    <span class="text-white">
                      {{ sub.author.charAt(0).toUpperCase() }}
                    </span>
                  </v-avatar>
                </template>
                <v-list-item-title
                  ><a :href="`/#/channel/${sub.authorId}`" class="spatial-item">{{
                    sub.author
                  }}</a></v-list-item-title
                >
                <template v-slot:append>
                  <v-btn
                    color="error"
                    variant="outlined"
                    size="small"
                    @click="invidious.removeSubscriptionToUcid(sub.authorId)"
                    :loading="unsubscribingIds.includes(sub.authorId)"
                  >
                    Unsubscribe
                  </v-btn>
                </template>
              </v-list-item>
            </v-list>
          </v-col>
        </v-row>
      </v-container>
    </form>
  </div>
</template>

<script setup lang="ts">
import { InvidiousHelper, INVIDIOUS_BASE_URL_KEY } from "@/helper/invidious";
import { themesMap, type ThemeName } from "@/helper/themes";
import {
  defaultSettings,
  LocalUsers,
  supportedResolutions,
  type UserSettings,
} from "@/helper/users";
import type { UserSubscription } from "@/interfaces/user";
import { computed, onMounted, ref } from "vue";
import { useTheme } from "vuetify";

const theme = useTheme();
const user = ref<string>();
const settings = ref<UserSettings>();
const invidious = new InvidiousHelper();
const localUsers = new LocalUsers();
const unsubscribingIds = ref<string[]>([]);
const subscriptions = ref<UserSubscription[]>([]);

const currentUser = localUsers.getCurrentUser();
if (!currentUser) {
  user.value = "guest";
} else {
  user.value = currentUser;
}

const currentSettings = localUsers.getUserSettings(user.value);
if (!currentSettings) {
  localUsers.setSettings(user.value, defaultSettings);
  settings.value = defaultSettings;
} else {
  settings.value = currentSettings;
}
const selectedTheme = ref<ThemeName>(settings.value.activeTheme);
const selectedPreferredResolution = ref<UserSettings["preferredResolution"]>(
  settings.value.preferredResolution || "auto",
);

onMounted(async () => {
  theme.global.name.value = selectedTheme.value;
  try {
    const subscription = await invidious.getUserSubscriptionList();
    subscriptions.value = subscription;
  } catch (error) {
    console.warn("Failed to fetch subscriptions:", error);
  }
});

// Change theme function
const changeTheme = (newTheme: ThemeName) => {
  theme.global.name.value = newTheme;
  localUsers.changeTheme(user.value || "guest", newTheme);
};

const changeResolution = (newResolution: UserSettings["preferredResolution"]) => {
  localUsers.changeDefaultResolution(currentUser || "guest", newResolution);
};

const showShorts = computed({
  get: () => settings.value?.showShorts ?? true,
  set: (val) => {
    if (settings.value) {
      settings.value.showShorts = val;
      localUsers.toggleShowShorts(user.value || "guest");
    }
  },
});

const baseUrl = computed({
  get: () => localStorage.getItem(INVIDIOUS_BASE_URL_KEY),
  set: (val) => {
    console.log("Setting base URL:", val);
    localStorage.setItem(INVIDIOUS_BASE_URL_KEY, val || "");
  },
});
</script>

<style>
input {
  color: rgb(var(--v-theme-primary));
  background-color: rgba(var(--v-them-background), 1);
}
</style>
