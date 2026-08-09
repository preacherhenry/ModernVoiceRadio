# Modern Voice Radio — Mobile App

React Native + Expo + TypeScript. iOS and Android from one codebase.

See [`../docs/INSTALLATION.md`](../docs/INSTALLATION.md) for setup and
[`../docs/DEPLOYMENT.md`](../docs/DEPLOYMENT.md) for App Store / Play Store builds.

## Important: this app cannot run in Expo Go

`react-native-track-player` (background audio, lock-screen controls) and
`@react-native-firebase/messaging` (push notifications) are native modules. You need a **dev
client** build:

```bash
npx expo prebuild
npm run android   # or: npm run ios
```

After that first native build, `npm run start` gives normal fast-refresh development.

## Structure

```
src/
├── api/               axios instance with JWT refresh-token interceptor
├── components/
│   ├── common/          ScreenContainer, GlassCard, AppButton, AppTextInput, EmptyState, etc.
│   ├── cards/            ProgramCard, PresenterCard, PodcastCard, NewsCard, EpisodeRow
│   └── player/           MiniPlayer, WaveformAnimation
├── constants/            colors, spacing, typography, env config
├── navigation/            RootNavigator + per-tab stack navigators, typed route params
├── redux/
│   ├── store.ts            configureStore + redux-persist (settings only — not auth tokens)
│   ├── slices/              auth, player, settings (client state)
│   └── api/                 one RTK Query file per backend resource, all injected into baseApi
├── screens/                one folder per feature area, ~38 screens total
├── services/                audioPlayerService (react-native-track-player), pushNotificationService,
│                            chatSocketService, listenerPresenceService, downloadService
├── theme/                   MD3 theme (react-native-paper) + ThemeProvider (dark/light/system)
├── types/                    TypeScript interfaces mirroring backend DB columns
└── utils/                    formatters
```

## State management

- **Redux Toolkit** for client-only state: auth session, now-playing/player UI state, and user
  preferences (theme, language, audio quality, notification toggles — persisted via `redux-persist`
  to `AsyncStorage`; auth tokens are persisted separately via `expo-secure-store`, not Redux).
- **RTK Query** for all server data — every backend resource has a matching `redux/api/*Api.ts` file.
  No hand-written `useEffect` fetching anywhere in the app.

## Audio playback

`services/audioPlayerService.ts` wraps `react-native-track-player` for both live radio and podcast
episode playback: background playback, lock-screen/Bluetooth media controls, automatic reconnect on
stream drop, and a sleep timer. `services/downloadService.ts` handles offline podcast downloads via
`expo-file-system`.

## Realtime

`services/chatSocketService.ts` and `services/listenerPresenceService.ts` share a single Socket.io
connection to the backend (same default namespace, two rooms — see `backend/README.md`).

## Scripts

```bash
npm run start        # Metro bundler (requires a dev client already installed)
npm run android        # build + install dev client, then start
npm run ios              # macOS + Xcode only
npm run typecheck        # tsc --noEmit
npm run lint              # eslint
```
