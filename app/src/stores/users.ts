import { reactive } from "vue";
import { LocalUsers } from "@/helper/users";

const users = new LocalUsers();

export const userState = reactive({
  currentUser: users.getCurrentUser(),
  settings: users.getUserSettings(users.getCurrentUser() || "guest"),
  get token() {
    return this.settings?.token ?? null;
  },
  get isLoggedIn() {
    return !!this.token;
  },
  switchUser(name: string) {
    users.setCurrentUser(name);
    this.currentUser = name;
    this.settings = users.getUserSettings(name);
  },
  logout() {
    users.clearToken(this.currentUser || "guest");
    this.settings = users.getUserSettings(this.currentUser || "guest");
  },
});
