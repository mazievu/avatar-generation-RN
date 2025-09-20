import React, { useMemo } from "react";
import { Image, StyleSheet, View, ImageSourcePropType, ViewStyle } from 'react-native';


import type { Manifest, LayerKey, Character } from '../core/types';


type AgeStage = 'baby' | 'child' | 'teen' | 'adult' | 'elder';


function ageStageFromAge(age: number): AgeStage {
  if (age <= 3) return 'baby';
  if (age <= 12) return 'child';
  if (age <= 19) return 'teen';
  if (age <= 59) return 'adult';
  return 'elder';
}

// Helper to construct variant src from base src
function createVariantSrc(baseSrc: string, variant: string): string {
    const parts = baseSrc.split('.');
    const extension = parts.pop();
    const basePath = parts.join('.');
    return `${basePath}__${variant}.${extension}`;
}

// Function to find the best available variant source URL
function getVariantSrc(
    optionId: string | null | undefined,
    layerKey: LayerKey,
    stage: AgeStage,
    manifest: Manifest,
    images: Record<string, ImageSourcePropType>
): { src: ImageSourcePropType | undefined, name: string | undefined } {
    if (!optionId) return { src: undefined, name: undefined };
    
    const layer = manifest.find(l => l.key === layerKey);
    if (!layer) return { src: undefined, name: undefined };
    const option = layer.options.find(o => o.id === optionId);
    if (!option) return { src: undefined, name: undefined };

    const baseSrc = option.previewSrc || option.src;
    if (!baseSrc) return { src: undefined, name: option.name };

    const ageVariantSrc = createVariantSrc(baseSrc, stage);
    if (images[ageVariantSrc]) {
        return { src: images[ageVariantSrc], name: option.name };
    }
    if (images[baseSrc]) {
        return { src: images[baseSrc], name: option.name };
    }

    return { src: undefined, name: option.name };
}

// Placeholder generation logic, adapted from AvatarBuilder
function hashString(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
  }
  return h >>> 0;
}

function colorFrom(text: string) {
  const h = hashString(text);
  const hue = h % 360;
  const sat = 45 + (h % 30);
  const light = 45 + (Math.floor(h / 360) % 20);
  return `hsl(${hue} ${sat}% ${light}%)`;
}

function makePlaceholderSVG(width: number, height: number, label: string) {
  const bg = colorFrom(label + "bg");
  const fg = "#ffffff";
  const svg = `<?xml version='1.0' encoding='UTF-8'?>
  <svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}'>
    <defs>
      <pattern id='grid' width='16' height='16' patternUnits='userSpaceOnUse'>
        <rect width='16' height='16' fill='${bg}' opacity='0.25'/>
        <path d='M16 0 L0 0 0 16' stroke='${fg}' stroke-opacity='0.15' stroke-width='1'/>
      </pattern>
    </defs>
    <rect width='100%' height='100%' fill='url(#grid)'/>
    <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='28' fill='${fg}' fill-opacity='0.75'>${label}</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}


interface Props {
  manifest: Manifest;
  images: Record<string, ImageSourcePropType>;
  character: Character;
  size: { width: number; height: number };
  style?: ViewStyle; // Added
}

export const AgeAwareAvatarPreview: React.FC<Props> = ({ manifest, images, character, size, style }) => {
    if (!character || !character.avatarState) {
        console.warn("AgeAwareAvatarPreview received undefined or null character or avatarState prop.");
        return null; 
    }
    const orderedLayers = useMemo(() => [...manifest].sort((a, b) => a.zIndex - b.zIndex), [manifest]);

    // Handle static avatars for specific characters (e.g., Mila's family)
    if (character.staticAvatarUrl) {
        return (
            <View
                style={[
                    ageAwareAvatarPreviewStyles.container,
                    { width: size.width, height: size.height },
                    style
                ]}
            >
                <Image
                    source={character.staticAvatarUrl}
                    // alt={character.name} is not a prop in RN Image
                    style={ageAwareAvatarPreviewStyles.staticImage}
                    // draggable={false} is not a prop in RN Image
                />
            </View>
        );
    }

  const { age, avatarState: state } = character;
  const stage = ageStageFromAge(age);
  

  return (
      <View
        style={[
            ageAwareAvatarPreviewStyles.container,
            { width: size.width, height: size.height },
            style
        ]}
      >
        {orderedLayers.map((layer) => {
            const optionId = state[layer.key];
            if (!optionId && !layer.required) return null;
            if (optionId === null) return null;

            const { src: displaySrc, name: optionName } = getVariantSrc(optionId, layer.key, stage, manifest, images);

            // BƯỚC 1: XÓA DÒNG `if` GÂY LỖI BÊN DƯỚI
            // if (!displaySrc) return null; 

            // BƯỚC 2: SỬA LẠI LOGIC TÍNH `finalSrc` ĐỂ LUÔN TẠO RA SOURCE HỢP LỆ
            const finalSrc = displaySrc 
                ? displaySrc 
                : { uri: makePlaceholderSVG(size.width, size.height, `${layer.label}: ${optionName || 'N/A'}`) };
            
            // Image filters are not directly supported in React Native Image component.
            // Consider using a third-party library for image manipulation if complex filters are needed.
            // For now, the filter property is removed.

            return (
              <Image
                key={`${layer.key}-${optionId}`}
                source={finalSrc}
                // alt={layer.label} is not a prop in RN Image
                style={ageAwareAvatarPreviewStyles.layerImage}
                // draggable={false} is not a prop in RN Image
              />
            );
        })}
      </View>
  );
};

const ageAwareAvatarPreviewStyles = StyleSheet.create({
    container: {
        backgroundColor: '#e2e8f0', // bg-slate-200
        borderRadius: 16, // rounded-2xl (assuming 2xl is 16px radius)
        elevation: 3, // shadow-md
        overflow: 'hidden',
        position: 'relative',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    layerImage: {
        height: '100%',
        left: 0,
        position: 'absolute',
        resizeMode: 'contain',
        top: 0,
        width: '100%', // object-contain
        // select-none pointer-events-none are not direct RN styles
    },
    staticImage: {
        height: '100%',
        left: 0,
        position: 'absolute',
        resizeMode: 'contain',
        top: 0,
        width: '100%', // object-contain
        // select-none pointer-events-none are not direct RN styles
    },
});