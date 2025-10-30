<script setup lang="ts">
import { RouterView } from "vue-router";
import HeaderBar from "./components/HeaderBar.vue";
</script>

<template>
  <v-app>
    <!-- Header -->
    <HeaderBar />

    <!-- Layout -->
    <v-main>
      <v-container fluid class="app-layout">
        <!-- Sidebar + Main Content -->
        <v-row no-gutters>
          <!-- Permanent Sidebar -->
          <v-col cols="auto">
            <v-navigation-drawer permanent width="260" class="app-drawer">
              <v-list>
                <v-list-item
                  prepend-avatar="https://randomuser.me/api/portraits/women/85.jpg"
                  subtitle="sandra_a88@gmail.com"
                  title="Sandra Adams"
                ></v-list-item>
              </v-list>

              <v-divider></v-divider>

              <v-list density="compact" nav>
                <v-list-item prepend-icon="mdi-home" title="Home" to="/"></v-list-item>
                <v-list-item prepend-icon="mdi-star" title="About" to="/about"></v-list-item>
                <v-list-item
                  prepend-icon="mdi-view-dashboard"
                  title="Dashboard"
                  to="/dashboard"
                ></v-list-item>
              </v-list>
            </v-navigation-drawer>
          </v-col>

          <!-- Main Content -->
          <v-col>
            <v-container fluid class="app-content">
              <RouterView />
            </v-container>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<style scoped>
.app-layout {
  display: flex;
  height: calc(100vh - 64px); /* Adjust for HeaderBar height */
}
</style>

<style>
.v-list-item--variant-plain,
.v-list-item--variant-outlined,
.v-list-item--variant-text,
.v-list-item--variant-tonal {
  color: rgba(255, 255, 255, 0.2) !important;
}

.v-list-item-title {
  font-weight: 500 !important;
  color: rgba(255, 255, 255, 1) !important;
}
</style>
