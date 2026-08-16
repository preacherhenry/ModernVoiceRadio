import type { NavigatorScreenParams } from '@react-navigation/native';
import type { Advertisement } from '@apptypes/models';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: { email: string };
  // Reachable before signing in — the terms have to be readable while deciding whether
  // to accept them. Also registered in ProfileStack for signed-in users.
  Terms: undefined;
  PrivacyPolicy: undefined;
};

export type HomeStackParamList = {
  HomeMain: undefined;
  ProgramDetail: { idOrSlug: string };
  PresenterDetail: { idOrSlug: string };
  NewsMain: undefined;
  NewsDetail: { idOrSlug: string };
};

export type LiveStackParamList = {
  LiveRadio: undefined;
};

export type ScheduleStackParamList = {
  ScheduleMain: undefined;
  ProgramDetail: { idOrSlug: string };
  PresenterDetail: { idOrSlug: string };
};

export type PodcastsStackParamList = {
  PodcastsMain: undefined;
  PodcastDetail: { idOrSlug: string };
  PresenterDetail: { idOrSlug: string };
};

export type ProfileStackParamList = {
  ProfileMain: undefined;
  EditProfile: undefined;
  Favorites: undefined;
  ListeningHistory: undefined;
  Downloads: undefined;
  Settings: undefined;
  LanguageSettings: undefined;
  AudioQualitySettings: undefined;
  Equalizer: undefined;
  PrivacyPolicy: undefined;
  Terms: undefined;
  About: undefined;
  Notifications: undefined;
  Presenters: undefined;
  PresenterDetail: { idOrSlug: string };
  Gallery: undefined;
  SongRequest: undefined;
  Contact: undefined;
  LiveChat: undefined;
};

export type MainTabParamList = {
  HomeTab: NavigatorScreenParams<HomeStackParamList>;
  LiveTab: NavigatorScreenParams<LiveStackParamList>;
  ScheduleTab: NavigatorScreenParams<ScheduleStackParamList>;
  PodcastsTab: NavigatorScreenParams<PodcastsStackParamList>;
  ProfileTab: NavigatorScreenParams<ProfileStackParamList>;
};

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  NowPlaying: { source: 'live' | 'episode'; episodeId?: string } | undefined;
  Search: undefined;
  Interstitial: undefined;
  AdvertisementDetails: { ad: Advertisement };
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
