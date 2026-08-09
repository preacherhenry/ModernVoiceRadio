import { registerRootComponent } from 'expo';
import TrackPlayer from 'react-native-track-player';
import App from './App';

// Must be registered at the top level (outside React) per react-native-track-player's
// background-service contract — this keeps audio alive when the app is backgrounded/killed.
TrackPlayer.registerPlaybackService(() => require('./src/services/trackPlayerService').default);

registerRootComponent(App);
