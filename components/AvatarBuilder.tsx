import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Image, SafeAreaView } from 'react-native';

import { LayerKey, Manifest, AvatarState, Character, Gender, LayerDefinition, ColorDefinition } from "../core/types";
import { AVATAR_COLOR_PALETTE } from "../core/constants";
import { AgeAwareAvatarPreview } from './AgeAwareAvatarPreview';

// =============================================
// Helpers (Giữ nguyên)
// =============================================
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function pickRandom<T>(rng: () => number, arr: T[]): T | undefined {
  if (!arr.length) return undefined;
  const idx = Math.floor(rng() * arr.length);
  return arr[idx];
}

// =============================================
// Main Component
// =============================================
type AgeCategory = 'baby' | 'normal' | 'old';

function ageCategoryFromAge(age: number): AgeCategory {
  if (age <= 5) return 'baby';
  if (age <= 59) return 'normal';
  return 'old';
}

function getAgeAppropriateOptions(layer: LayerDefinition, ageCategory: AgeCategory) {
    if (layer.key === 'features') {
        return layer.options.filter(o => o.ageCategory === ageCategory);
    }
    return layer.options;
}

function makePlaceholderComponent(label: string) {
  return (
    <View style={avatarBuilderStyles.placeholderContainer}>
      <Text style={avatarBuilderStyles.placeholderText}>{label}</Text>
    </View>
  );
}

