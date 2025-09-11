import React, { useState, useRef, useCallback } from 'react';
import { View, StyleSheet, Dimensions, ImageSourcePropType, Text, ViewStyle } from 'react-native';
import {
  PanGestureHandler,
  PinchGestureHandler,
  PanGestureHandlerGestureEvent,
  PinchGestureHandlerGestureEvent,
} from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedGestureHandler,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { CharacterNode } from './CharacterNode';
import type { Character, GameState, Language, Manifest } from '../core/types';

// --- 1. TYPES AND INTERFACES ---

type NodeLayout = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isPlayerCharacter: boolean;
  parentsIds: string[] | [];
  partnerId: string | null;
  childrenIds: string[];
};

type LayoutsMap = Record<string, NodeLayout>;

interface FamilyTreeProps {
  gameState: GameState;
  lang: Language;
  manifest: Manifest;
  images: Record<string, ImageSourcePropType>;
  onSelectCharacter: (character: Character) => void;
}

interface FamilyTreeRecursiveNodeProps {
  character: Character;
  allMembers: Record<string, Character>;
  onNodeLayout: (layout: NodeLayout) => void;
  onSelectCharacter: (character: Character) => void;
  lang: Language;
  manifest: Manifest;
  images: Record<string, ImageSourcePropType>;
  processedIds: Set<string>; // Track processed characters to avoid re-rendering
}

// --- 2. HELPER CONSTANTS ---
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const HORIZONTAL_SPACING = 24;
const VERTICAL_SPACING = 48;

// --- 3. RECURSIVE NODE COMPONENT (Layout & Structure) ---

const FamilyTreeRecursiveNode: React.FC<FamilyTreeRecursiveNodeProps> = React.memo(
  ({ character, allMembers, onNodeLayout, onSelectCharacter, lang, manifest, images, processedIds }) => {
    const characterNodeRef = useRef<View>(null);
    const partnerNodeRef = useRef<View>(null);

    const handleCharacterLayout = () => {
      characterNodeRef.current?.measure((_x, _y, width, height, pageX, pageY) => {
        if (width > 0 && height > 0) {
          onNodeLayout({
            id: character.id,
            x: pageX,
            y: pageY,
            width,
            height,
            isPlayerCharacter: character.isPlayerCharacter,
            parentsIds: character.parentsIds,
            partnerId: character.partnerId,
            childrenIds: character.childrenIds,
          });
        }
      });
    };

    const handlePartnerLayout = (partner: Character) => () => {
      partnerNodeRef.current?.measure((_x, _y, width, height, pageX, pageY) => {
        if (width > 0 && height > 0) {
          onNodeLayout({
            id: partner.id,
            x: pageX,
            y: pageY,
            width,
            height,
            isPlayerCharacter: partner.isPlayerCharacter,
            parentsIds: partner.parentsIds,
            partnerId: partner.partnerId,
            childrenIds: partner.childrenIds,
          });
        }
      });
    };

    const partner = character.partnerId ? allMembers[character.partnerId] : null;
    const children = character.childrenIds.map(id => allMembers[id]).filter(Boolean);

    // Mark this character and partner as processed
    processedIds.add(character.id);
    if (partner) {
      processedIds.add(partner.id);
    }

    return (
      <View style={styles.nodeGroup}>
        {/* Current Generation (Couple or Single) */}
        <View style={styles.coupleContainer}>
          <View ref={characterNodeRef} onLayout={handleCharacterLayout} style={{ marginHorizontal: HORIZONTAL_SPACING / 2 }}>
            <CharacterNode
              character={character}
              onClick={() => onSelectCharacter(character)}
              lang={lang}
              manifest={manifest}
              images={images}
            />
          </View>
          {partner && (
            <View ref={partnerNodeRef} onLayout={handlePartnerLayout(partner)} style={{ marginHorizontal: HORIZONTAL_SPACING / 2 }}>
              <CharacterNode
                character={partner}
                onClick={() => onSelectCharacter(partner)}
                lang={lang}
                manifest={manifest}
                images={images}
              />
            </View>
          )}
        </View>

        {/* Children Generation */}
        {children.length > 0 && (
          <View style={[styles.childrenContainer, { paddingTop: VERTICAL_SPACING }]}>
            {children.map(child => {
              // Render child only if they haven't been processed as part of a couple
              if (processedIds.has(child.id)) return null;
              
              return (
                <FamilyTreeRecursiveNode
                  key={child.id}
                  character={child}
                  allMembers={allMembers}
                  onNodeLayout={onNodeLayout}
                  onSelectCharacter={onSelectCharacter}
                  lang={lang}
                  manifest={manifest}
                  images={images}
                  processedIds={processedIds}
                />
              );
            })}
          </View>
        )}
      </View>
    );
  }
);

// --- 4. MAIN FAMILY TREE COMPONENT (Interaction & Graphics) ---

type AnimatedContext = { startX: number; startY: number; startScale: number; };

