import React, { useEffect, useState } from 'react';
import {
  StyleSheet, Pressable, type StyleProp, type ViewStyle, type ImageStyle,
} from 'react-native';
import { Image } from 'expo-image';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import type { Advertisement } from '@apptypes/models';

const ROTATE_INTERVAL_MS = 3500;
const TRANSITION_MS = 450;

interface Props {
  ads: Advertisement[];
  onImpression: (id: string) => void;
  onPress: (ad: Advertisement) => void;
  style?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
}

/**
 * Rotates through all active ads one at a time (3.5s each) with a crossfade between
 * them. With a single ad it just renders it statically — no timer, no transition.
 */
const AdvertisementCarousel: React.FC<Props> = ({
  ads, onImpression, onPress, style, imageStyle,
}) => {
  const [index, setIndex] = useState(0);
  const adIds = ads.map((item) => item.id).join(',');

  useEffect(() => {
    setIndex(0);
  }, [adIds]);

  useEffect(() => {
    if (ads.length <= 1) return undefined;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % ads.length);
    }, ROTATE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [ads.length, adIds]);

  const currentAd = ads.length ? ads[index % ads.length] : null;

  useEffect(() => {
    if (currentAd) onImpression(currentAd.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentAd?.id]);

  if (!currentAd) return null;

  return (
    <Pressable style={style} onPress={() => onPress(currentAd)}>
      <Animated.View
        key={currentAd.id}
        entering={FadeIn.duration(TRANSITION_MS)}
        exiting={FadeOut.duration(TRANSITION_MS)}
      >
        <Image source={{ uri: currentAd.image_url }} style={imageStyle} contentFit="cover" />
      </Animated.View>
    </Pressable>
  );
};

export default AdvertisementCarousel;
