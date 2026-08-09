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
  TrackPlayer.addEventListener(Event.RemoteDuck, async (event) => {
    // Another app (nav prompt, phone call) is ducking/interrupting audio.
    if (event.paused) {
      await TrackPlayer.pause();
    } else if (!event.permanent) {
      await TrackPlayer.play();
    }
  });
}
