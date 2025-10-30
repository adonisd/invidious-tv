import type { Video, VideoDetail } from "@/interfaces/videos";

export class InvidiousHelper {
  private baseUrl: string;

  constructor(instanceUrl: string) {
    this.baseUrl = instanceUrl.replace(/\/$/, ""); // Remove trailing slash
  }

  /**
   * Get video details by ID
   * @param videoId - YouTube video ID
   * @param local - Whether to use local proxy for streams (fixes CORS issues)
   */
  async getVideoById(videoId: string, local: boolean = true): Promise<VideoDetail> {
    try {
      const url = `${this.baseUrl}/api/v1/videos/${videoId}${local ? "?local=true" : ""}`;
      console.log("Fetching from:", url);

      const response = await fetch(url);

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

  // /**
  //  * Search for videos
  //  * @param query - Search query
  //  * @param page - Page number (optional)
  //  */
  // async search(query: string, page: number = 1): Promise<any> {
  //   try {
  //     const url = `${this.baseUrl}/api/v1/search?q=${encodeURIComponent(query)}&page=${page}`;
  //     const response = await fetch(url);

  //     if (!response.ok) {
  //       throw new Error(`Search failed: ${response.status} ${response.statusText}`);
  //     }

  //     return await response.json();
  //   } catch (error) {
  //     console.error("Error searching:", error);
  //     throw error;
  //   }
  // }

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
}
