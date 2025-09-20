import React, { useState, useMemo, useEffect, useRef } from 'react';
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
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { CharacterNode } from './CharacterNode';
import type { Character, GameState, Language, Manifest } from '../core/types';
import IncomeAnimation from './IncomeAnimation';

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
  characterIdToCenterOnEvent: string | null; // NEW PROP: ID of character to center due to an event
  onCharacterCenteredOnEvent: () => void; // NEW PROP: Callback when event character centering is done
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
        // === SỬA LỖI LOGIC: Gán thuộc tính tường minh thay vì dùng spread operator ===
        layouts[char1.id] = {
            id: char1.id,
            x: currentX,
            y: totalY,
            isPlayerCharacter: char1.isPlayerCharacter,
            parentsIds: char1.parentsIds || [],
            partnerId: char1.partnerId || null,
            childrenIds: char1.childrenIds || [],
        };
        currentX += NODE_WIDTH + HORIZONTAL_SPACING;
        layouts[char2.id] = {
            id: char2.id,
            x: currentX,
            y: totalY,
            isPlayerCharacter: char2.isPlayerCharacter,
            parentsIds: char2.parentsIds || [],
            partnerId: char2.partnerId || null,
            childrenIds: char2.childrenIds || [],
        };
        currentX += NODE_WIDTH + HORIZONTAL_SPACING;
      } else {
        const [char] = members;
        // === SỬA LỖI LOGIC: Gán thuộc tính tường minh thay vì dùng spread operator ===
        layouts[char.id] = {
            id: char.id,
            x: currentX,
            y: totalY,
            isPlayerCharacter: char.isPlayerCharacter,
            parentsIds: char.parentsIds || [],
            partnerId: char.partnerId || null,
            childrenIds: char.childrenIds || [],
        };
        currentX += NODE_WIDTH + HORIZONTAL_SPACING;
      }
    });

    totalY += NODE_HEIGHT + VERTICAL_SPACING;
  });

  // Post-processing to center parents over children
  Object.values(allMembers).forEach(parentChar => {
    const parentLayout = layouts[parentChar.id];
    if (!parentLayout || parentChar.childrenIds.length === 0) return;

    const childrenXPositions: number[] = [];
    parentChar.childrenIds.forEach(childId => {
      const childLayout = layouts[childId];
      if (childLayout) {
        childrenXPositions.push(childLayout.x + NODE_WIDTH / 2); // Get center X of each child
      }
    });

    if (childrenXPositions.length > 0) {
      const minChildXCenter = Math.min(...childrenXPositions);
      const maxChildXCenter = Math.max(...childrenXPositions);
      const desiredParentXCenter = (minChildXCenter + maxChildXCenter) / 2;

      let currentParentXCenter;
      if (parentChar.partnerId && layouts[parentChar.partnerId]) {
        // If it's a couple, find the midpoint between the two parents
        const partnerLayout = layouts[parentChar.partnerId];
        currentParentXCenter = (parentLayout.x + NODE_WIDTH / 2 + partnerLayout.x + NODE_WIDTH / 2) / 2;
      } else {
        // Single parent
        currentParentXCenter = parentLayout.x + NODE_WIDTH / 2;
      }

      // Calculate the offset needed
      const offsetX = desiredParentXCenter - currentParentXCenter;

      // Apply the offset to the parent(s)
      parentLayout.x += offsetX;
      if (parentChar.partnerId && layouts[parentChar.partnerId]) {
        layouts[parentChar.partnerId].x += offsetX;
      }
    }
  });

  // Final pass: Ensure all characters in allMembers have a layout
  Object.values(allMembers).forEach(char => {
    if (!layouts[char.id]) {
      layouts[char.id] = {
        id: char.id,
        x: 0, // Default X
        y: 0, // Default Y
        isPlayerCharacter: char.isPlayerCharacter,
        parentsIds: char.parentsIds || [],
        partnerId: char.partnerId || null,
        childrenIds: char.childrenIds || [],
      };
    }
  });

  return layouts;
}

// --- 4. MAIN FAMILY TREE COMPONENT (Interaction & Graphics) ---

type AnimatedContext = { startX: number; startY: number; startScale: number; };