export default function AvatarBuilder({
    manifest,
    character,
    images,
    onSave,
    onClose,
}: {
    manifest: Manifest;
    character: Character;
    images: Record<string, number>;
    onSave: (newState: AvatarState) => void;
    onClose: () => void;
}) {
  const [seed, setSeed] = useState<number>(() => Math.floor(Math.random() * 100000));
  const [state, setState] = useState<AvatarState>(character.avatarState);
  const [optionsContainerWidth, setOptionsContainerWidth] = useState(0);
  const [optionSize, setOptionSize] = useState(0);
  const [selectedLayerKey, setSelectedLayerKey] = useState<LayerKey | null>(null);

  useEffect(() => {
    if (optionsContainerWidth > 0) {
        const numberOfColumns = 3;
        const gap = 8;
        const totalGapWidth = gap * (numberOfColumns - 1);
        const availableWidth = optionsContainerWidth - (12 * 2);
        const size = (availableWidth - totalGapWidth) / numberOfColumns;
        setOptionSize(size);
    }
  }, [optionsContainerWidth]);

  useEffect(() => {
    const updates: Partial<AvatarState> = {};
    let needsUpdate = false;
    if ((character.gender === Gender.Female || character.age < 18) && state.beard) {
        updates.beard = null;
        updates.beardColor = undefined;
        needsUpdate = true;
    }
    if (character.gender === Gender.Male && state.backHair) {
        updates.backHair = null;
        updates.backHairColor = undefined;
        needsUpdate = true;
    }
    if (needsUpdate) {
        setState(s => ({ ...s, ...updates }));
    }
  }, [character.gender, character.age, state.beard, state.backHair]);

  const ordered = useMemo(() => [...manifest].sort((a, b) => a.zIndex - b.zIndex), [manifest]);
  const characterAgeCategory = ageCategoryFromAge(character.age);

  function setLayer(layer: LayerKey, optionId: string | null) { setState((s) => ({ ...s, [layer]: optionId })); }

  function setColorForLayer(layerKey: LayerKey, colorName: string) {
    if (layerKey === 'frontHair' || layerKey === 'backHair') {
      setState(s => ({ ...s, frontHairColor: colorName, backHairColor: colorName }));
    } else {
      setState(s => ({ ...s, [`${layerKey}Color`]: colorName }));
    }
  }

  function randomize() {
    const rng = mulberry32(seed);
    const next: AvatarState = {};
    for (const layer of ordered) {
      if (layer.key === 'beard' && (character.gender === Gender.Female || character.age < 18)) {
          next.beard = null;
          continue;
      }
      if (layer.key === 'backHair' && character.gender === Gender.Male) {
        next.backHair = null;
        continue;
      }
      const optionsPool = getAgeAppropriateOptions(layer, characterAgeCategory);
      const pool = layer.allowNone ? [null, ...optionsPool.map((o) => o.id)] : optionsPool.map((o) => o.id);
      const picked = pickRandom(rng, pool as (string | null)[]);
      let finalPick = picked;
      if (finalPick === undefined && layer.required) {
         finalPick = optionsPool[0]?.id ?? null;
      }
      next[layer.key] = finalPick ?? null;
    }
    const hairColor = pickRandom(rng, AVATAR_COLOR_PALETTE)?.name || 'Natural Gray';
    const eyeColor = pickRandom(rng, AVATAR_COLOR_PALETTE)?.name || 'Black'; // Default eye color
    const mouthColor = pickRandom(rng, AVATAR_COLOR_PALETTE)?.name || 'Red'; // Default mouth color

    if(next.backHair) next.backHairColor = hairColor;
    if(next.frontHair) next.frontHairColor = hairColor;
    if(next.eyebrows) next.eyebrowsColor = hairColor;
    if(next.beard) next.beardColor = hairColor;
    else next.beardColor = undefined;

    if(next.eyes) next.eyesColor = eyeColor;
    if(next.mouth) next.mouthColor = mouthColor;

    setState(next);
  }

  const renderLayerOptions = (layer: (typeof manifest)[0]) => {
    const options = getAgeAppropriateOptions(layer, characterAgeCategory);
    const isColorable = ['frontHair', 'backHair', 'eyebrows', 'beard', 'eyes', 'mouth'].includes(layer.key);
    let activeColorName: string | undefined;
    if (layer.key === 'frontHair') activeColorName = state.frontHairColor;
    if (layer.key === 'eyebrows') activeColorName = state.eyebrowsColor;
    if (layer.key === 'beard') activeColorName = state.beardColor;
    if (layer.key === 'eyes') activeColorName = state.eyesColor;
    if (layer.key === 'mouth') activeColorName = state.mouthColor;

    return (
      <View style={avatarBuilderStyles.layerOptionContainer}>
        <View style={avatarBuilderStyles.layerOptionHeader}>
          <Text style={avatarBuilderStyles.layerOptionTitle}>{layer.label}</Text>
          {layer.allowNone && (
            <TouchableOpacity onPress={() => setLayer(layer.key, null)}>
                <Text style={avatarBuilderStyles.noneButtonText}>None</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={avatarBuilderStyles.optionsGrid}>
          {options.map((opt) => {
            const selected = state[layer.key] === opt.id;
            const src = opt.previewSrc || opt.src;
            const displaySource = images[src];

            return (
              <TouchableOpacity
                key={opt.id}
                style={[
                    avatarBuilderStyles.optionButton,
                    selected ? avatarBuilderStyles.optionButtonSelected : avatarBuilderStyles.optionButtonNormal,
                    { width: optionSize, height: optionSize }
                ]}
                onPress={() => setLayer(layer.key, opt.id)}
              >
                {displaySource ? (
                    <Image source={displaySource} style={avatarBuilderStyles.optionImage} />
                ) : (
                    makePlaceholderComponent(opt.name)
                )}
              </TouchableOpacity>
            );
          })}
        </View>
        {isColorable && state[layer.key] && (
            <View style={avatarBuilderStyles.colorPickerContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={avatarBuilderStyles.colorPalette}>
                  {AVATAR_COLOR_PALETTE.map((color: ColorDefinition) => {
                      const isActive = activeColorName === color.name;
                      return (
                          <TouchableOpacity
                              key={color.name}
                              style={[
                                  avatarBuilderStyles.colorSwatch,
                                  { backgroundColor: color.previewBackground },
                                  isActive && avatarBuilderStyles.colorSwatchSelected,
                              ]}
                              onPress={() => setColorForLayer(layer.key, color.name)}
                          />
                      );
                  })}
              </ScrollView>
            </View>
        )}
      </View>
    );
  };

  const renderContentForRightColumn = () => {
    if (selectedLayerKey) {
      const selectedLayer = ordered.find(layer => layer.key === selectedLayerKey);
      if (!selectedLayer) return null;
      return (
        <ScrollView>
          <TouchableOpacity
            style={[avatarBuilderStyles.chunkyButton, avatarBuilderStyles.chunkyButtonSlate, avatarBuilderStyles.chunkyButtonMarginBottom]}
            onPress={() => setSelectedLayerKey(null)}
          >
            <Text style={avatarBuilderStyles.chunkyButtonText}>Back to Layers</Text>
          </TouchableOpacity>
          {optionSize > 0 && renderLayerOptions(selectedLayer)}
        </ScrollView>
      );
    }

    return (
      <ScrollView>
        {ordered.map(layer => {
          if ((layer.key === 'backHair' && character.gender === Gender.Male) ||
              (layer.key === 'beard' && (character.gender === Gender.Female || character.age < 18))) {
            return null;
          }
          return (
            <TouchableOpacity
              key={layer.key}
              style={avatarBuilderStyles.layerSelectButton}
              onPress={() => setSelectedLayerKey(layer.key)}
            >
              <Text style={avatarBuilderStyles.layerSelectButtonText}>{layer.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    );
  }

  return (
    <View style={avatarBuilderStyles.overlay}>
        <SafeAreaView style={avatarBuilderStyles.comicPanelWrapper}>
            <View style={avatarBuilderStyles.comicPanel}>
                <Text style={avatarBuilderStyles.mainTitle}>Customize Avatar</Text>
                <View style={avatarBuilderStyles.mainContentGrid}>
                  <View style={avatarBuilderStyles.previewColumn}>
                    <AgeAwareAvatarPreview manifest={manifest} character={{ ...character, avatarState: state }} images={images} size={{width: 256, height: 256}} />
                    <View style={avatarBuilderStyles.controlsContainer}>
                      <TouchableOpacity style={[avatarBuilderStyles.chunkyButton, avatarBuilderStyles.chunkyButtonPink]} onPress={randomize}>
                          <Text style={avatarBuilderStyles.chunkyButtonText}>Randomize</Text>
                      </TouchableOpacity>
                      <View style={avatarBuilderStyles.seedInputContainer}>
                        <Text style={avatarBuilderStyles.seedLabel}>Seed</Text>
                        <TextInput
                            style={avatarBuilderStyles.seedInput}
                            value={seed.toString()}
                            onChangeText={(text) => setSeed(parseInt(text || "0", 10) || 0)}
                            keyboardType="numeric"
                        />
                      </View>
                    </View>
                  </View>
            
                  <View 
                    style={avatarBuilderStyles.rightColumnContainer}
                    onLayout={(event) => {
                        const { width } = event.nativeEvent.layout;
                        if (width !== optionsContainerWidth) {
                            setOptionsContainerWidth(width);
                        }
                    }}
                  >
                      {renderContentForRightColumn()}
                  </View>
                </View>
                 <View style={avatarBuilderStyles.footerButtonsContainer}>
                    <TouchableOpacity style={[avatarBuilderStyles.chunkyButton, avatarBuilderStyles.chunkyButtonSlate]} onPress={onClose}><Text style={avatarBuilderStyles.chunkyButtonText}>Cancel</Text></TouchableOpacity>
                    <TouchableOpacity style={[avatarBuilderStyles.chunkyButton, avatarBuilderStyles.chunkyButtonGreen]} onPress={() => onSave(state)}><Text style={avatarBuilderStyles.chunkyButtonText}>Save</Text></TouchableOpacity>
                 </View>
            </View>
        </SafeAreaView>
    </View>
  );
}

const avatarBuilderStyles = StyleSheet.create({
    chunkyButton: {
        alignItems: 'center',
        borderBottomWidth: 4,
        borderRadius: 8,
        justifyContent: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    chunkyButtonGreen: {
        backgroundColor: '#22c55e',
        borderColor: '#16a34a',
    },
    chunkyButtonMarginBottom: {
        marginBottom: 16,
    },
    chunkyButtonPink: {
        backgroundColor: '#ec4899',
        borderColor: '#db2777',
    },
    chunkyButtonSlate: {
        backgroundColor: '#64748b',
        borderColor: '#475569',
    },
    chunkyButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    colorPalette: {
        flexDirection: 'row',
        gap: 8,
        paddingVertical: 4,
    },
    colorPickerContainer: {
        marginTop: 12,
    },
    colorSwatch: {
        borderColor: 'transparent',
        borderRadius: 16,
        borderWidth: 2,
        height: 32,
        width: 32,
    },
    colorSwatchSelected: {
        borderColor: '#3b82f6', // blue-500
        transform: [{ scale: 1.1 }],
    },
    comicPanel: {
        backgroundColor: '#f8fafc',
        flex: 1,
        paddingBottom: 16,
        paddingHorizontal: 16,
        width: '100%',
    },
    comicPanelWrapper: {
        flex: 1,
        width: '100%',
    },
    controlsContainer: {
        alignItems: 'center',
        backgroundColor: '#f1f5f9',
        borderRadius: 12,
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        justifyContent: 'center',
        padding: 8,
        width: '100%',
    },
    footerButtonsContainer: {
        borderColor: '#e2e8f0',
        borderTopWidth: 1,
        flexDirection: 'row',
        gap: 16,
        justifyContent: 'center',
        marginTop: 16,
        paddingTop: 16,
    },
    layerOptionContainer: {
        backgroundColor: 'white',
        borderColor: '#e2e8f0',
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 16,
        padding: 12,
    },
    layerOptionHeader: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    layerOptionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    layerSelectButton: {
        alignItems: 'center',
        backgroundColor: '#60a5fa',
        borderRadius: 8,
        marginBottom: 10,
        paddingHorizontal: 20,
        paddingVertical: 12,
        width: '100%',
    },
    layerSelectButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    mainContentGrid: {
        flexDirection: 'row',
        flex: 1,
        gap: 16,
    },
    mainTitle: {
        color: '#60a5fa',
        fontSize: 28,
        fontWeight: 'bold',
        marginVertical: 16,
        textAlign: 'center',
    },
    noneButtonText: {
        color: '#64748b',
        fontSize: 14,
        textDecorationLine: 'underline',
    },
    optionButton: {
        backgroundColor: '#f1f5f9',
        borderRadius: 12,
        borderWidth: 2,
        overflow: 'hidden',
        position: 'relative',
    },
    optionButtonNormal: {
        borderColor: 'transparent',
    },
    optionButtonSelected: {
        borderColor: '#3b82f6',
    },
    optionImage: {
        height: '100%',
        resizeMode: 'contain',
        width: '100%',
    },
    optionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    overlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        bottom: 0,
        left: 0,
        position: 'absolute',
        right: 0,
        top: 0,
        zIndex: 50,
    },
    placeholderContainer: {
        alignItems: 'center',
        backgroundColor: '#e2e8f0',
        height: '100%',
        justifyContent: 'center',
        width: '100%',
    },
    placeholderText: {
        color: '#64748b',
        fontSize: 10,
        textAlign: 'center',
    },
        previewColumn: {
        alignItems: 'center',
        flex: 1,
        flexDirection: 'column',
        gap: 16,
        justifyContent: 'flex-start', // Thay 'space-between' thành 'flex-start'
    },
    rightColumnContainer: {
        flex: 1,
    },
    seedInput: {
        backgroundColor: 'white',
        borderColor: '#e2e8f0',
        borderRadius: 12,
        borderWidth: 1,
        paddingHorizontal: 12,
        paddingVertical: 8,
        width: 80,
    },
    seedInputContainer: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: 4,
    },
    seedLabel: {
        fontSize: 14,
        fontWeight: 'bold',
    },
});