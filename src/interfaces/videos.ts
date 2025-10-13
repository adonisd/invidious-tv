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

export enum Type {
  ShortVideo = "shortVideo",
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
