import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet, Dimensions, ImageSourcePropType, Text, ViewStyle } from 'react-native';
import {
  Gesture, GestureDetector
} from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { CharacterNode } from './CharacterNode';
import type { Character, GameState, Language, Manifest, PurchasedAsset } from '../core/types';
import IncomeAnimation from './IncomeAnimation';
import { JourneyAnimation } from './JourneyAnimation';

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
  familyMembers: Record<string, Character>;
  activeEvent: GameState['activeEvent'];
  currentDate: GameState['currentDate'];
  lang: Language;
  manifest: Manifest;
  images: Record<string, ImageSourcePropType>;
  onSelectCharacter: (character: Character) => void;
  selectedCharacter: Character | null;
  characterIdToCenterOnEvent: string | null;
  onCharacterCenteredOnEvent: () => void;
  purchasedAssets: Record<string, PurchasedAsset>;
}

// --- 2. HELPER CONSTANTS ---
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const NODE_WIDTH = (screenWidth - 32) / 3 - 16;
const NODE_HEIGHT = NODE_WIDTH * 1.2;
const HORIZONTAL_SPACING = 30;
const COUPLE_SPACING = 10;
const VERTICAL_SPACING = 60;

// --- 3. LAYOUT CALCULATION LOGIC ---

function shiftSubtree(nodeId: string, offsetX: number, layouts: LayoutsMap, allMembers: Record<string, Character>, visited = new Set<string>()) {
  if (visited.has(nodeId) || !layouts[nodeId]) return;
  visited.add(nodeId);
  layouts[nodeId].x += offsetX;

  const character = allMembers[nodeId];
  if (character?.childrenIds) {
    for (const childId of character.childrenIds) {
      shiftSubtree(childId, offsetX, layouts, allMembers, visited);
      const child = allMembers[childId];
      if (child?.partnerId && layouts[child.partnerId]) {
         shiftSubtree(child.partnerId, offsetX, layouts, allMembers, visited);
      }
    }
  }
}

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
  
  let totalY = 0;
  const generationLevels = Object.keys(membersByGeneration).sort((a, b) => Number(a) - Number(b)).map(Number);

  generationLevels.forEach(generation => {
    const membersInGen = membersByGeneration[generation];
    let currentX = 0;
    const couples = new Map<string, Character[]>();
    const processedIds = new Set<string>();

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

    const generationWidth = Array.from(couples.values()).reduce((acc, members) => {
        return acc + (members.length * NODE_WIDTH) + HORIZONTAL_SPACING;
    }, -HORIZONTAL_SPACING);
    
    currentX = -generationWidth / 2;

    couples.forEach(members => {
      members.forEach((char, index) => {
         layouts[char.id] = {
           id: char.id, x: currentX, y: totalY, isPlayerCharacter: char.isPlayerCharacter, 
           parentsIds: char.parentsIds || [], partnerId: char.partnerId || null, childrenIds: char.childrenIds || [],
         };
         const spacing = (members.length === 2 && index === 0) ? COUPLE_SPACING : HORIZONTAL_SPACING;
         currentX += NODE_WIDTH + spacing;
      });
    });
    totalY += NODE_HEIGHT + VERTICAL_SPACING;
  });

  for (let i = generationLevels.length - 2; i >= 0; i--) {
    const generation = generationLevels[i];
    const membersInGen = membersByGeneration[generation]
      .filter(m => layouts[m.id])
      .sort((a, b) => layouts[a.id].x - layouts[b.id].x);

    membersInGen.forEach(parentChar => {
      const parentLayout = layouts[parentChar.id];
      if (!parentLayout || !parentChar.childrenIds || parentChar.childrenIds.length === 0) {
        return;
      }

      const childrenLayouts = parentChar.childrenIds
        .map(childId => layouts[childId])
        .filter(Boolean);
      
      if (childrenLayouts.length > 0) {
        const minChildX = Math.min(...childrenLayouts.map(l => l.x));
        const maxChildX = Math.max(...childrenLayouts.map(l => l.x + NODE_WIDTH));
        const desiredParentBlockXCenter = (minChildX + maxChildX) / 2;

        let currentParentBlockXCenter;

        if (parentChar.partnerId && layouts[parentChar.partnerId]) {
            const partnerLayout = layouts[parentChar.partnerId];
            if (parentLayout.x > partnerLayout.x) return;

            currentParentBlockXCenter = (parentLayout.x + partnerLayout.x + NODE_WIDTH) / 2;
        } else {
            currentParentBlockXCenter = parentLayout.x + NODE_WIDTH / 2;
        }

        const offsetX = desiredParentBlockXCenter - currentParentBlockXCenter;
        parentLayout.x += offsetX;
        if (parentChar.partnerId && layouts[parentChar.partnerId]) {
            layouts[parentChar.partnerId].x += offsetX;
        }
      }
    });

    for (let j = 1; j < membersInGen.length; j++) {
      const currentMember = membersInGen[j];
      const prevMember = membersInGen[j - 1];
      const currentLayout = layouts[currentMember.id];
      const prevLayout = layouts[prevMember.id];

      if (!currentLayout || !prevLayout) continue;

      const requiredX = prevLayout.x + NODE_WIDTH + HORIZONTAL_SPACING;
      if (currentLayout.x < requiredX) {
        const shiftAmount = requiredX - currentLayout.x;
        shiftSubtree(currentMember.id, shiftAmount, layouts, allMembers);
        if (currentMember.partnerId && layouts[currentMember.partnerId]) {
           shiftSubtree(currentMember.partnerId, shiftAmount, layouts, allMembers);
        }
      }
    }
  }

  return layouts;
}

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
    width: '100%',
    height: '100%',
  },
});

