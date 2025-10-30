<template>
  <v-layout>
    <v-navigation-drawer permanent>
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
  </v-layout>
</template>
