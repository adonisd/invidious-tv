import type { Type } from "typescript";

export interface HashTag {
  type: Type;
  title: string;
  url: string;
  channelCount: number;
  videoCount: number;
}
