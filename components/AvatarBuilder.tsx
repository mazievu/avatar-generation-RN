import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Image } from 'react-native';
import { LayerKey, Manifest, AvatarState, Character, Gender } from "../core/types";
import { LockClosedIcon } from './icons';
import { AVATAR_COLOR_PALETTE } from "../core/constants";
import { AgeAwareAvatarPreview } from './AgeAwareAvatarPreview';

// =============================================
// Helpers (Simplified for React Native)
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
function hashString(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
  }
  return h >>> 0;
}

// Placeholder for image options - simplified to a colored View with text
function makePlaceholderComponent(label: string) {
  return (
    <View style={avatarBuilderStyles.placeholderContainer}>
      <Text style={avatarBuilderStyles.placeholderText}>{label}</Text>
    </View>
  );
}

// Removed usePreloadedImages, drawAvatarToCanvas, exportPNG as they are web-specific

// =============================================
// Main Component
// =============================================
type AgeCategory = 'baby' | 'normal' | 'old';

function ageCategoryFromAge(age: number): AgeCategory {
  if (age <= 5) return 'baby'; // Corresponds to LifePhase.Newborn
  if (age <= 59) return 'normal'; // Corresponds to Elementary through PostGraduation
  return 'old'; // Corresponds to Retired
}

function getAgeAppropriateOptions(layer: (typeof exampleManifest)[0], ageCategory: AgeCategory) {
    if (layer.key === 'features') {
        return layer.options.filter(o => o.ageCategory === ageCategory);
    }
    return layer.options;
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
    images: Record<string, any>; // Changed from HTMLImageElement to any for RN compatibility
    onSave: (newState: AvatarState) => void;
    onClose: () => void;
}) {
  const [seed, setSeed] = useState<number>(() => Math.floor(Math.random() * 100000));
  const [state, setState] = useState<AvatarState>(character.avatarState);

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
            setState(s => ({
                ...s,
                frontHairColor: colorName,
                backHairColor: colorName,
            }));
        } else {
             setState(s => ({
                ...s,
                [`${layerKey}Color`]: colorName,
            }));
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
      // For features, only randomize within the allowed age category
      const optionsPool = getAgeAppropriateOptions(layer, characterAgeCategory);

      const pool = layer.allowNone ? [null, ...optionsPool.map((o) => o.id)] : optionsPool.map((o) => o.id);
      const picked = pickRandom(rng, pool as (string | null)[]);
      
      let finalPick = picked;
      if (finalPick === undefined && layer.required) {
         finalPick = optionsPool[0]?.id ?? null;
      }
      next[layer.key] = finalPick ?? null;
    }
     // Assign random colors
    const hairColor = pickRandom(rng, AVATAR_COLOR_PALETTE)?.name || 'Natural Gray';
    const eyebrowsColor = pickRandom(rng, AVATAR_COLOR_PALETTE)?.name || 'Natural Gray';
    const beardColor = pickRandom(rng, AVATAR_COLOR_PALETTE)?.name || 'Natural Gray';
    if(next.backHair) next.backHairColor = hairColor;
    if(next.frontHair) next.frontHairColor = hairColor;
    if(next.eyebrows) next.eyebrowsColor = eyebrowsColor;
    if(next.beard) {
        next.beardColor = beardColor;
    } else {
        next.beardColor = undefined;
    }

    setState(next);
  }

  // Removed exportPNG function

    const renderLayerOptions = (layer: (typeof manifest)[0]) => {
    const options = getAgeAppropriateOptions(layer, characterAgeCategory);
    const isColorable = ['frontHair', 'eyebrows', 'beard'].includes(layer.key);
    let activeColorName: string | undefined;
    if (layer.key === 'frontHair') activeColorName = state.frontHairColor;
    if (layer.key === 'eyebrows') activeColorName = state.eyebrowsColor;
    if (layer.key === 'beard') activeColorName = state.beardColor;

    return (
      <View key={layer.key} style={avatarBuilderStyles.layerOptionContainer}>
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
            // For React Native, `images` prop should contain preloaded ImageSourcePropType values
            const displaySource = images[src]; // Assuming images[src] is already a valid ImageSourcePropType

            return (
              <TouchableOpacity
                key={opt.id}
                style={[
                    avatarBuilderStyles.optionButton,
                    selected ? avatarBuilderStyles.optionButtonSelected : avatarBuilderStyles.optionButtonNormal,
                ]}
                onPress={() => setLayer(layer.key, opt.id)}
              >
                {displaySource ? (
                    <Image source={displaySource} style={avatarBuilderStyles.optionImage} />
                ) : (
                    makePlaceholderComponent(opt.name) // Use placeholder component
                )}
              </TouchableOpacity>
            );
          })}
        </View>
        {isColorable && state[layer.key] && (
            <View style={avatarBuilderStyles.colorPickerContainer}>
                <Text style={avatarBuilderStyles.colorPickerTitle}>Color</Text>
                <View style={avatarBuilderStyles.colorPalette}>
                    {AVATAR_COLOR_PALETTE.map(color => (
                        <TouchableOpacity
                            key={color.name}
                            onPress={() => setColorForLayer(layer.key, color.name)}
                            style={[
                                avatarBuilderStyles.colorSwatch,
                                { backgroundColor: color.previewBackground },
                                activeColorName === color.name && avatarBuilderStyles.colorSwatchSelected,
                            ]}
                        />
                    ))}
                </View>
            </View>
        )}
      </View>
    );
  };


  return (
    <View style={avatarBuilderStyles.overlay}>
        <View style={avatarBuilderStyles.comicPanelWrapper}>
            <View style={avatarBuilderStyles.comicPanel}>
                <Text style={avatarBuilderStyles.mainTitle}>Customize Avatar</Text>
                <View style={avatarBuilderStyles.mainContentGrid}>
                  <View style={avatarBuilderStyles.previewColumn}>
                    {/* AgeAwareAvatarPreview handles layering and image display */}
                    <AgeAwareAvatarPreview manifest={manifest} character={character} images={images} size={{width: 256, height: 256}} />
                    <View style={avatarBuilderStyles.controlsContainer}>
                      <TouchableOpacity style={[avatarBuilderStyles.chunkyButton, avatarBuilderStyles.chunkyButtonPink]} onPress={randomize}><Text style={avatarBuilderStyles.chunkyButtonText}>Randomize</Text></TouchableOpacity>
                      {/* Removed Export PNG button */}
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
            
                  <ScrollView style={avatarBuilderStyles.layersColumn}>
                    {ordered.map(layer => {
                        if (layer.key === 'backHair' && character.gender === Gender.Male) {
                            return null;
                        }
                        
                        if (layer.key === 'beard' && (character.gender === Gender.Female || character.age < 18)) {
                            return null;
                        }

                        // The color picker for backHair is intentionally omitted as its color is linked to frontHair.
                        return renderLayerOptions(layer);
                    })}
                  </ScrollView>
                </View>
                 <View style={avatarBuilderStyles.footerButtonsContainer}>
                    <TouchableOpacity style={[avatarBuilderStyles.chunkyButton, avatarBuilderStyles.chunkyButtonSlate]} onPress={onClose}><Text style={avatarBuilderStyles.chunkyButtonText}>Cancel</Text></TouchableOpacity>
                    <TouchableOpacity style={[avatarBuilderStyles.chunkyButton, avatarBuilderStyles.chunkyButtonGreen]} onPress={() => onSave(state)}><Text style={avatarBuilderStyles.chunkyButtonText}>Save</Text></TouchableOpacity>
                 </View>
            </View>
        </View>
    </View>
  );
}

