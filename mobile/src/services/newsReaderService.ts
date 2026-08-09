import * as Speech from 'expo-speech';

interface ReadAloudCallbacks {
  onStart?: () => void;
  onDone?: () => void;
  onStopped?: () => void;
  onError?: () => void;
}

/** Reads a news article's title + body aloud via the device's native text-to-speech engine. */
export function readArticleAloud(title: string, content: string, callbacks: ReadAloudCallbacks = {}): void {
  const text = `${title}. ${content}`;
  Speech.speak(text, {
    onStart: callbacks.onStart,
    onDone: callbacks.onDone,
    onStopped: callbacks.onStopped,
    onError: callbacks.onError,
  });
}

export function stopReadingAloud(): void {
  void Speech.stop();
}

export function isReadingAloud(): Promise<boolean> {
  return Speech.isSpeakingAsync();
}
