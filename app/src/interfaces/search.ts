type SearchSort = "relevance" | "rating" | "date" | "views";
type SearchDate = "hour" | "today" | "week" | "month" | "year";
type SearchDuration = "short" | "long" | "medium";
type SearchType = "video" | "playlist" | "channel" | "movie" | "show" | "all";
type SearchFeature =
  | "hd"
  | "subtitles"
  | "creative_commons"
  | "3d"
  | "live"
  | "purchased"
  | "4k"
  | "360"
  | "location"
  | "hdr"
  | "vr180";

// Search parameters interface
export interface SearchParams {
  query: string; // Required
  page?: number;
  sort?: SearchSort;
  date?: SearchDate;
  duration?: SearchDuration;
  type?: SearchType;
  features?: SearchFeature | SearchFeature[];
  region?: string; // ISO 3166 country code
}