// --- 4. MAIN FAMILY TREE COMPONENT ---
export const FamilyTree: React.FC<FamilyTreeProps> = React.memo(({ familyMembers, activeEvent, currentDate, lang, manifest, images, onSelectCharacter, selectedCharacter, characterIdToCenterOnEvent, onCharacterCenteredOnEvent, purchasedAssets }) => {
  const hasCenteredInitially = useRef(false);

  // Animated values
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  // "Context" values to store the state at the beginning of a gesture
  const startTranslateX = useSharedValue(0);
  const startTranslateY = useSharedValue(0);
  const startScale = useSharedValue(1);
  
  // React state to trigger re-render for culling and animations
  const [viewState, setViewState] = useState({ scale: 1, x: 0, y: 0 });
  const [showJourneyAnimation, setShowJourneyAnimation] = useState(false);

  const layouts = useMemo(() => calculateTreeLayout(familyMembers), [familyMembers]);

  const handleJourneyAnimationFinish = useCallback(() => {
    setShowJourneyAnimation(false);
    if (characterIdToCenterOnEvent && onCharacterCenteredOnEvent) {
        onCharacterCenteredOnEvent();
    }
  }, [characterIdToCenterOnEvent, onCharacterCenteredOnEvent]);

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
    const padding = 200;
    const paddedMinX = minX - padding;
    const paddedMinY = minY - padding;
    const totalWidth = (maxX + padding) - paddedMinX;
    const totalHeight = (maxY + padding) - paddedMinY;
    return { minX: paddedMinX, minY: paddedMinY, width: totalWidth, height: totalHeight };
  }, [layouts]);

  const updateViewStateThrottled = useCallback((newScale: number, newX: number, newY: number) => {
      setViewState({ scale: newScale, x: newX, y: newY });
  }, []);

  useEffect(() => {
    let characterToCenter: Character | null = null;
    if (selectedCharacter && layouts[selectedCharacter.id]) {
      characterToCenter = selectedCharacter;
    }
    else if (characterIdToCenterOnEvent && familyMembers[characterIdToCenterOnEvent] && layouts[characterIdToCenterOnEvent]) {
      characterToCenter = familyMembers[characterIdToCenterOnEvent];
    }
    else if (!hasCenteredInitially.current && Object.keys(layouts).length > 0) {
      const playerCharacter = Object.values(familyMembers).find(char => char.isPlayerCharacter);
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
          runOnJS(setViewState)({ scale: targetScale, x: newTranslateX, y: newTranslateY });
          if (characterIdToCenterOnEvent) {
            const shouldShowJourney = activeEvent?.event.showJourneyAnimation;
            if (shouldShowJourney) {
              runOnJS(setShowJourneyAnimation)(true);
            } else {
              runOnJS(onCharacterCenteredOnEvent)();
            }
          }
        }
      });
    }
  }, [selectedCharacter, characterIdToCenterOnEvent, layouts, activeEvent]);

  const panGesture = Gesture.Pan()
    .onStart(() => {
        startTranslateX.value = translateX.value;
        startTranslateY.value = translateY.value;
    })
    .onUpdate((event) => {
        translateX.value = startTranslateX.value + event.translationX;
        translateY.value = startTranslateY.value + event.translationY;
        runOnJS(updateViewStateThrottled)(scale.value, translateX.value, translateY.value);
    })
    .onEnd(() => {
        runOnJS(updateViewStateThrottled)(scale.value, translateX.value, translateY.value);
    });

  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
        startScale.value = scale.value;
    })
    .onUpdate((event) => {
        const newScale = startScale.value * event.scale;
        scale.value = Math.max(0.3, Math.min(newScale, 3));
        runOnJS(updateViewStateThrottled)(scale.value, translateX.value, translateY.value);
    })
    .onEnd(() => {
        runOnJS(updateViewStateThrottled)(scale.value, translateX.value, translateY.value);
    });

  const composedGesture = Gesture.Simultaneous(panGesture, pinchGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value }
    ] as NonNullable<ViewStyle['transform']>,
  }));

  const renderConnectors = () => {
    const paths = [];
    const drawnFamilyUnits = new Set<string>();
    Object.values(layouts).forEach(nodeLayout => {
      if (!nodeLayout.childrenIds || nodeLayout.childrenIds.length === 0) return;
      const primaryParentId = (nodeLayout.partnerId && nodeLayout.id > nodeLayout.partnerId) ? nodeLayout.partnerId : nodeLayout.id;
      const familyUnitId = `${primaryParentId}-${nodeLayout.childrenIds.sort().join(',')}`;
      if (drawnFamilyUnits.has(familyUnitId)) return;
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
          paths.push(<Path key={`${familyUnitId}-${childId}-curve`} d={curvePath} stroke="#3b82f6" strokeWidth="2.5" fill="none" />);
        }
      });
    });
    return paths;
  };
  
  const getVisibleNodes = (
    layoutsMap: LayoutsMap, 
    currentScale: number, 
    currentX: number, 
    currentY: number
  ): NodeLayout[] => {
    const visibleNodes: NodeLayout[] = [];
    const viewPortX = -currentX / currentScale;
    const viewPortY = -currentY / currentScale;
    const viewPortWidth = screenWidth / currentScale;
    const viewPortHeight = screenHeight / currentScale;

    const bufferX = viewPortWidth * 1.0;
    const bufferY = viewPortHeight * 1.0;

    for (const id in layoutsMap) {
      const node = layoutsMap[id];
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

  const visibleNodes = useMemo(() => 
    getVisibleNodes(layouts, viewState.scale, viewState.x, viewState.y),
    [layouts, viewState]
  );

  const characterForAnimation = characterIdToCenterOnEvent ? familyMembers[characterIdToCenterOnEvent] : null;

  if (Object.keys(layouts).length === 0) {
    return <View style={styles.container}><Text>No family members to display.</Text></View>;
  }

  return (
    <GestureDetector gesture={composedGesture}>
      <Animated.View style={styles.container}>
        <Animated.View style={[styles.treeContainer, animatedStyle]}>
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
            const character = familyMembers[nodeLayout.id];
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
                  currentDate={currentDate}
                />
              </View>
            );
          })}
        </Animated.View>
        {showJourneyAnimation && characterForAnimation && (
            <JourneyAnimation
                onAnimationComplete={handleJourneyAnimationFinish}
                character={characterForAnimation}
                images={images}
                lang={lang}
                manifest={manifest}
                purchasedAssets={purchasedAssets}
                event={activeEvent ? activeEvent.event : null}
            />
        )}
      </Animated.View>
    </GestureDetector>
  );
});