import React, { useMemo, useState, useEffect } from "react";
import { Image, StyleSheet, View, ImageSourcePropType, ViewStyle } from 'react-native';

import type { Manifest, LayerKey, Character, ColorDefinition, LayerDefinition } from '../core/types';
import { getOrBakeVariantFromModule } from '../services/ColorBaker.expo';
import { AVATAR_COLOR_PALETTE } from '../core/constants';

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

// Placeholder generation logic
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

const LayerImage: React.FC<{
    layer: LayerDefinition,
    optionId: string,
    stage: AgeStage,
    colorName?: string,
    manifest: Manifest,
    images: Record<string, ImageSourcePropType>,
    size: { width: number, height: number }
}> = React.memo(({ layer, optionId, stage, colorName, manifest, images, size }) => {
    LayerImage.displayName = 'LayerImage';
    const [source, setSource] = useState<ImageSourcePropType | null>(null);
    const [placeholder, setPlaceholder] = useState<string | null>(null);

    useEffect(() => {
        let isActive = true;

        const layerInfo = manifest.find(l => l.key === layer.key);
        if (!layerInfo) { setSource(null); return; }
        const option = layerInfo.options.find(o => o.id === optionId);
        if (!option) { setSource(null); return; }
        
        const optionName = option.name;
        const baseSrc = option.previewSrc || option.src;
        if (!baseSrc) {
            if (isActive) {
                setPlaceholder(`${layer.label}: ${optionName || 'N/A'}`);
                setSource(null);
            }
            return;
        }
        
        const moduleId = images[baseSrc] as number;

        const isColorable = ['frontHair', 'backHair', 'eyebrows', 'beard', 'eyes', 'mouth'].includes(layer.key);

        if (colorName && moduleId && isColorable) {
            const colorDef = (AVATAR_COLOR_PALETTE as ColorDefinition[]).find(c => c.name === colorName);
            if (colorDef) {
                getOrBakeVariantFromModule(moduleId, colorDef.base)
                    .then(uri => {
                        if (isActive) setSource({ uri });
                    })
                    .catch(err => {
                        console.error(`Failed to bake color for ${layer.key}:`, err);
                        if (isActive) setSource(moduleId); // Fallback to uncolored
                    });
            } else {
                if (isActive) setSource(moduleId); // Color not in palette, use uncolored
            }
        } else {
            const ageVariantSrc = createVariantSrc(baseSrc, stage);
            if (images[ageVariantSrc]) {
                if (isActive) setSource(images[ageVariantSrc]);
            } else {
                if (isActive) setSource(moduleId);
            }
        }
        
        if (isActive) setPlaceholder(null);

        return () => { isActive = false; };
    }, [layer, optionId, stage, colorName, manifest, images]);

    if (placeholder) {
        const placeholderUri = makePlaceholderSVG(size.width, size.height, placeholder);
        return <Image source={{ uri: placeholderUri }} style={ageAwareAvatarPreviewStyles.layerImage} />;
    }

    if (!source) {
        return null; // Loading
    }

    return <Image source={source} style={ageAwareAvatarPreviewStyles.layerImage} />;
});


interface Props {
  manifest: Manifest;
  images: Record<string, ImageSourcePropType>;
  character: Character;
  size: { width: number; height: number };
  style?: ViewStyle;
}

export const AgeAwareAvatarPreview: React.FC<Props> = React.memo((({ manifest, images, character, size, style }) => {
    AgeAwareAvatarPreview.displayName = 'AgeAwareAvatarPreview';
    const orderedLayers = useMemo(() => [...manifest].sort((a, b) => a.zIndex - b.zIndex), [manifest]);
    if (!character || !character.avatarState) {
        console.warn("AgeAwareAvatarPreview received undefined or null character or avatarState prop.");
        return null; 
    }

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
                    style={ageAwareAvatarPreviewStyles.staticImage}
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

            const colorName = state[`${layer.key}Color` as keyof typeof state] as string | undefined;

            return (
              <LayerImage
                key={`${layer.key}-${optionId}`}
                layer={layer}
                optionId={optionId as string}
                stage={stage}
                colorName={colorName}
                manifest={manifest}
                images={images}
                size={size}
              />
            );
        })}
      </View>
  );
}));

const ageAwareAvatarPreviewStyles = StyleSheet.create({
    container: {
        backgroundColor: '#e2e8f0',
        borderRadius: 16,
        elevation: 3,
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
        width: '100%',
    },
    staticImage: {
        height: '100%',
        left: 0,
        position: 'absolute',
        resizeMode: 'contain',
        top: 0,
        width: '100%',
    },
});