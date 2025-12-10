import type { Type } from "./shared";
import type { Video } from "./videos";

export interface Playlist {
  type: Type;
  title: string;
  playlistId: string;
  authorThumbnails: [];
  description: string;
  descriptionHtml: string;
  videoCount: number;
  updated: number;
  isListed: boolean;
  author: string;
  authorId: string;
  authorUrl: string;
  viewCount: number;
  videos: Video[];
}