export const FamilyTree: React.FC<FamilyTreeProps> = ({ gameState, lang, manifest, images, onSelectCharacter }) => {
  const [layouts, setLayouts] = useState<LayoutsMap>({});
  const [isTreeMeasured, setIsTreeMeasured] = useState(false);

  // Reanimated values for gestures
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const focalX = useSharedValue(0);
  const focalY = useSharedValue(0);

  const onNodeLayout = useCallback((layout: NodeLayout) => {
    setLayouts(prev => ({ ...prev, [layout.id]: layout }));
  }, []);

  const gestureHandler = useAnimatedGestureHandler<PanGestureHandlerGestureEvent, AnimatedContext>({
    onStart: (event, ctx) => {
        ctx.startX = translateX.value;
        ctx.startY = translateY.value;
    },
    onActive: (event, ctx) => {
        translateX.value = ctx.startX + event.translationX;
        translateY.value = ctx.startY + event.translationY;
    },
  });

  const pinchHandler = useAnimatedGestureHandler<PinchGestureHandlerGestureEvent, AnimatedContext>({
    onStart: (event, ctx) => {
        ctx.startScale = scale.value;
        focalX.value = event.focalX;
        focalY.value = event.focalY;
    },
    onActive: (event, ctx) => {
        const newScale = ctx.startScale * event.scale;
        scale.value = Math.max(0.5, Math.min(newScale, 3)); // Clamp scale
    },
  });

  const animatedStyle = useAnimatedStyle(() => ({
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
    ] as NonNullable<ViewStyle['transform']>,
  }));

  const renderConnectors = () => {
    const paths: React.ReactNode[] = [];
    const drawnConnections = new Set<string>();

    Object.values(layouts).forEach(nodeLayout => {
      const { id, x, y, width, height, partnerId, childrenIds } = nodeLayout;

      const startX = x + width / 2;
      const startY = y + height;

      // --- Draw Spouse Connector ---
      if (partnerId && layouts[partnerId]) {
        const partnerLayout = layouts[partnerId];
        const connectionId = [id, partnerId].sort().join('-');
        if (!drawnConnections.has(connectionId)) {
          const p1x = x + width;
          const p1y = y + height / 2;
          const p2x = partnerLayout.x;
          const p2y = partnerLayout.y + partnerLayout.height / 2;
          paths.push(<Path key={connectionId} d={`M${p1x},${p1y} L${p2x},${p2y}`} stroke="#64748b" strokeWidth="2" />);
          drawnConnections.add(connectionId);
        }
      }

      // --- Draw Children Connectors ---
      if (childrenIds.length > 0) {
         // Only draw from the parent with the smaller ID to avoid duplicates
         if (partnerId && id > partnerId) return;

        const parentMidY = y + height;
        let parentMidX = x + width / 2;

        if (partnerId && layouts[partnerId]) {
            parentMidX = (x + width + layouts[partnerId].x) / 2;
        }

        const junctionY = parentMidY + VERTICAL_SPACING / 2;
        
        // Vertical line down from parent(s)
        paths.push(<Path key={`${id}-v-down`} d={`M${parentMidX},${parentMidY} L${parentMidX},${junctionY}`} stroke="#64748b" strokeWidth="2" />);

        let minChildX = Infinity;
        let maxChildX = -Infinity;

        childrenIds.forEach(childId => {
            const childLayout = layouts[childId];
            if (childLayout) {
                const childMidX = childLayout.x + childLayout.width / 2;
                minChildX = Math.min(minChildX, childMidX);
                maxChildX = Math.max(maxChildX, childMidX);

                // Vertical line up from child
                const childTopY = childLayout.y;
                paths.push(<Path key={`${childId}-v-up`} d={`M${childMidX},${junctionY} L${childMidX},${childTopY}`} stroke="#64748b" strokeWidth="2" />);
            }
        });

        if (childrenIds.length > 1 && minChildX < maxChildX) {
            // Horizontal line connecting children
            paths.push(<Path key={`${id}-h-line`} d={`M${minChildX},${junctionY} L${maxChildX},${junctionY}`} stroke="#64748b" strokeWidth="2" />);
        }
      }
    });
    return paths;
  };

  // Find the root of the tree (characters with the lowest generation)
  const familyMembers = Object.values(gameState.familyMembers);
  let rootCharacters: Character[] = [];
  if (familyMembers.length > 0) {
    const minGeneration = Math.min(...familyMembers.map(c => c.generation));
    rootCharacters = familyMembers.filter(c => c.generation === minGeneration);
  }

  // Use a timeout to allow the layout to stabilize before drawing connectors
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
        if (Object.keys(layouts).length > 0) {
            setIsTreeMeasured(true);
        }
    }, 500); // Delay to ensure all nodes have measured
    return () => clearTimeout(timeoutId);
  }, [layouts]);

  if (rootCharacters.length === 0) {
    return <View style={styles.container}><Text>No root character found.</Text></View>;
  }

  const processedIds = new Set<string>();

  return (
    <PanGestureHandler onGestureEvent={gestureHandler}>
      <Animated.View style={styles.container}>
        <PinchGestureHandler onGestureEvent={pinchHandler}>
          <Animated.View style={styles.container}>
            <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
              {isTreeMeasured && renderConnectors()}
            </Svg>

            <Animated.View style={[styles.treeContainer, animatedStyle]}>
              {rootCharacters.map(rootChar => {
                if (processedIds.has(rootChar.id)) return null;
                return (
                  <FamilyTreeRecursiveNode
                    key={rootChar.id}
                    character={rootChar}
                    allMembers={gameState.familyMembers}
                    onNodeLayout={onNodeLayout}
                    onSelectCharacter={onSelectCharacter}
                    lang={lang}
                    manifest={manifest}
                    images={images}
                    processedIds={processedIds}
                  />
                );
              })}
            </Animated.View>
          </Animated.View>
        </PinchGestureHandler>
      </Animated.View>
    </PanGestureHandler>
  );
};

// --- 5. STYLES ---

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9', // slate-200 for contrast
  },
  treeContainer: {
    alignItems: 'center',
    padding: 50, // Large padding to allow panning around
  },
  nodeGroup: {
    alignItems: 'center',
  },
  coupleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  childrenContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
});