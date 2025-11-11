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
            <v-col>
              <h3>Subscriptions:</h3>
              <div v-if="subscriptions.length === 0">No subscriptions found.</div>
              <v-chip v-for="sub in subscriptions" :key="sub.authorId" class="ma-2" label>
                {{ sub }}
              </v-chip>
            </v-col>
          </v-row>
        </v-container>
      </form>
    </v-card>
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
