import TrackPlayer, { Event } from 'react-native-track-player';

/**
 * The "playback service" react-native-track-player requires to keep audio alive in the
 * background and to translate OS media-session events (lock screen, Bluetooth headset,
 * Android notification) into player commands. Registered once from index.ts via
 * `TrackPlayer.registerPlaybackService(() => require('./src/services/trackPlayerService').default)`.
 */
export default async function trackPlayerService() {
  TrackPlayer.addEventListener(Event.RemotePlay, () => TrackPlayer.play());
  TrackPlayer.addEventListener(Event.RemotePause, () => TrackPlayer.pause());
  TrackPlayer.addEventListener(Event.RemoteStop, () => TrackPlayer.stop());
  TrackPlayer.addEventListener(Event.RemoteSeek, ({ position }) => TrackPlayer.seekTo(position));
  TrackPlayer.addEventListener(Event.RemoteJumpForward, async ({ interval }) => {
    const position = await TrackPlayer.getProgress().then((p) => p.position);
    TrackPlayer.seekTo(position + interval);
  });
  TrackPlayer.addEventListener(Event.RemoteJumpBackward, async ({ interval }) => {
    const position = await TrackPlayer.getProgress().then((p) => p.position);
    TrackPlayer.seekTo(Math.max(0, position - interval));
  });
  // Audio interruptions (a call, a navigation prompt, another app taking focus) are
  // handled natively: setupPlayer runs with autoHandleInterruptions, which sets the
  // player's own handleAudioFocus. The duck event is still delivered to JS regardless,
  // so pausing and resuming here as well meant two handlers acting on one interruption —
  // and when they disagreed the stream could stay paused, with a 24/7 station having no
  // way back until the listener noticed and pressed play. Leave it to the native layer.
}
