import { useEffect, useRef } from 'react';
import { useAppSelector } from '@redux/hooks';
import { blockPlayback } from '@services/audioPlayerService';

/**
 * Stops the radio the moment a session ends.
 *
 * Logout previously only cleared the session and navigated away — the audio kept playing
 * in the background, since playback lives in the native player rather than in any screen.
 * Watching auth state here catches every route out of a session, including ones that
 * don't go through the profile screen: a refresh token that no longer works signs the
 * user out from the API layer, and that must silence the stream too.
 *
 * Only a transition *out of* an authenticated session stops playback. Guests are allowed
 * to listen, so the initial resolve to "guest" on a cold start is deliberately ignored —
 * otherwise the app would kill audio for the very listeners it's meant to serve.
 */
const PlaybackAuthGuard: React.FC = () => {
  const status = useAppSelector((state) => state.auth.status);
  const wasAuthenticated = useRef(false);

  useEffect(() => {
    if (status === 'authenticated') {
      wasAuthenticated.current = true;
      return;
    }
    if (status === 'guest' && wasAuthenticated.current) {
      wasAuthenticated.current = false;
      void blockPlayback();
    }
  }, [status]);

  return null;
};

export default PlaybackAuthGuard;
