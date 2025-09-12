import React, { useState, useMemo, useEffect } from 'react';
import { View, StyleSheet, Dimensions, ImageSourcePropType, Text, ViewStyle } from 'react-native';
import {
  PanGestureHandler,
  PinchGestureHandler,
  PanGestureHandlerGestureEvent,
  PinchGestureHandlerGestureEvent,
  State,
} from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedGestureHandler,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { CharacterNode } from './CharacterNode';
import type { Character, GameState, Language, Manifest } from '../core/types';

// --- 1. TYPES AND INTERFACES ---

type NodeLayout = {
  id: string;
  x: number;
  y: number;
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
  selectedCharacter: Character | null;
}

// --- 2. HELPER CONSTANTS ---
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const NODE_WIDTH = (screenWidth - 32) / 3 - 16;
const NODE_HEIGHT = NODE_WIDTH * 1.2; // Approximate height
const HORIZONTAL_SPACING = 20;
const VERTICAL_SPACING = 60;

// --- 3. LAYOUT CALCULATION LOGIC ---

function calculateTreeLayout(allMembers: Record<string, Character>): LayoutsMap {
  const layouts: LayoutsMap = {};
  if (Object.keys(allMembers).length === 0) return layouts;

  const membersByGeneration: Record<number, Character[]> = {};
  Object.values(allMembers).forEach(char => {
    if (!membersByGeneration[char.generation]) {
      membersByGeneration[char.generation] = [];
    }
    membersByGeneration[char.generation].push(char);
  });

  const processedIds = new Set<string>();
  let totalY = 0;

  Object.keys(membersByGeneration).sort((a, b) => Number(a) - Number(b)).forEach(genKey => {
    const generation = Number(genKey);
    const membersInGen = membersByGeneration[generation];
    let currentX = 0;
    const couples = new Map<string, Character[]>();

    // Group by couples
    membersInGen.forEach(char => {
      if (processedIds.has(char.id)) return;
      if (char.partnerId && allMembers[char.partnerId]?.generation === generation) {
        const partner = allMembers[char.partnerId];
        const coupleId = [char.id, partner.id].sort().join('-');
        if (!couples.has(coupleId)) {
          couples.set(coupleId, [char, partner]);
          processedIds.add(char.id);
          processedIds.add(partner.id);
        }
      } else {
        couples.set(char.id, [char]);
        processedIds.add(char.id);
      }
    });

    const generationWidth = couples.size * (NODE_WIDTH + HORIZONTAL_SPACING) - HORIZONTAL_SPACING;
    currentX = -generationWidth / 2;

    couples.forEach(members => {
      if (members.length === 2) {
        const [char1, char2] = members;
        layouts[char1.id] = { id: char1.id, x: currentX, y: totalY, ...char1 };
        currentX += NODE_WIDTH + HORIZONTAL_SPACING;
        layouts[char2.id] = { id: char2.id, x: currentX, y: totalY, ...char2 };
        currentX += NODE_WIDTH + HORIZONTAL_SPACING;
      } else {
        const [char] = members;
        layouts[char.id] = { id: char.id, x: currentX, y: totalY, ...char };
        currentX += NODE_WIDTH + HORIZONTAL_SPACING;
      }
    });

    totalY += NODE_HEIGHT + VERTICAL_SPACING;
  });

  return layouts;
}

// --- 4. MAIN FAMILY TREE COMPONENT (Interaction & Graphics) ---

type AnimatedContext = { startX: number; startY: number; startScale: number; };

