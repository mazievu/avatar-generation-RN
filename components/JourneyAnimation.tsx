import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, ImageSourcePropType, Text, Image } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withRepeat,
  withDelay,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { CharacterNode } from './CharacterNode';
import type { Character, Language, Manifest, PurchasedAsset, GameEvent } from '../core/types';
import { getJourneyMapImage } from './journeyMapLogic';

const MAP_WIDTH = 2942;
const PANEL_HEIGHT = 650;
const PANEL_WIDTH = MAP_WIDTH / 3;

// --- MAIN ANIMATION COMPONENT ---

interface JourneyAnimationProps {
  onAnimationComplete: () => void;
  character: Character;
  images: Record<string, ImageSourcePropType>;
  lang: Language;
  manifest: Manifest;
  purchasedAssets: Record<string, PurchasedAsset>;
  event: GameEvent | null;
}

export const JourneyAnimation: React.FC<JourneyAnimationProps> = ({ 
    onAnimationComplete, 
    character, 
    images, 
    lang, 
    manifest, 
    purchasedAssets,
    event,
}) => {
  const mapTranslateX = useSharedValue(0);
  const nodeTranslateY = useSharedValue(0);
  const nodeScale = useSharedValue(1);
  const nodeOpacity = useSharedValue(1);

  const onAnimationCompleteRef = useRef(onAnimationComplete);
  onAnimationCompleteRef.current = onAnimationComplete;

  const mapBackground = getJourneyMapImage(character, purchasedAssets, event);

  useEffect(() => {
    mapTranslateX.value = withTiming(PANEL_WIDTH - MAP_WIDTH, {
      duration: 2000,
      easing: Easing.linear,
    });

    nodeTranslateY.value = withRepeat(
      withSequence(
        withTiming(-15, { duration: 400, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 400, easing: Easing.inOut(Easing.ease) }),
        withTiming(-15, { duration: 400, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 400, easing: Easing.inOut(Easing.ease) })
      ),
      2,
      false
    );

    nodeScale.value = withDelay(1600, withTiming(0, { duration: 400, easing: Easing.in(Easing.quad) }));
    nodeOpacity.value = withDelay(1600, withTiming(0, { duration: 400, easing: Easing.in(Easing.quad) }, (finished) => {
        if (finished) {
          runOnJS(onAnimationCompleteRef.current)();
        }
    }));

  }, []);

  const mapAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: mapTranslateX.value }],
  }));

  const nodeAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: nodeTranslateY.value },
      { scale: nodeScale.value },
    ] as const,
    opacity: nodeOpacity.value,
  }));

  const isMapImage = typeof mapBackground !== 'string';

  return (
    <View style={styles.overlayContainer} pointerEvents="none">
      <View style={[styles.comicPanel, { backgroundColor: isMapImage ? '#fff' : mapBackground }]}>
        <Animated.View style={[styles.mapContainer, mapAnimatedStyle]}>
            {isMapImage ? (
              <Image source={mapBackground} style={{ width: MAP_WIDTH, height: PANEL_HEIGHT }} resizeMode="contain" />
            ) : (
              <Text style={styles.mapLabel}>{character.phase.toUpperCase()}</Text>
            )}
        </Animated.View>

        <Animated.View style={[styles.nodeContainer, nodeAnimatedStyle]}>
          <CharacterNode 
              character={character}
              images={images}
              lang={lang}
              manifest={manifest}
              onClick={() => {}} // Non-interactive
          />
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  comicPanel: {
    width: PANEL_WIDTH,
    height: PANEL_HEIGHT,
    borderWidth: 4,
    borderColor: 'black',
    overflow: 'hidden',
    position: 'relative',
  },
  mapContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    width: MAP_WIDTH,
  },
  nodeContainer: {
    position: 'absolute',
    left: PANEL_WIDTH / 3 - 50, // Positioned 1/3 from the left of the panel
    bottom: 10, // Place the character near the bottom of the panel
    width: 100,
    height: 120,
  },
  mapLabel: {
    position: 'absolute',
    top: 10,
    left: 10,
    fontSize: 20,
    fontWeight: 'bold',
    color: 'rgba(0,0,0,0.2)',
  },
  building: {
      position: 'absolute',
      bottom: 0,
      width: 50,
  }
});