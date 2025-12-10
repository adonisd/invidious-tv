import type { Type } from "./shared";

export interface Video {
  type: Type;
  title: string;
  videoId: string;
  videoThumbnails: VideoThumbnail[];
  lengthSeconds: number;
  author: string;
  authorId: string;
  authorUrl: string;
  published: number;
  publishedText: string;
  viewCount: number;
}

export interface VideoThumbnail {
  quality: Quality;
  url: string;
  width: number;
  height: number;
}

export enum Quality {
  Default = "default",
  End = "end",
  High = "high",
  Maxres = "maxres",
  Maxresdefault = "maxresdefault",
  Medium = "medium",
  Middle = "middle",
  Sddefault = "sddefault",
  Start = "start",
}

// Converts JSON strings to/from your types
export class Convert {
  public static toVideo(json: string): Video[] {
    return JSON.parse(json);
  }

  public static videoToJson(value: Video[]): string {
    return JSON.stringify(value);
  }
}

// --- Video Detail Types for /api/v1/videos/:id ---
export interface VideoDetail {
  type: string;
  title: string;
  videoId: string;
  videoThumbnails: VideoThumbnail[];
  storyboards: Storyboard[];
  description: string;
  descriptionHtml: string;
  published: number;
  publishedText: string;
  keywords: string[];
  viewCount: number;
  likeCount: number;
  dislikeCount: number;
  paid: boolean;
  premium: boolean;
  isFamilyFriendly: boolean;
  allowedRegions: string[];
  genre: string;
  genreUrl: string;
  author: string;
  authorId: string;
  authorUrl: string;
  authorThumbnails: AuthorThumbnail[];
  subCountText: string;
  lengthSeconds: number;
  allowRatings: boolean;
  rating: number;
  isListed: boolean;
  liveNow: boolean;
  isPostLiveDvr: boolean;
  isUpcoming: boolean;
  dashUrl: string;
  premiereTimestamp?: number;
  hlsUrl?: string;
  adaptiveFormats: AdaptiveFormat[];
  formatStreams: FormatStream[];
  captions: Caption[];
  musicTracks: MusicTrack[];
  recommendedVideos: RecommendedVideo[];
}

export interface Storyboard {
  url: string;
  templateUrl: string;
  width: number;
  height: number;
  count: number;
  interval: number;
  storyboardWidth: number;
  storyboardHeight: number;
  storyboardCount: number;
}

export interface AuthorThumbnail {
  url: string;
  width: number;
  height: number;
}

export interface AdaptiveFormat {
  index: string;
  bitrate: string;
  init: string;
  url: string;
  itag: string;
  type: string;
  clen: string;
  lmt: string;
  projectionType: string;
  container: string;
  encoding: string;
  qualityLabel?: string;
  resolution?: string;
  fps: number;
  size?: string;
  targetDurationSec?: number;
  maxDvrDurationSec?: number;
  audioQuality?: string;
  audioSampleRate?: string;
  audioChannels?: string;
  colorInfo?: string;
  captionTrack?: string;
}

export interface FormatStream {
  url: string;
  itag: string;
  type: string;
  quality: string;
  bitrate?: string;
  container: string;
  encoding: string;
  qualityLabel: string;
  resolution: string;
  size: string;
}

export interface Caption {
  label: string;
  language_code: string;
  url: string;
}

export interface MusicTrack {
  song: string;
  artist: string;
  album: string;
  license: string;
}

export interface RecommendedVideo {
  videoId: string;
  title: string;
  videoThumbnails: VideoThumbnail[];
  author: string;
  authorUrl: string;
  authorId?: string;
  authorVerified: boolean;
  authorThumbnails: AuthorThumbnail[];
  lengthSeconds: number;
  viewCount: number | string;
  viewCountText: string;
}
