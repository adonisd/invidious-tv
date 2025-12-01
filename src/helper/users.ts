import { InvidiousHelper } from "./invidious";
import { themeSelector, type ThemeName } from "./themes";

export interface UserSettings {
  token?: string;
  showShorts?: boolean;
  activeTheme: ThemeName;
}

export const defaultSettings: UserSettings = {
  showShorts: true,
  activeTheme: themeSelector.catppuccinMocha!,
};

export class LocalUsers {
  private STORAGE_USERS_LIST = "invidious_users_list";
  private STORAGE_CURRENT_USER = "invidious_current_user";
  private STORAGE_USER_SETTINGS_PREFIX = "invidious_user_settings_";

  constructor() {
    this.addGuestUser();
  }

  getUsersList(): string[] {
    const users = localStorage.getItem(this.STORAGE_USERS_LIST);
    return users ? JSON.parse(users) : [];
  }

  addUser(username: string): void {
    const users = this.getUsersList();
    if (!users.includes(username)) {
      users.push(username);
      localStorage.setItem(this.STORAGE_USERS_LIST, JSON.stringify(users));
    }
  }

  setCurrentUser(username: string): void {
    localStorage.setItem(this.STORAGE_CURRENT_USER, username);
  }

  getCurrentUser(): string | undefined {
    const settingsString = localStorage.getItem(this.STORAGE_CURRENT_USER);
    if (!settingsString) {
      return undefined;
    }
    return settingsString;
  }

  removeUser(username: string): void {
    let users = this.getUsersList();
    users = users.filter((user) => user !== username);
    localStorage.setItem(this.STORAGE_USERS_LIST, JSON.stringify(users));
    const currentUser = this.getCurrentUser();
    if (currentUser === username) {
      localStorage.removeItem(this.STORAGE_CURRENT_USER);
    }
  }

  clearAllUsers(): void {
    localStorage.removeItem(this.STORAGE_USERS_LIST);
    localStorage.removeItem(this.STORAGE_CURRENT_USER);
  }

  clearToken(username: string): void {
    const currentSettings = this.getUserSettings(username);
    if (currentSettings) {
      localStorage.setItem(
        this.STORAGE_USER_SETTINGS_PREFIX + username,
        JSON.stringify({ ...currentSettings, token: undefined }),
      );
    }
  }

  /**
   * Initiate OAuth authorization flow
   * Opens the authorization URL in a new window/tab
   * @param callbackUrl - The URL to redirect to after authorization (default: window.location.origin + '/auth/callback')
   */
  authorize(callbackUrl?: string): void {
    const invidious = new InvidiousHelper();
    const baseUrl = invidious.baseUrl;
    const callback = callbackUrl || `${window.location.origin}/invid-webos/#/callback`;
    const scopes = ":feed,:subscriptions*,:playlists*,:history*";
    const authUrl = `${baseUrl}/authorize_token?scopes=${scopes}&callback_url=${callback}`;
    window.location.href = authUrl;
  }

  /**
   * Parse the token from callback URL
   * Call this in your callback route component
   * @param url - The callback URL (default: window.location.href)
   * @returns The token or null if not found
   */
  parseAuthCallback(url?: string): string | null {
    const urlToParse = url || window.location.href;
    const urlObj = new URL(urlToParse);

    // Check for token in query params
    const token = urlObj.searchParams.get("token");
    const username = urlObj.searchParams.get("username");
    if (username) {
      this.addUser(username);
      this.setCurrentUser(username);
    }
    if (token) {
      // check if user settings exist, if not create default
      const existingSettings = this.getUserSettings(username || "default");
      if (!existingSettings) {
        localStorage.setItem(
          this.STORAGE_USER_SETTINGS_PREFIX + (username || "default"),
          JSON.stringify({ token, ...defaultSettings }),
        );
      } else {
        localStorage.setItem(
          this.STORAGE_USER_SETTINGS_PREFIX + (username || "default"),
          JSON.stringify({ token, ...existingSettings }),
        );
      }
      console.log(token);

      return token;
    }
    return null;
  }

  public getUserSettings(username: string): UserSettings | null {
    const settingsStr = localStorage.getItem(this.STORAGE_USER_SETTINGS_PREFIX + username);
    if (settingsStr) {
      return JSON.parse(settingsStr);
    }
    return null;
  }

  public toggleShowShorts(username: string): void {
    const settings = this.getUserSettings(username);
    localStorage.setItem(
      this.STORAGE_USER_SETTINGS_PREFIX + username,
      JSON.stringify({ ...settings, showShorts: !settings?.showShorts }),
    );
  }

  public changeTheme(username: string, theme: ThemeName): void {
    const settings = this.getUserSettings(username);
    localStorage.setItem(
      this.STORAGE_USER_SETTINGS_PREFIX + username,
      JSON.stringify({ ...settings, activeTheme: theme }),
    );
  }

  public setSettings(username: string, settings: UserSettings): void {
    localStorage.setItem(this.STORAGE_USER_SETTINGS_PREFIX + username, JSON.stringify(settings));
  }

  // add guest user without token
  public addGuestUser(): void {
    const guestUsername = "guest";
    // check if guest user already exists
    const users = this.getUsersList();
    if (users.includes(guestUsername)) {
      return;
    }
    this.addUser(guestUsername);
    this.setCurrentUser(guestUsername);
    localStorage.setItem(
      this.STORAGE_USER_SETTINGS_PREFIX + guestUsername,
      JSON.stringify(defaultSettings),
    );
  }
}
