<template>
  <v-navigation-drawer app permanent>
    <v-list>
      <v-list-item
        prepend-avatar="https://randomuser.me/api/portraits/women/85.jpg"
        subtitle="sandra_a88@gmailcom"
        title="Sandra Adams"
      ></v-list-item>
    </v-list>

    <v-divider></v-divider>

    <v-list density="compact" nav>
      <v-list-item prepend-icon="mdi-fire" title="Popular" to="/popular"></v-list-item>
      <v-list-item prepend-icon="mdi-trending-up" title="Trending" to="/trending"></v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>
<style>
.v-list-item__content,
.v-list-item-title {
  font-weight: 500 !important;
}
.v-list-item__overlay {
  color: rgba(var(--v-theme-primary), 0.2);
}
</style>
