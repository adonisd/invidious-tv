<template>
  <h1 v-if="user === null">What are you doing here and how did you get here?</h1>
  <div v-else>
    <form>
      <v-container>
        <v-row>
          <v-col>
            <v-switch :label="`Show Shorts`" v-model="showShorts"></v-switch>
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
                    <span class="text-white">{{ sub.author.charAt(0).toUpperCase() }}</span>
                  </v-avatar>
                </template>
                <v-list-item-title>{{ sub.author }}</v-list-item-title>
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
import { InvidiousHelper, type UserSettings } from "@/helper/invidious";
import type { UserSubscription } from "@/interfaces/user";
import { computed, onMounted, ref } from "vue";

const user = ref<string>();
const settings = ref<UserSettings>();
const invidious = new InvidiousHelper();
settings.value = invidious.getUserSettings();

const unsubscribingIds = ref<string[]>([]);

const subscriptions = ref<UserSubscription[]>([]);
onMounted(async () => {
  const subscriptionsList = await invidious.getUserSubscriptionList();
  console.log(subscriptionsList);
  subscriptions.value = subscriptionsList;
});

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
