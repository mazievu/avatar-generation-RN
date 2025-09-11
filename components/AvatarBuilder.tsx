import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Image, SafeAreaView } from 'react-native';

import { LayerKey, Manifest, AvatarState, Character, Gender, LayerDefinition } from "../core/types";
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
    images: Record<string, any>;
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
    if(next.backHair) next.backHairColor = hairColor;
    if(next.frontHair) next.frontHairColor = hairColor;
    if(next.eyebrows) next.eyebrowsColor = hairColor;
    if(next.beard) next.beardColor = hairColor;
    else next.beardColor = undefined;
    setState(next);
  }

  const renderLayerOptions = (layer: (typeof manifest)[0]) => {
    const options = getAgeAppropriateOptions(layer, characterAgeCategory);
    const isColorable = ['frontHair', 'eyebrows', 'beard'].includes(layer.key);
    let activeColorName: string | undefined;
    if (layer.key === 'frontHair') activeColorName = state.frontHairColor;
    if (layer.key === 'eyebrows') activeColorName = state.eyebrowsColor;
    if (layer.key === 'beard') activeColorName = state.beardColor;

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
              {/* ... Color Picker JSX ... */}
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
            style={[avatarBuilderStyles.chunkyButton, avatarBuilderStyles.chunkyButtonSlate, { marginBottom: 16 }]}
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
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        zIndex: 50,
    },
    comicPanelWrapper: {
        flex: 1,
        width: '100%',
    },
    comicPanel: {
        flex: 1,
        backgroundColor: '#f8fafc',
        paddingHorizontal: 16,
        paddingBottom: 16,
        width: '100%',
    },
    mainTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#60a5fa',
        marginVertical: 16,
        textAlign: 'center',
    },
    mainContentGrid: {
        flexDirection: 'row',
        flex: 1,
        gap: 16,
    },
    previewColumn: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        // === THAY ĐỔI DUY NHẤT LÀ Ở ĐÂY ===
        justifyContent: 'flex-start', // Thay 'space-between' thành 'flex-start'
        // ===================================
        gap: 16,
    },
    controlsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        padding: 8,
        backgroundColor: '#f1f5f9',
        borderRadius: 12,
        width: '100%',
    },
    chunkyButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        borderBottomWidth: 4,
    },
    chunkyButtonPink: {
        backgroundColor: '#ec4899',
        borderColor: '#db2777',
    },
    chunkyButtonSlate: {
        backgroundColor: '#64748b',
        borderColor: '#475569',
    },
    chunkyButtonGreen: {
        backgroundColor: '#22c55e',
        borderColor: '#16a34a',
    },
    chunkyButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    seedInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    seedLabel: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    seedInput: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        width: 80,
        backgroundColor: 'white',
    },
    rightColumnContainer: {
        flex: 1,
    },
    layerOptionContainer: {
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        backgroundColor: 'white',
        padding: 12,
        marginBottom: 16,
    },
    layerOptionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    layerOptionTitle: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    noneButtonText: {
        fontSize: 14,
        textDecorationLine: 'underline',
        color: '#64748b',
    },
    optionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    optionButton: {
        position: 'relative',
        borderRadius: 12,
        borderWidth: 2,
        overflow: 'hidden',
        backgroundColor: '#f1f5f9',
    },
    optionButtonSelected: {
        borderColor: '#3b82f6',
    },
    optionButtonNormal: {
        borderColor: 'transparent',
    },
    optionImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
    },
    placeholderContainer: {
        width: '100%',
        height: '100%',
        backgroundColor: '#e2e8f0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        fontSize: 10,
        textAlign: 'center',
        color: '#64748b',
    },
    colorPickerContainer: {
      // ...
    },
    colorPalette: {
      // ...
    },
    colorSwatch: {
      // ...
    },
    colorSwatchSelected: {
      // ...
    },
    footerButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 16,
        borderTopWidth: 1,
        borderColor: '#e2e8f0',
        paddingTop: 16,
        marginTop: 16,
    },
    layerSelectButton: {
        backgroundColor: '#60a5fa',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginBottom: 10,
        alignItems: 'center',
        width: '100%',
    },
    layerSelectButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 18,
    },
});