/**
 * Shared domain types. Content resources (presenters, programs, podcasts, news, etc.)
 * mirror the PostgreSQL column names (snake_case) since the API returns raw rows for
 * those endpoints. Auth/session payloads are camelCase because authService explicitly
 * maps them before responding — see backend/src/services/authService.js#toPublicUser.
 */

export type UUID = string;
export type ISODateString = string;

export interface AuthUser {
  id: UUID;
  fullName: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  role: 'super_admin' | 'admin' | 'editor' | 'moderator' | 'listener';
  isVerified: boolean;
  preferredLanguage: string;
  themePreference: 'dark' | 'light' | 'system';
}

export interface Presenter {
  id: UUID;
  full_name: string;
  slug: string;
  photo_url: string | null;
  bio: string | null;
  role_title: string | null;
  email: string | null;
  phone: string | null;
  socials: { instagram?: string; twitter?: string; facebook?: string; tiktok?: string };
  is_featured: boolean;
  is_active: boolean;
  programs?: Program[];
  podcasts?: Podcast[];
}

export interface Program {
  id: UUID;
  title: string;
  slug: string;
  description: string | null;
  cover_image_url: string | null;
  category: string | null;
  is_active: boolean;
  presenters?: Presenter[];
  schedule?: ScheduleSlot[];
}

export interface ScheduleSlot {
  id: UUID;
  program_id: UUID;
  day_of_week: number; // 0=Sunday..6=Saturday
  start_time: string; // "HH:mm:ss"
  end_time: string;
  timezone: string;
  program_title?: string;
  program_slug?: string;
  cover_image_url?: string | null;
  presenter_names?: string;
}

export interface PodcastCategory {
  id: UUID;
  name: string;
  slug: string;
  icon: string | null;
}

export interface Podcast {
  id: UUID;
  category_id: UUID | null;
  presenter_id: UUID | null;
  title: string;
  slug: string;
  description: string | null;
  cover_image_url: string | null;
  is_featured: boolean;
  is_active: boolean;
  episodes?: PodcastEpisode[];
}

export interface PodcastEpisode {
  id: UUID;
  podcast_id: UUID;
  title: string;
  description: string | null;
  audio_url: string;
  cover_image_url: string | null;
  duration_seconds: number;
  episode_number: number | null;
  season_number: number | null;
  play_count: number;
  published_at: ISODateString;
  podcast_title?: string;
  podcast_cover?: string | null;
  progress_seconds?: number;
  is_completed?: boolean;
}

export interface NewsCategory {
  id: UUID;
  name: string;
  slug: string;
}

export interface NewsMediaItem {
  id: UUID;
  news_id: UUID;
  media_type: 'image' | 'video';
  media_url: string;
  display_order: number;
}

export interface NewsArticle {
  id: UUID;
  category_id: UUID | null;
  author_id: UUID | null;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  is_breaking: boolean;
  is_trending: boolean;
  view_count: number;
  published_at: ISODateString;
  /** Only present on the single-article detail response, not the list response. */
  media?: NewsMediaItem[];
}

export interface GalleryItem {
  id: UUID;
  title: string | null;
  media_type: 'photo' | 'video';
  media_url: string;
  thumbnail_url: string | null;
  event_name: string | null;
  event_date: string | null;
}

export interface NotificationItem {
  id: UUID;
  title: string;
  body: string;
  type: 'breaking_news' | 'live_show' | 'new_podcast' | 'announcement';
  image_url: string | null;
  data: Record<string, unknown>;
  created_at: ISODateString;
  is_read?: boolean;
}

export interface Advertisement {
  id: UUID;
  title: string;
  image_url: string;
  target_url: string | null;
  placement: 'home_banner' | 'interstitial' | 'news_inline';
  display_order: number;
  description: string | null;
  contact_phone: string | null;
  contact_whatsapp: string | null;
  contact_email: string | null;
  contact_address: string | null;
}

export interface SongRequest {
  id: UUID;
  requester_name: string;
  song_title: string;
  artist_name: string;
  message: string | null;
  status: 'pending' | 'approved' | 'played' | 'rejected';
  created_at: ISODateString;
}

export type FavoriteEntityType = 'podcast' | 'episode' | 'news' | 'program' | 'presenter';

export interface Favorite {
  id: UUID;
  entity_type: FavoriteEntityType;
  entity_id: UUID;
  created_at: ISODateString;
}

export interface DownloadItem {
  id: UUID;
  episode_id: UUID;
  local_uri: string | null;
  file_size_bytes: number | null;
  status: 'queued' | 'downloading' | 'completed' | 'failed';
  episode_title?: string;
  podcast_title?: string;
  cover_image_url?: string | null;
}

export interface AudioStream {
  id: UUID;
  name: string;
  protocol: 'icecast' | 'shoutcast' | 'hls';
  url: string;
  bitrate_kbps: number;
  format: string;
  is_default: boolean;
}

export interface NowPlayingInfo {
  songTitle: string | null;
  artist: string | null;
  listeners: number | null;
  isLive: boolean;
}

export interface ContactInformation {
  station_name: string;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  facebook_url: string | null;
  instagram_url: string | null;
  tiktok_url: string | null;
  youtube_url: string | null;
  twitter_url: string | null;
  website_url: string | null;
}

export interface ChatMessage {
  id: UUID;
  user_id: UUID | null;
  display_name: string;
  avatar_url: string | null;
  message: string;
  reply_to_id: UUID | null;
  is_pinned: boolean;
  is_announcement: boolean;
  created_at: ISODateString;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: PaginationMeta;
}