export const FamilyTree: React.FC<FamilyTreeProps> = ({ gameState, lang, manifest, images, onSelectCharacter, selectedCharacter, characterIdToCenterOnEvent, onCharacterCenteredOnEvent }) => {
  const hasCenteredInitially = useRef(false);

  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const [renderScale, setRenderScale] = useState(1);
  const [renderTranslateX, setRenderTranslateX] = useState(0);
  const [renderTranslateY, setRenderTranslateY] = useState(0);

  const layouts = useMemo(() => calculateTreeLayout(gameState.familyMembers), [gameState.familyMembers]);

  useEffect(() => {
    let characterToCenter: Character | null = null;
    if (selectedCharacter && layouts[selectedCharacter.id]) {
      characterToCenter = selectedCharacter;
    }
    else if (characterIdToCenterOnEvent && gameState.familyMembers[characterIdToCenterOnEvent] && layouts[characterIdToCenterOnEvent]) {
      characterToCenter = gameState.familyMembers[characterIdToCenterOnEvent];
    }
    else if (!hasCenteredInitially.current && Object.keys(layouts).length > 0) {
      const playerCharacter = Object.values(gameState.familyMembers).find(char => char.isPlayerCharacter);
      if (playerCharacter && layouts[playerCharacter.id]) {
        characterToCenter = playerCharacter;
        hasCenteredInitially.current = true;
      }
    }

    if (characterToCenter && layouts[characterToCenter.id]) {
      const layout = layouts[characterToCenter.id];
      const targetScale = 1.2;
      const centerX = screenWidth / 2;
      const centerY = screenHeight / 2;

      const newTranslateX = centerX - (layout.x + NODE_WIDTH / 2) * targetScale;
      const newTranslateY = centerY - (layout.y + NODE_HEIGHT / 2) * targetScale;

      scale.value = withTiming(targetScale, { duration: 500 });
      translateX.value = withTiming(newTranslateX, { duration: 500 });
      translateY.value = withTiming(newTranslateY, { duration: 500 }, (finished) => {
        if (finished) {
          runOnJS(setRenderScale)(targetScale);
          runOnJS(setRenderTranslateX)(newTranslateX);
          runOnJS(setRenderTranslateY)(newTranslateY);
          if (characterIdToCenterOnEvent && onCharacterCenteredOnEvent) {
            runOnJS(onCharacterCenteredOnEvent)();
          }
        }
      });
    }
  }, [selectedCharacter, characterIdToCenterOnEvent, layouts, gameState.familyMembers, onCharacterCenteredOnEvent, scale, translateX, translateY]);

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
      runOnJS(setRenderTranslateX)(translateX.value);
      runOnJS(setRenderTranslateY)(translateY.value);
    }
  });

  const pinchHandler = useAnimatedGestureHandler<PinchGestureHandlerGestureEvent, AnimatedContext>({
    onStart: (event, ctx) => {
        ctx.startScale = scale.value;
    },
    onActive: (event, ctx) => {
        const newScale = ctx.startScale * event.scale;
        scale.value = Math.max(0.5, Math.min(newScale, 3));
    },
    onEnd: () => {
      runOnJS(setRenderScale)(scale.value);
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
      if (partnerId && layouts[partnerId]) {
        const partnerLayout = layouts[partnerId];
        const connectionId = [id, partnerId].sort().join('-');
        if (!drawnConnections.has(connectionId)) {
          const p1x = x + NODE_WIDTH;
          const p1y = y + NODE_HEIGHT / 2;
          const p2x = partnerLayout.x;
          paths.push(<Path key={connectionId} d={`M ${p1x} ${p1y} H ${p2x}`} stroke="#a1a1aa" strokeWidth="2" />);
          drawnConnections.add(connectionId);
        }
      }
      if (childrenIds.length > 0) {
        const isPrimaryParent = !partnerId || id < partnerId;
        if (isPrimaryParent) {
          const parentMidY = y + NODE_HEIGHT;
          let parentConnectorX: number;
          if (partnerId && layouts[partnerId]) {
            const partnerLayout = layouts[partnerId];
            parentConnectorX = (x + NODE_WIDTH / 2 + partnerLayout.x + NODE_WIDTH / 2) / 2;
          } else {
            parentConnectorX = x + NODE_WIDTH / 2;
          }
          const junctionY = parentMidY + VERTICAL_SPACING / 2;
          let minChildX = Infinity;
          let maxChildX = -Infinity;
          childrenIds.forEach(childId => {
            const childLayout = layouts[childId];
            if (childLayout) {
              const childMidX = childLayout.x + NODE_WIDTH / 2;
              minChildX = Math.min(minChildX, childMidX);
              maxChildX = Math.max(maxChildX, childMidX);
            }
          });
          childrenIds.forEach(childId => {
            const childLayout = layouts[childId];
            if (childLayout) {
              const childMidX = childLayout.x + NODE_WIDTH / 2;
              const childTopY = childLayout.y;
              const p0x = parentConnectorX;
              const p0y = junctionY;
              const p3x = childMidX;
              const p3y = childTopY;
              const cp1x = p0x;
              const cp1y = p0y + (p3y - p0y) * 0.3;
              const cp2x = p3x;
              const cp2y = p0y + (p3y - p0y) * 0.7;
              const curvePath = `M ${p0x} ${p0y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p3x} ${p3y}`;
              paths.push(<Path key={`${childId}-curve`} d={curvePath} stroke="#a1a1aa" strokeWidth="2" fill="none" />);
            }
          });
        }
      }
    });
    return paths;
  };

  const getVisibleNodes = () => {
    const visibleNodes = [];
    const currentScale = renderScale;
    const currentX = renderTranslateX;
    const currentY = renderTranslateY;
    const viewPortX = -currentX / currentScale;
    const viewPortY = -currentY / currentScale;
    const viewPortWidth = screenWidth / currentScale;
    const viewPortHeight = screenHeight / currentScale;
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

  const visibleNodes = useMemo(getVisibleNodes, [layouts, renderScale, renderTranslateX, renderTranslateY]);

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
                  // === SỬA LỖI CHÍNH: Áp dụng tọa độ (left, top) và kích thước vào style ===
                  <View
                    key={character.id}
                    style={[
                      styles.nodeContainer,
                      {
                        left: nodeLayout.x,
                        top: nodeLayout.y,
                        width: NODE_WIDTH,
                        height: NODE_HEIGHT
                      }
                    ]}
                  >
                    <CharacterNode
                      character={character}
                      onClick={() => onSelectCharacter(character)}
                      lang={lang}
                      manifest={manifest}
                      images={images}
                    />
                    <IncomeAnimation
                      netIncome={character.monthlyNetIncome}
                      characterId={character.id}
                      currentDate={gameState.currentDate}
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
    backgroundColor: '#eeeeeeff',
    flex: 1,
    overflow: 'hidden',
  },
  nodeContainer: {
    position: 'absolute',
  },
  treeContainer: {
    ...StyleSheet.absoluteFillObject,
  },
});