import { Convert, type Video } from "@/interfaces/videos";

export class InvidiousHelper {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/+$/, ""); // Remove trailing slashes
  }

  public async getPopular(): Promise<Video[]> {
    const url = `${this.baseUrl}/api/v1/popular`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch popular videos: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();
      const returnObject = Convert.toVideo(JSON.stringify(data));
      return returnObject;
    } catch (error) {
      console.error("Error fetching popular videos:", error);
      throw error;
    }
  }
}
