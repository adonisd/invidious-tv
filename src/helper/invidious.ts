import type { Channel } from "@/interfaces/channels";
import type { Playlist } from "@/interfaces/playlists";
import type { UserSubscription } from "@/interfaces/user";
import type { Video, VideoDetail } from "@/interfaces/videos";

// TODO implement paging (max_results and page)
// TODO make baseURL configurable
export const baseUrl = "https://invidious.toc.homes:7443";
// export const baseUrl = "https://tube.toc.homes";

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
    const url = type
      ? `${this.baseUrl}/api/v1/trending?type=${type}`
      : `${this.baseUrl}/api/v1/trending`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch trending: ${response.status}`);
    }
    return await response.json();
  }

  async getPopular(type?: string): Promise<Video[]> {
    const url = type
      ? `${this.baseUrl}/api/v1/popular?type=${type}`
      : `${this.baseUrl}/api/v1/popular`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch popular: ${response.status}`);
    }
    return await response.json();
  }

  async getChannelDetails(id: string): Promise<Channel> {
    const response = await fetch(`${this.baseUrl}/api/v1/channels/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch Channel details: ${response.status}`);
    }
    return response.json() as unknown as Channel;
  }

  async getChannelPlaylists(id: string): Promise<Playlist[]> {
    const response = await fetch(`${this.baseUrl}/api/v1/channels/${id}/playlists`);
    if (!response.ok) {
      throw new Error(`Failed to fetch Channel playlist details: ${response.status}`);
    }
    const returnObj = (await response.json()) as unknown as {
      playlists: Playlist[];
    };
    console.log(`Found ${returnObj.playlists.length} playlists`);
    return returnObj.playlists;
  }

  async getChannelPodcasts(id: string): Promise<Playlist[]> {
    const response = await fetch(`${this.baseUrl}/api/v1/channels/${id}/podcasts`);
    if (!response.ok) {
      throw new Error(`Failed to fetch Channel podcasts details: ${response.status}`);
    }
    const returnObj = (await response.json()) as unknown as {
      playlists: Playlist[];
    };
    console.log(`Found ${returnObj.playlists.length} playlists`);
    return returnObj.playlists;
  }

  async getChannelReleases(id: string): Promise<Playlist[]> {
    const response = await fetch(`${this.baseUrl}/api/v1/channels/${id}/releases`);
    if (!response.ok) {
      throw new Error(`Failed to fetch Channel releases details: ${response.status}`);
    }
    const returnObj = (await response.json()) as unknown as {
      playlists: Playlist[];
    };
    console.log(`Found ${returnObj.playlists.length} playlists`);
    return returnObj.playlists;
  }

  async getChannelShorts(id: string): Promise<Video[]> {
    const response = await fetch(`${this.baseUrl}/api/v1/channels/${id}/shorts`);
    if (!response.ok) {
      throw new Error(`Failed to fetch Channel shorts details: ${response.status}`);
    }
    const returnObj = (await response.json()) as unknown as {
      videos: Video[];
    };
    console.log(`Found ${returnObj.videos.length} videos`);
    return returnObj.videos;
  }

  async getChannelStreams(id: string): Promise<Video[]> {
    const response = await fetch(`${this.baseUrl}/api/v1/channels/${id}/streams`);
    if (!response.ok) {
      throw new Error(`Failed to fetch Channel streams details: ${response.status}`);
    }
    const returnObj = (await response.json()) as unknown as {
      videos: Video[];
    };
    console.log(`Found ${returnObj.videos.length} videos`);
    return returnObj.videos;
  }

  async getChannelVideos(id: string): Promise<Video[]> {
    const response = await fetch(`${this.baseUrl}/api/v1/channels/${id}/videos`);
    if (!response.ok) {
      throw new Error(`Failed to fetch Channel videos details: ${response.status}`);
    }
    const returnObj = (await response.json()) as unknown as {
      videos: Video[];
    };
    console.log(`Found ${returnObj.videos.length} videos`);
    return returnObj.videos;
  }

  async getPersonalFeed(): Promise<Video[]> {
    const url = "/api/v1/auth/feed";
    const response = await this.authenticatedRequest(url);
    return response.notifications as Video[];
  }

  async getPlaylists() {
    const url = "/api/v1/auth/playlists";
    const response = (await this.authenticatedRequest(url)) as Playlist[];
    return response;
  }

  async getHistory() {
    const url = "/api/v1/auth/history";
    const response = await this.authenticatedRequest(url);
    return response as string[];
  }

  async markVideoAsWatched(id: string) {
    const url = `/api/v1/auth/history/${id}`;
    await this.authenticatedRequest(url, { method: "POST" });
  }

  async deleteVideoFromHistory(id: string) {
    const url = `/api/v1/auth/history/${id}`;
    await this.authenticatedRequest(url, { method: "DELETE" });
  }

  async getUserSubscriptionList() {
    const url = "/api/v1/auth/subscriptions";
    const response = await this.authenticatedRequest(url);
    return response as UserSubscription[];
  }

  async subscribetToUcid(id: string) {
    const url = `/api/v1/auth/subscriptions/${id}`;
    const response = await this.authenticatedRequest(url, {
      method: "POST",
    });
    return response;
  }

  async removeSubscriptionToUcid(id: string) {
    const url = `/api/v1/auth/subscriptions/${id}`;
    const response = await this.authenticatedRequest(url, {
      method: "DELETE",
    });
    return response;
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
    try {
      return await response.json();
    } catch {
      return response;
    }
  }
}
