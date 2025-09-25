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
  characterIdToCenterOnEvent: string | null;
  onCharacterCenteredOnEvent: () => void;
}

// --- 2. HELPER CONSTANTS ---
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const NODE_WIDTH = (screenWidth - 32) / 3 - 16;
const NODE_HEIGHT = NODE_WIDTH * 1.2;
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
        layouts[char1.id] = { id: char1.id, x: currentX, y: totalY, isPlayerCharacter: char1.isPlayerCharacter, parentsIds: char1.parentsIds || [], partnerId: char1.partnerId || null, childrenIds: char1.childrenIds || [], };
        currentX += NODE_WIDTH + HORIZONTAL_SPACING;
        layouts[char2.id] = { id: char2.id, x: currentX, y: totalY, isPlayerCharacter: char2.isPlayerCharacter, parentsIds: char2.parentsIds || [], partnerId: char2.partnerId || null, childrenIds: char2.childrenIds || [], };
        currentX += NODE_WIDTH + HORIZONTAL_SPACING;
      } else {
        const [char] = members;
        layouts[char.id] = { id: char.id, x: currentX, y: totalY, isPlayerCharacter: char.isPlayerCharacter, parentsIds: char.parentsIds || [], partnerId: char.partnerId || null, childrenIds: char.childrenIds || [], };
        currentX += NODE_WIDTH + HORIZONTAL_SPACING;
      }
    });
    totalY += NODE_HEIGHT + VERTICAL_SPACING;
  });

  Object.values(allMembers).forEach(parentChar => {
    const parentLayout = layouts[parentChar.id];
    if (!parentLayout || !parentChar.childrenIds || parentChar.childrenIds.length === 0) {
      return;
    }
    const childrenXPositions = parentChar.childrenIds.map(childId => layouts[childId] ? layouts[childId].x + NODE_WIDTH / 2 : undefined).filter(x => x !== undefined) as number[];
    if (childrenXPositions.length > 0) {
      const minChildXCenter = Math.min(...childrenXPositions);
      const maxChildXCenter = Math.max(...childrenXPositions);
      const desiredParentXCenter = (minChildXCenter + maxChildXCenter) / 2;
      let currentParentXCenter;
      if (parentChar.partnerId && layouts[parentChar.partnerId]) {
        const partnerLayout = layouts[parentChar.partnerId];
        currentParentXCenter = (parentLayout.x + NODE_WIDTH / 2 + partnerLayout.x + NODE_WIDTH / 2) / 2;
      } else {
        currentParentXCenter = parentLayout.x + NODE_WIDTH / 2;
      }
      const offsetX = desiredParentXCenter - currentParentXCenter;
      parentLayout.x += offsetX;
      if (parentChar.partnerId && layouts[parentChar.partnerId]) {
        layouts[parentChar.partnerId].x += offsetX;
      }
    }
  });

  Object.values(allMembers).forEach(char => {
    if (!layouts[char.id]) {
      layouts[char.id] = { id: char.id, x: 0, y: 0, isPlayerCharacter: char.isPlayerCharacter, parentsIds: char.parentsIds || [], partnerId: char.partnerId || null, childrenIds: char.childrenIds || [], };
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

  const treeBounds = useMemo(() => {
    const layoutValues = Object.values(layouts);
    if (layoutValues.length === 0) { return { minX: 0, minY: 0, width: 0, height: 0 }; }
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    layoutValues.forEach(node => {
      minX = Math.min(minX, node.x);
      minY = Math.min(minY, node.y);
      maxX = Math.max(maxX, node.x + NODE_WIDTH);
      maxY = Math.max(maxY, node.y + NODE_HEIGHT);
    });
    const padding = 100;
    const paddedMinX = minX - padding, paddedMinY = minY - padding;
    const totalWidth = (maxX + padding) - paddedMinX, totalHeight = (maxY + padding) - paddedMinY;
    return { minX: paddedMinX, minY: paddedMinY, width: totalWidth, height: totalHeight };
  }, [layouts]);

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
    onStart: (event, ctx) => { ctx.startX = translateX.value; ctx.startY = translateY.value; },
    onActive: (event, ctx) => { translateX.value = ctx.startX + event.translationX; translateY.value = ctx.startY + event.translationY; },
    onEnd: () => { runOnJS(setRenderTranslateX)(translateX.value); runOnJS(setRenderTranslateY)(translateY.value); }
  });

  const pinchHandler = useAnimatedGestureHandler<PinchGestureHandlerGestureEvent, AnimatedContext>({
    onStart: (event, ctx) => { ctx.startScale = scale.value; },
    onActive: (event, ctx) => { const newScale = ctx.startScale * event.scale; scale.value = Math.max(0.5, Math.min(newScale, 3)); },
    onEnd: () => { runOnJS(setRenderScale)(scale.value); }
  });

  const animatedStyle = useAnimatedStyle(() => ({ transform: [ { translateX: translateX.value }, { translateY: translateY.value }, { scale: scale.value } ] as NonNullable<ViewStyle['transform']>, }));

  const renderConnectors = () => {
    const paths = [];
    const drawnFamilyUnits = new Set<string>();
    Object.values(layouts).forEach(nodeLayout => {
      if (!nodeLayout.childrenIds || nodeLayout.childrenIds.length === 0) { return; }
      const primaryParentId = (nodeLayout.partnerId && nodeLayout.id > nodeLayout.partnerId) ? nodeLayout.partnerId : nodeLayout.id;
      const familyUnitId = `${primaryParentId}-${nodeLayout.childrenIds.sort().join(',')}`;
      if (drawnFamilyUnits.has(familyUnitId)) { return; }
      drawnFamilyUnits.add(familyUnitId);
      let p0x: number;
      const p0y = nodeLayout.y + NODE_HEIGHT;
      if (nodeLayout.partnerId && layouts[nodeLayout.partnerId]) {
        const partnerLayout = layouts[nodeLayout.partnerId];
        p0x = (nodeLayout.x + NODE_WIDTH / 2 + partnerLayout.x + NODE_WIDTH / 2) / 2;
      } else {
        p0x = nodeLayout.x + NODE_WIDTH / 2;
      }
      nodeLayout.childrenIds.forEach(childId => {
        const childLayout = layouts[childId];
        if (childLayout) {
          const p3x = childLayout.x + NODE_WIDTH / 2;
          const p3y = childLayout.y;
          const cp1x = p0x;
          const cp1y = p0y + VERTICAL_SPACING / 2;
          const cp2x = p3x;
          const cp2y = p3y - VERTICAL_SPACING / 2;
          const curvePath = `M ${p0x} ${p0y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p3x} ${p3y}`;
          paths.push( <Path key={`${familyUnitId}-${childId}-curve`} d={curvePath} stroke="#3b82f6" strokeWidth="2.5" fill="none" /> );
        }
      });
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
      if ( nodeRight >= viewPortX - bufferX && node.x <= viewPortX + viewPortWidth + bufferX && nodeBottom >= viewPortY - bufferY && node.y <= viewPortY + viewPortHeight + bufferY ) {
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
              
              {/* ======================================================================================= */}
              {/* === SỬA LỖI QUAN TRỌNG NHẤT: Đưa SVG vào cùng thế giới với CharacterNode === */}
              {/* ======================================================================================= */}
              <Svg 
                style={{
                  position: 'absolute',
                  left: treeBounds.minX,
                  top: treeBounds.minY,
                  width: treeBounds.width,
                  height: treeBounds.height,
                }}
                pointerEvents="none"
                viewBox={`${treeBounds.minX} ${treeBounds.minY} ${treeBounds.width} ${treeBounds.height}`}
              >
                {renderConnectors()}
              </Svg>
              
              {visibleNodes.map(nodeLayout => {
                const character = gameState.familyMembers[nodeLayout.id];
                if (!character) return null;
                return (
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
    // Bỏ `absoluteFillObject` để nó có thể tự do thay đổi kích thước
  },
});