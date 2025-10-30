import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions, ImageSourcePropType, Text } from 'react-native';
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
import type { Character, Language, Manifest, LifePhase } from '../core/types';
import { journeyMaps } from './journeyMaps';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const PANEL_WIDTH = screenWidth * 0.9;
const PANEL_HEIGHT = screenHeight * 0.4;
const MAP_WIDTH = PANEL_WIDTH * 3;

// --- MAIN ANIMATION COMPONENT ---

interface JourneyAnimationProps {
  onAnimationComplete: () => void;
  character: Character;
  images: Record<string, ImageSourcePropType>;
  lang: Language;
  manifest: Manifest;
}

export const JourneyAnimation: React.FC<JourneyAnimationProps> = ({ 
    onAnimationComplete, 
    character, 
    images, 
    lang, 
    manifest, 
}) => {
  const mapTranslateX = useSharedValue(PANEL_WIDTH);
  const nodeTranslateY = useSharedValue(0);
  const nodeScale = useSharedValue(1);
  const nodeOpacity = useSharedValue(1);

  const mapBackground = journeyMaps[character.phase] || '#d3d3d3';

  useEffect(() => {
    mapTranslateX.value = withTiming(-MAP_WIDTH, {
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
          runOnJS(onAnimationComplete)();
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

  return (
    <View style={styles.overlayContainer} pointerEvents="none">
      <View style={[styles.comicPanel, { backgroundColor: mapBackground }]}>
        {/* 
          WHEN YOU HAVE REAL MAPS, REPLACE THE CONTENT OF THIS VIEW 
          WITH YOUR <Image /> COMPONENT. FOR EXAMPLE:
          <Animated.View style={[styles.mapContainer, mapAnimatedStyle]}>
            <Image source={journeyMaps[character.phase]} style={{ width: MAP_WIDTH, height: PANEL_HEIGHT }} />
          </Animated.View>
        */}
        <Animated.View style={[styles.mapContainer, mapAnimatedStyle]}>
            <Text style={styles.mapLabel}>{character.phase.toUpperCase()}</Text>
            <View style={[styles.building, { left: 100, height: 100, backgroundColor: 'rgba(0,0,0,0.1)' }]} />
            <View style={[styles.building, { left: 300, height: 150, backgroundColor: 'rgba(0,0,0,0.15)' }]} />
            <View style={[styles.building, { left: 600, height: 120, backgroundColor: 'rgba(0,0,0,0.1)' }]} />
            <View style={[styles.building, { left: 900, height: 200, backgroundColor: 'rgba(0,0,0,0.15)' }]} />
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