// Removed web-specific asset loading (import.meta.glob) and exampleManifest
// The manifest should be provided as a prop or loaded via React Native's asset system.
// For demonstration, a simplified manifest structure is assumed.

export const exampleManifest: Manifest = [
    { key: "background", label: "Background", zIndex: 0, required: true, options: [{ id: "bg-1", name: "Background 1", src: require('../../public/asset/avatar-face/bg/1.png') }]},
    { key: "eyes", label: "Eyes", zIndex: 3, required: true, options: [{ id: "eyes-1", name: "Eyes 1", src: require('../../public/asset/avatar-face/eyes/1.png') }]},
    { key: "mouth", label: "Mouth", zIndex: 6, required: true, options: [{ id: "mouth-1", name: "Mouth 1", src: require('../../public/asset/avatar-face/mouth/1.png') }]},
    // Add more layers and options as needed, using require() for local assets
];

// Removed usePreloadedImages as it's web-specific. Image preloading should be handled in App.tsx
export function usePreloadedImages(urls: string[]) {
    const [loaded, setLoaded] = useState<Record<string, any>>({});
    useEffect(() => {
        const imageSources: Record<string, any> = {};
        urls.forEach(url => {
            // Assuming URLs are relative paths that can be resolved by require
            // This is a simplification; a more robust solution might involve a mapping
            // or a custom asset loading mechanism.
            try {
                imageSources[url] = Image.resolveAssetSource(require('../../public' + url));
            } catch (e) {
                console.warn(`Could not load image: ${url}`, e);
            }
        });
        setLoaded(imageSources);
    }, [urls]);
    return { loaded };
}

