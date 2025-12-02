<template>
  <v-row align="center" justify="center" style="width: 100%">
    <v-col cols="12" md="8" lg="6">
      <div class="text-center mb-8">
        <h1 class="text-h3 text-md-h2 font-weight-bold mb-2">Who is Watching?</h1>
        <p class="text-subtitle-1 text-grey-lighten-1">Select your profile to continue</p>
      </div>

      <v-row justify="center" class="user-grid">
        <!-- All Users from LocalUsers -->
        <v-col v-for="user in users" :key="user" cols="6" sm="4" md="3" class="text-center">
          <v-hover v-slot="{ isHovering, props }">
            <v-card
              v-bind="props"
              :elevation="isHovering ? 12 : 2"
              class="user-card mx-auto spatial-item"
              :class="{ 'user-card-hover': isHovering }"
              @click="selectUser(user)"
            >
              <v-avatar :size="100">
                <v-icon v-if="user === 'guest'" size="60" color="white"> mdi-account </v-icon>
                <span v-else class="text-h4 text-white font-weight-bold">
                  {{ getUserInitial(user) }}
                </span>
              </v-avatar>
              <v-card-text class="pa-2">
                <div class="text-body-1 font-weight-medium text-truncate">
                  {{ user }}
                </div>
              </v-card-text>
            </v-card>
          </v-hover>
        </v-col>

        <!-- Add User Button -->
        <v-col cols="6" sm="4" md="3" class="text-center">
          <v-hover v-slot="{ isHovering, props }">
            <v-card
              v-bind="props"
              :elevation="isHovering ? 12 : 2"
              class="user-card mx-auto add-user-card spatial-item"
              :class="{ 'user-card-hover': isHovering }"
              @click="addUser"
            >
              <v-avatar size="100" color="grey-darken-2">
                <v-icon size="60" color="white">mdi-plus</v-icon>
              </v-avatar>
              <v-card-text class="pa-2">
                <div class="text-body-1 font-weight-medium">Add User</div>
              </v-card-text>
            </v-card>
          </v-hover>
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { LocalUsers } from "@/helper/users";
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { userState } from "@/stores/users";
import { useTheme } from "vuetify";
const users = ref<string[]>([]);
const localUsers = new LocalUsers();
const router = useRouter();
const theme = useTheme();

onMounted(() => {
  // Get all users from LocalUsers
  const usersList = localUsers.getUsersList();
  // put guest user at the end of the list
  if (usersList.includes("guest")) {
    usersList.splice(usersList.indexOf("guest"), 1);
    usersList.push("guest");
  }
  users.value = usersList;
});

function selectUser(username: string) {
  console.log("Selected user:", username);
  userState.switchUser(username);
  router.push({ name: "Popular" });

  const userSettings = localUsers.getUserSettings(username);
  if (!userSettings) {
    return;
  }
  console.log("Setting THEME to: ", userSettings.activeTheme);
  theme.global.name.value = userSettings.activeTheme;
}

function addUser() {
  localUsers.authorize();
}

function getUserInitial(username: string): string {
  return username.charAt(0).toUpperCase();
}
</script>

<style scoped>
.bg-gradient {
  background: linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%);
  min-height: 100vh;
}

.user-grid {
  width: 100%;
  margin: 0 auto;
}

.user-card {
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 20px;
  max-width: 160px;
}

.user-card-hover {
  transform: scale(1.05);
  background: rgba(255, 255, 255, 0.08);
}

.add-user-card {
  border: 2px dashed rgba(255, 255, 255, 0.3);
}

.v-card-text {
  color: white !important;
}

h1 {
  color: white;
}
</style>
