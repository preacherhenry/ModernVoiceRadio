/** Mirrors backend/migrations column names (snake_case) for content resources; auth/session are camelCase. */

export type UUID = string;

export interface AuthUser {
  id: UUID;
  fullName: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  role: 'super_admin' | 'admin' | 'editor' | 'moderator' | 'listener';
  isVerified: boolean;
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

export interface Presenter {
  id: UUID;
  full_name: string;
  slug: string;
  photo_url: string | null;
  bio: string | null;
  role_title: string | null;
  email: string | null;
  phone: string | null;
  socials: Record<string, string>;
  is_featured: boolean;
  is_active: boolean;
  display_order: number;
}

export interface Program {
  id: UUID;
  title: string;
  slug: string;
  description: string | null;
  cover_image_url: string | null;
  category: string | null;
  is_active: boolean;
}

export interface ScheduleSlot {
  id: UUID;
  program_id: UUID;
  day_of_week: number;
  start_time: string;
  end_time: string;
  timezone: string;
  is_active: boolean;
  program_title?: string;
}

export interface PodcastCategory { id: UUID; name: string; slug: string; icon: string | null }
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
  play_count: number;
  published_at: string;
  is_published: boolean;
}

export interface NewsCategory { id: UUID; name: string; slug: string }
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
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  is_breaking: boolean;
  is_trending: boolean;
  is_published: boolean;
  view_count: number;
  published_at: string;
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

export interface Advertisement {
  id: UUID;
  title: string;
  image_url: string;
  target_url: string | null;
  placement: 'home_banner' | 'interstitial' | 'news_inline';
  start_date: string | null;
  end_date: string | null;
  impressions: number;
  clicks: number;
  is_active: boolean;
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
  created_at: string;
}

export interface NotificationItem {
  id: UUID;
  title: string;
  body: string;
  type: string;
  image_url: string | null;
  target_topic: string;
  sent_at: string | null;
  created_at: string;
}

export interface AudioStream {
  id: UUID;
  name: string;
  protocol: 'icecast' | 'shoutcast' | 'hls';
  url: string;
  bitrate_kbps: number;
  format: string;
  is_default: boolean;
  is_active: boolean;
  metadata_url: string | null;
}

export interface AdminUser {
  id: UUID;
  full_name: string;
  email: string;
  phone: string | null;
  is_active: boolean;
  is_verified: boolean;
  role_name: string;
  created_at: string;
}

export interface AnalyticsOverview {
  liveListeners: number;
  todaySessions: number;
  todayUniqueListeners: number;
  todayTotalDurationSeconds: number;
}

export interface CountryStat { country: string; count: number }
export interface CityStat { city: string; count: number }
export interface DeviceStat { device_type: string; count: number }
export interface TrendPoint {
  date: string;
  total_sessions: number;
  total_duration_seconds: number;
  unique_listeners: number;
  peak_concurrent: number;
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
  is_deleted: boolean;
  created_at: string;
}