const avatarBuilderStyles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 50,
        padding: 16,
    },
    comicPanelWrapper: {
        // transform: [{ rotate: '0deg' }], // Example rotation
    },
    comicPanel: {
        backgroundColor: '#f8fafc', // bg-slate-50
        padding: 16, // p-4
        maxHeight: '90%', // max-h-[90vh]
        width: '100%',
        maxWidth: 960, // max-w-6xl
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    mainTitle: {
        fontSize: 28, // text-3xl
        fontWeight: 'bold', // font-black
        color: '#60a5fa', // blue-400
        marginBottom: 16, // mb-4
        textAlign: 'center',
    },
    mainContentGrid: {
        flexDirection: 'row',
        gap: 24, // gap-6
        // lg:grid-cols-2 - handled by flex direction and flex:1
    },
    previewColumn: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        gap: 16, // gap-4
    },
    controlsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8, // gap-2
        padding: 8, // p-2
        backgroundColor: '#f1f5f9', // bg-slate-100
        borderRadius: 12, // rounded-2xl
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
        backgroundColor: '#ec4899', // pink-500
        borderColor: '#db2777', // pink-600
    },
    chunkyButtonSlate: {
        backgroundColor: '#64748b', // slate-500
        borderColor: '#475569', // slate-600
    },
    chunkyButtonGreen: {
        backgroundColor: '#22c55e', // green-500
        borderColor: '#16a34a', // green-600
    },
    chunkyButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    seedInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4, // gap-1
    },
    seedLabel: {
        fontSize: 14, // text-sm
        fontWeight: 'bold',
    },
    seedInput: {
        paddingHorizontal: 12, // px-3
        paddingVertical: 8, // py-2
        borderRadius: 12, // rounded-xl
        borderWidth: 1,
        borderColor: '#e2e8f0', // border
        width: 80, // w-28
        backgroundColor: 'white',
    },
    layersColumn: {
        flex: 1,
        gap: 16, // gap-4
        maxHeight: '60%', // max-h-[60vh] lg:max-h-[65vh]
        overflow: 'scroll',
        paddingRight: 8, // pr-2
    },
    layerOptionContainer: {
        borderRadius: 12, // rounded-2xl
        borderWidth: 1,
        borderColor: '#e2e8f0', // border
        backgroundColor: 'white',
        padding: 12, // p-3
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2, // shadow-sm
        elevation: 1,
    },
    layerOptionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8, // mb-2
    },
    layerOptionTitle: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    noneButtonText: {
        fontSize: 14, // text-sm
        textDecorationLine: 'underline',
        color: '#64748b', // slate-500
    },
    optionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8, // gap-2
        // grid-cols-4 sm:grid-cols-6 - handled by flexWrap and width
    },
    optionButton: {
        position: 'relative',
        borderRadius: 12, // rounded-xl
        borderWidth: 2,
        overflow: 'hidden',
        aspectRatio: 1, // aspect-square
        width: '23%', // Approx for 4 cols with gap
        // focus:outline-none focus:ring-2 ring-offset-2 ring-blue-400 - not directly applicable
    },
    optionButtonSelected: {
        borderColor: '#3b82f6', // blue-500
        // ring-2 - not directly applicable
    },
    optionButtonNormal: {
        borderColor: '#e2e8f0', // slate-200
    },
    optionImage: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        resizeMode: 'contain', // object-contain
        // select-none pointer-events-none - not directly applicable
    },
    placeholderContainer: {
        width: '100%',
        height: '100%',
        backgroundColor: '#e2e8f0', // Example background
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        fontSize: 10,
        textAlign: 'center',
        color: '#64748b',
    },
    colorPickerContainer: {
        marginTop: 12, // mt-3
        paddingTop: 12, // pt-3
        borderTopWidth: 1,
        borderColor: '#e2e8f0', // border-t
    },
    colorPickerTitle: {
        fontSize: 14, // text-sm
        fontWeight: 'bold',
        marginBottom: 8, // mb-2
        color: '#475569', // slate-600
    },
    colorPalette: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8, // gap-2
    },
    colorSwatch: {
        width: 32, // w-8
        height: 32, // h-8
        borderRadius: 9999, // rounded-full
        borderWidth: 2,
        // transition-transform hover:scale-110 - not directly applicable
    },
    colorSwatchSelected: {
        borderColor: '#3b82f6', // blue-500
        // ring-2 ring-blue-400 - not directly applicable
    },
    footerButtonsContainer: {
        marginTop: 24, // mt-6
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 16, // gap-4
        borderTopWidth: 1,
        borderColor: '#e2e8f0', // border-t border-slate-200
        paddingTop: 16, // pt-4
    },
});
