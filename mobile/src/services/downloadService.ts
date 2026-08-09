import * as FileSystem from 'expo-file-system';
import type { PodcastEpisode } from '@apptypes/models';

const DOWNLOADS_DIR = `${FileSystem.documentDirectory}mvr-downloads/`;

async function ensureDirExists(): Promise<void> {
  const info = await FileSystem.getInfoAsync(DOWNLOADS_DIR);
  if (!info.exists) await FileSystem.makeDirectoryAsync(DOWNLOADS_DIR, { intermediates: true });
}

function localPathFor(episode: PodcastEpisode): string {
  const extension = episode.audio_url.split('.').pop()?.split('?')[0] || 'mp3';
  return `${DOWNLOADS_DIR}${episode.id}.${extension}`;
}

/** Downloads an episode's audio to on-device storage for offline playback. */
export async function downloadEpisode(
  episode: PodcastEpisode,
  onProgress?: (ratio: number) => void,
): Promise<{ localUri: string; fileSizeBytes: number }> {
  await ensureDirExists();
  const localUri = localPathFor(episode);

  const downloadResumable = FileSystem.createDownloadResumable(
    episode.audio_url,
    localUri,
    {},
    (progressEvent) => {
      if (onProgress && progressEvent.totalBytesExpectedToWrite > 0) {
        onProgress(progressEvent.totalBytesWritten / progressEvent.totalBytesExpectedToWrite);
      }
    },
  );

  const result = await downloadResumable.downloadAsync();
  if (!result) throw new Error('Download failed to complete');

  const info = await FileSystem.getInfoAsync(result.uri, { size: true });
  return { localUri: result.uri, fileSizeBytes: (info as { size?: number }).size ?? 0 };
}

export async function deleteDownloadedEpisode(episode: PodcastEpisode): Promise<void> {
  const localUri = localPathFor(episode);
  const info = await FileSystem.getInfoAsync(localUri);
  if (info.exists) await FileSystem.deleteAsync(localUri, { idempotent: true });
}

export async function isEpisodeDownloaded(episode: PodcastEpisode): Promise<boolean> {
  const info = await FileSystem.getInfoAsync(localPathFor(episode));
  return info.exists;
}

export function getLocalEpisodeUri(episode: PodcastEpisode): string {
  return localPathFor(episode);
}