export const FamilyTree: React.FC<FamilyTreeProps> = ({ gameState, lang, manifest, images, onSelectCharacter, selectedCharacter }) => {
  // State to trigger re-render for virtualization
  const [renderTrigger, setRenderTrigger] = useState(0);

  // Reanimated values for gestures
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const layouts = useMemo(() => calculateTreeLayout(gameState.familyMembers), [gameState.familyMembers]);

  // Center on selected character
  useEffect(() => {
    if (selectedCharacter && layouts[selectedCharacter.id]) {
      const layout = layouts[selectedCharacter.id];
      const targetScale = 1.2; // Zoom in a bit
      
      // Center of the screen
      const centerX = screenWidth / 2;
      const centerY = screenHeight / 3; // A bit higher than center

      // Calculate translation needed to bring the node to the center
      const newTranslateX = centerX - (layout.x + NODE_WIDTH / 2) * targetScale;
      const newTranslateY = centerY - (layout.y + NODE_HEIGHT / 2) * targetScale;

      scale.value = withTiming(targetScale, { duration: 500 });
      translateX.value = withTiming(newTranslateX, { duration: 500 });
      translateY.value = withTiming(newTranslateY, { duration: 500 }, () => {
        runOnJS(setRenderTrigger)(c => c + 1);
      });
    }
  }, [selectedCharacter, layouts, scale, translateX, translateY]);

  const triggerRender = () => {
    setRenderTrigger(c => c + 1);
  };

  const gestureHandler = useAnimatedGestureHandler<PanGestureHandlerGestureEvent, AnimatedContext>({
    onStart: (event, ctx) => {
        ctx.startX = translateX.value;
        ctx.startY = translateY.value;
    },
    onActive: (event, ctx) => {
        translateX.value = ctx.startX + event.translationX;
        translateY.value = ctx.startY + event.translationY;
    },
    onEnd: () => {
      runOnJS(triggerRender)();
    }
  });

  const pinchHandler = useAnimatedGestureHandler<PinchGestureHandlerGestureEvent, AnimatedContext>({
    onStart: (event, ctx) => {
        ctx.startScale = scale.value;
    },
    onActive: (event, ctx) => {
        const newScale = ctx.startScale * event.scale;
        scale.value = Math.max(0.5, Math.min(newScale, 3)); // Clamp scale
    },
    onEnd: () => {
      runOnJS(triggerRender)();
    }
  });

  const animatedStyle = useAnimatedStyle(() => ({
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
    ] as NonNullable<ViewStyle['transform']>,
  }));

  const renderConnectors = () => {
    const paths = [];
    const drawnConnections = new Set<string>();

    Object.values(layouts).forEach(nodeLayout => {
      const { id, x, y, partnerId, childrenIds } = nodeLayout;

      // --- Draw Spouse Connector ---
      if (partnerId && layouts[partnerId]) {
        const partnerLayout = layouts[partnerId];
        const connectionId = [id, partnerId].sort().join('-');
        if (!drawnConnections.has(connectionId)) {
          const p1x = x + NODE_WIDTH;
          const p1y = y + NODE_HEIGHT / 2;
          const p2x = partnerLayout.x;
          const p2y = partnerLayout.y + NODE_HEIGHT / 2;
          paths.push(<Path key={connectionId} d={`M ${p1x} ${p1y} H ${p2x}`} stroke="#a1a1aa" strokeWidth="2" />);
          drawnConnections.add(connectionId);
        }
      }

      // --- Draw Children Connectors ---
      if (childrenIds.length > 0) {
        if (partnerId && id > partnerId) return; // Draw only from one parent in a couple

        const parentMidY = y + NODE_HEIGHT;
        let parentMidX = x + NODE_WIDTH / 2;

        if (partnerId && layouts[partnerId]) {
            parentMidX = (x + NODE_WIDTH + layouts[partnerId].x) / 2;
        }

        const junctionY = parentMidY + VERTICAL_SPACING / 2;
        paths.push(<Path key={`${id}-v-down`} d={`M ${parentMidX} ${parentMidY} V ${junctionY}`} stroke="#a1a1aa" strokeWidth="2" />);

        let minChildX = Infinity;
        let maxChildX = -Infinity;

        childrenIds.forEach(childId => {
          const childLayout = layouts[childId];
          if (childLayout) {
            const childMidX = childLayout.x + NODE_WIDTH / 2;
            minChildX = Math.min(minChildX, childMidX);
            maxChildX = Math.max(maxChildX, childMidX);
            const childTopY = childLayout.y;
            paths.push(<Path key={`${childId}-v-up`} d={`M ${childMidX} ${junctionY} V ${childTopY}`} stroke="#a1a1aa" strokeWidth="2" />);
          }
        });

        if (childrenIds.length > 1 && minChildX < maxChildX) {
          paths.push(<Path key={`${id}-h-line`} d={`M ${minChildX} ${junctionY} H ${maxChildX}`} stroke="#a1a1aa" strokeWidth="2" />);
        }
      }
    });
    return paths;
  };

  const getVisibleNodes = () => {
    const visibleNodes = [];
    const currentScale = scale.value;
    const currentX = translateX.value;
    const currentY = translateY.value;

    // Calculate visible area in the coordinate system of the tree
    const viewPortX = -currentX / currentScale;
    const viewPortY = -currentY / currentScale;
    const viewPortWidth = screenWidth / currentScale;
    const viewPortHeight = screenHeight / currentScale;

    // Add a buffer to render nodes slightly off-screen
    const bufferX = viewPortWidth * 0.5;
    const bufferY = viewPortHeight * 0.5;

    for (const id in layouts) {
      const node = layouts[id];
      const nodeRight = node.x + NODE_WIDTH;
      const nodeBottom = node.y + NODE_HEIGHT;

      if (
        nodeRight >= viewPortX - bufferX &&
        node.x <= viewPortX + viewPortWidth + bufferX &&
        nodeBottom >= viewPortY - bufferY &&
        node.y <= viewPortY + viewPortHeight + bufferY
      ) {
        visibleNodes.push(node);
      }
    }
    return visibleNodes;
  };

  const visibleNodes = getVisibleNodes();

  if (Object.keys(layouts).length === 0) {
    return <View style={styles.container}><Text>No family members to display.</Text></View>;
  }

  return (
    <PanGestureHandler onGestureEvent={gestureHandler}>
      <Animated.View style={styles.container}>
        <PinchGestureHandler onGestureEvent={pinchHandler}>
          <Animated.View style={styles.container}>
            <Animated.View style={[styles.treeContainer, animatedStyle]}>
              <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
                {renderConnectors()}
              </Svg>
              {visibleNodes.map(nodeLayout => {
                const character = gameState.familyMembers[nodeLayout.id];
                if (!character) return null;
                return (
                  <View
                    key={character.id}
                    style={{
                      position: 'absolute',
                      left: nodeLayout.x,
                      top: nodeLayout.y,
                    }}
                  >
                    <CharacterNode
                      character={character}
                      onClick={() => onSelectCharacter(character)}
                      lang={lang}
                      manifest={manifest}
                      images={images}
                    />
                  </View>
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
    backgroundColor: '#f1f5f9', // slate-100 for contrast
    overflow: 'hidden',
  },
  treeContainer: {
    width: 1, // The container itself is just a reference point
    height: 1,
  },
});
                  