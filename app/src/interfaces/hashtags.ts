import type { Type } from "./shared";

export interface HashTag {
  type: Type;
  title: string;
  url: string;
  channelCount: number;
  videoCount: number;
}
