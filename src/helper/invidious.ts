import type { Channel } from "@/interfaces/channels";
import type { HashTag } from "@/interfaces/hashtags";
import type { Playlist } from "@/interfaces/playlists";
import type { SearchParams } from "@/interfaces/search";
import type { UserSubscription } from "@/interfaces/user";
import type { Video, VideoDetail } from "@/interfaces/videos";
import { LocalUsers } from "./users";

// TODO implement paging (max_results and page)
// TODO make baseURL configurable
export const baseUrl = "https://invidious.toc.homes:7443";
// export const baseUrl = "https://tube.toc.homes";

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
   * @param type - Type of trending (type: "music", "gaming", "movies", "default")
   */
  async getTrending(type?: "music" | "gaming" | "movies" | "default"): Promise<Video[]> {
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

  async getPersonalFeed(max_results?: number, page?: number): Promise<Video[]> {
    const params: Record<string, string> = {};
    if (typeof max_results === "number") params.max_results = String(max_results);
    if (typeof page === "number") params.page = String(page);

    const query = Object.keys(params).length ? `?${new URLSearchParams(params).toString()}` : "";
    console.log(`QUERY: ${query}`);
    const url = `/api/v1/auth/feed${query}`;
    const response = await this.authenticatedRequest(url);
    // response should be an object containing `videos`

    const returnObj = response as { videos: Video[]; notifications: Video[] };
    console.log(`Number of notifications: ${returnObj.notifications.length}`);
    console.log(`Number of videos: ${returnObj.videos.length}`);
    return [...returnObj.notifications, ...returnObj.videos] as Video[];
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

  async search(searchParams: SearchParams) {
    const params = new URLSearchParams();

    // Add required parameter q
    params.append("q", searchParams.query);

    // Add optional parameters if they exist
    if (searchParams.page !== undefined) {
      params.append("page", String(searchParams.page));
    }

    if (searchParams.sort) {
      params.append("sort", searchParams.sort);
    }

    if (searchParams.date) {
      params.append("date", searchParams.date);
    }

    if (searchParams.duration) {
      params.append("duration", searchParams.duration);
    }

    if (searchParams.type) {
      params.append("type", searchParams.type);
    }

    if (searchParams.features) {
      // Handle both single feature and array of features
      const featuresStr = Array.isArray(searchParams.features)
        ? searchParams.features.join(",")
        : searchParams.features;
      params.append("features", featuresStr);
    }

    if (searchParams.region) {
      params.append("region", searchParams.region);
    }

    const url = `api/v1/search?${params.toString()}`;
    const response = await fetch(`${this.baseUrl}/${url}`);
    return (await response.json()) as (Video | Playlist | Channel | HashTag)[];
  }

  async getSearchSuggestions(query: string) {
    const params = new URLSearchParams();
    params.append("q", query);
    const url = `api/v1/search?${params.toString()}`;
    const response = await fetch(`${this.baseUrl}/${url}`);
    return (await response.json()) as (Video | Playlist | Channel | HashTag)[];
  }

  /**
   * Make authenticated API request
   * @param endpoint - API endpoint (e.g., '/api/v1/auth/feed')
   * @param options - Fetch options
   */
  async authenticatedRequest(endpoint: string, options: RequestInit = {}) {
    const localUsers = new LocalUsers();
    const currentUser = localUsers.getCurrentUser();
    if (currentUser === "guest" || !currentUser) {
      throw new Error("Not authenticated. Please call authorize() first.");
    }
    const settings = localUsers.getUserSettings(currentUser);
    if (!settings) {
      throw new Error("Authenticated but no settings?");
    }
    const token = settings.token;
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
        localUsers.clearToken(currentUser);
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
