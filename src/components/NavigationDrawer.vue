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
      <v-list-item prepend-icon="mdi-home" title="Home" to="/"></v-list-item>
      <v-list-item prepend-icon="mdi-star" title="About" to="/about"></v-list-item>
      <v-list-item
        prepend-icon="mdi-view-dashboard"
        title="Dashboard"
        to="/dashboard"
      ></v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>
<style>
.v-list-item--variant-text {
  color: rgba(255, 255, 255, 0.2) !important;
}
.v-list-item__content,
.v-list-item-title {
  font-weight: 500 !important;
  color: rgba(255, 255, 255, 1) !important;
}
</style>
