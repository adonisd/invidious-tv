import type { Playlist } from "@/interfaces/playlists";
import type { Video, VideoDetail } from "@/interfaces/videos";

// TODO implement paging (max_results and page)
// TODO make baseURL configurable
export const baseUrl = "https://invidious.toc.homes:7443";

export interface UserSettings {
  showShorts: boolean;
}

export class InvidiousHelper {
  public isLoggedin?: boolean;
  public username?: string;
  private baseUrl: string;

  constructor() {
    this.baseUrl = baseUrl;
  }

  /**
   * Get video details by ID
   * @param videoId - YouTube video ID
   * @param local - Whether to use local proxy for streams (fixes CORS issues)
   */
  async getVideoById(videoId: string, local?: boolean, withAuth?: boolean): Promise<VideoDetail> {
    try {
      const path = `/api/v1/videos/${videoId}${local ? "?local=true" : ""}`;
      const url = `${this.baseUrl}${path}`;
      console.log("Fetching from:", url);
      let response: Response;
      if (withAuth) {
        response = await this.authenticatedRequest(path);
      } else {
        response = await fetch(url);
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch video: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      // Process the DASH URL to ensure it uses HTTPS and includes local parameter
      if (data.dashUrl) {
        data.dashUrl = data.dashUrl.replace("http://", "https://");
        if (local && !data.dashUrl.includes("local=true")) {
          data.dashUrl += (data.dashUrl.includes("?") ? "&" : "?") + "local=true";
        }
      }
      return data;
    } catch (error) {
      console.error("Error fetching video:", error);
      throw error;
    }
  }

  /**
   * Get proxied video URL
   * @param videoId - YouTube video ID
   * @param itag - Format tag
   */
  getProxiedUrl(videoId: string, itag: string): string {
    return `${this.baseUrl}/latest_version?id=${videoId}&itag=${itag}&local=true`;
  }

  /**
   * Get trending videos
   * @param type - Type of trending (music, gaming, news, movies)
   */
  async getTrending(type?: string): Promise<Video[]> {
    try {
      const url = type
        ? `${this.baseUrl}/api/v1/trending?type=${type}`
        : `${this.baseUrl}/api/v1/trending`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch trending: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching trending:", error);
      throw error;
    }
  }

  async getPopular(type?: string): Promise<Video[]> {
    try {
      const url = type
        ? `${this.baseUrl}/api/v1/popular?type=${type}`
        : `${this.baseUrl}/api/v1/popular`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch popular: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching popular:", error);
      throw error;
    }
  }

  async getPersonalFeed(): Promise<Video[]> {
    try {
      const url = "/api/v1/auth/feed";
      const response = await this.authenticatedRequest(url);
      return response.notifications as Video[];
    } catch (error) {
      console.error("Error fetching personal feed:", error);
      throw error;
    }
  }

  async getPlaylists() {
    try {
      const url = "/api/v1/auth/playlists";
      const response = (await this.authenticatedRequest(url)) as Playlist[];
      return response;
    } catch (error) {
      console.error("Error fetching personal feed:", error);
      throw error;
    }
  }

  async getHistory() {
    try {
      const url = "/api/v1/auth/history";
      const response = await this.authenticatedRequest(url);
      console.log(response);
      return response as string[];
    } catch (error) {
      console.error("Error fetching personal feed:", error);
      throw error;
    }
  }

  /**
   * Initiate OAuth authorization flow
   * Opens the authorization URL in a new window/tab
   * @param callbackUrl - The URL to redirect to after authorization (default: window.location.origin + '/auth/callback')
   */
  authorize(callbackUrl?: string): void {
    const callback = callbackUrl || `${window.location.origin}/auth/callback`;
    const scopes = ":feed,:subscriptions*,:playlists*,:history*";
    const authUrl = `${this.baseUrl}/authorize_token?scopes=${scopes}&callback_url=${callback}`;
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
      this.username = username;
      localStorage.setItem("invidious_user", username);
    }
    if (token) {
      console.log(token);
      // Store token in localStorage for persistence
      localStorage.setItem("invidious_token", token);
      this.isLoggedin = true;
      return token;
    }

    return null;
  }

  /**
   * Get stored authentication token
   * @returns The stored token or null
   */
  getToken(): string | null {
    return localStorage.getItem("invidious_token");
  }

  getUser(): string | null {
    return localStorage.getItem("invidious_user");
  }
  getUserSettings(): UserSettings | undefined {
    const settingsString = localStorage.getItem("invidious_settings");
    if (settingsString) {
      const settings = JSON.parse(settingsString) as UserSettings;
      return settings;
    } else {
      return undefined;
    }
  }

  /**
   * Clear stored authentication token
   */
  clearToken(): void {
    localStorage.removeItem("invidious_token");
  }

  /**
   * Make authenticated API request
   * @param endpoint - API endpoint (e.g., '/api/v1/auth/feed')
   * @param options - Fetch options
   */
  async authenticatedRequest(endpoint: string, options: RequestInit = {}) {
    const token = this.getToken();
    if (!token) {
      throw new Error("Not authenticated. Please call authorize() first.");
    }
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        this.clearToken();
        throw new Error("Authentication expired. Please authorize again.");
      }
      throw new Error(`Request failed: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }
}
