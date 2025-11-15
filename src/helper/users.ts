import { baseUrl } from "./invidious";

export interface UserSettings {
  token: string;
  showShorts?: boolean;
}

export class LocalUsers {
  private static STORAGE_USERS_LIST = "invidious_users_list";
  private static STORAGE_CURRENT_USER = "invidious_current_user";
  private static STORAGE_USER_SETTINGS_PREFIX = "invidious_user_settings_";

  constructor() {
    this.addGuestUser();
  }

  public static getUsersList(): string[] {
    const users = localStorage.getItem(this.STORAGE_USERS_LIST);
    return users ? JSON.parse(users) : [];
  }

  public static addUser(username: string): void {
    const users = this.getUsersList();
    if (!users.includes(username)) {
      users.push(username);
      localStorage.setItem(this.STORAGE_USERS_LIST, JSON.stringify(users));
    }
  }

  public static setCurrentUser(username: string): void {
    localStorage.setItem(this.STORAGE_CURRENT_USER, username);
  }

  public static getCurrentUser(): string | null {
    return localStorage.getItem(this.STORAGE_CURRENT_USER);
  }

  public static removeUser(username: string): void {
    let users = this.getUsersList();
    users = users.filter((user) => user !== username);
    localStorage.setItem(this.STORAGE_USERS_LIST, JSON.stringify(users));
    const currentUser = this.getCurrentUser();
    if (currentUser === username) {
      localStorage.removeItem(this.STORAGE_CURRENT_USER);
    }
  }

  public static clearAllUsers(): void {
    localStorage.removeItem(this.STORAGE_USERS_LIST);
    localStorage.removeItem(this.STORAGE_CURRENT_USER);
  }

  /**
   * Initiate OAuth authorization flow
   * Opens the authorization URL in a new window/tab
   * @param callbackUrl - The URL to redirect to after authorization (default: window.location.origin + '/auth/callback')
   */
  authorize(callbackUrl?: string): void {
    const callback = callbackUrl || `${window.location.origin}/callback`;
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
      LocalUsers.addUser(username);
      LocalUsers.setCurrentUser(username);
    }
    if (token) {
      console.log(token);
      localStorage.setItem(
        LocalUsers.STORAGE_USER_SETTINGS_PREFIX + (username || "default"),
        JSON.stringify({ token, showShorts: true }),
      );
      return token;
    }
    return null;
  }

  public getUserSettings(username: string): UserSettings | undefined {
    const settingsStr = localStorage.getItem(LocalUsers.STORAGE_USER_SETTINGS_PREFIX + username);
    if (settingsStr) {
      return JSON.parse(settingsStr);
    }
    return undefined;
  }

  public toggleShowShorts(username: string): void {
    const settings = this.getUserSettings(username);
    localStorage.setItem(
      LocalUsers.STORAGE_USER_SETTINGS_PREFIX + username,
      JSON.stringify(!settings),
    );
  }

  // add guest user without token
  public addGuestUser(): void {
    const guestUsername = "guest";
    // check if guest user already exists
    const users = LocalUsers.getUsersList();
    if (users.includes(guestUsername)) {
      return;
    }
    LocalUsers.addUser(guestUsername);
    LocalUsers.setCurrentUser(guestUsername);
    localStorage.setItem(
      LocalUsers.STORAGE_USER_SETTINGS_PREFIX + guestUsername,
      JSON.stringify({ showShorts: true }),
    );
  }
}
