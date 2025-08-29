import React, { useMemo } from "react";
import type { Manifest, AvatarState, LayerKey, Character } from '../types';
import { AVATAR_COLOR_PALETTE } from "../constants";

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
    images: Record<string, HTMLImageElement>
): { src: string | undefined, name: string | undefined } {
    if (!optionId) return { src: undefined, name: undefined };
    
    const layer = manifest.find(l => l.key === layerKey);
    if (!layer) return { src: undefined, name: undefined };
    const option = layer.options.find(o => o.id === optionId);
    if (!option) return { src: undefined, name: undefined };

    const baseSrc = option.previewSrc || option.src;
    if (!baseSrc) return { src: undefined, name: option.name };

    const ageVariantSrc = createVariantSrc(baseSrc, stage);
    if (images[ageVariantSrc]) {
        return { src: ageVariantSrc, name: option.name };
    }

    return { src: baseSrc, name: option.name };
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
  images: Record<string, HTMLImageElement>;
  character: Character;
  size: { width: number; height: number };
}

export const AgeAwareAvatarPreview: React.FC<Props> = ({ manifest, images, character, size }) => {
    // Handle static avatars for specific characters (e.g., Mila's family)
    if (character.staticAvatarUrl) {
        return (
            <div
                className="relative overflow-hidden rounded-2xl shadow-md bg-slate-200"
                style={{ width: size.width, height: size.height }}
            >
                <img
                    src={character.staticAvatarUrl}
                    alt={character.name}
                    className="absolute inset-0 w-full h-full object-contain select-none pointer-events-none"
                    draggable={false}
                />
            </div>
        );
    }

  const { age, avatarState: state } = character;
  const stage = ageStageFromAge(age);
  const orderedLayers = useMemo(() => [...manifest].sort((a, b) => a.zIndex - b.zIndex), [manifest]);

  return (
      <div
        className="relative overflow-hidden rounded-2xl shadow-md bg-slate-200"
        style={{ width: size.width, height: size.height }}
      >
        {orderedLayers.map((layer) => {
            const optionId = state[layer.key];
            if (!optionId && !layer.required) return null;
            if (optionId === null) return null;

            const { src: displaySrc, name: optionName } = getVariantSrc(optionId, layer.key, stage, manifest, images);

            if (!displaySrc) return null;

            const finalSrc = images[displaySrc] ? displaySrc : makePlaceholderSVG(size.width, size.height, `${layer.label}: ${optionName}`);
            
            const isElder = stage === 'elder';
            const isHairLikeLayer = layer.key === 'backHair' || layer.key === 'frontHair' || layer.key === 'eyebrows' || layer.key === 'beard';
            
            let imageFilter = 'none';

            if (isElder && isHairLikeLayer) {
                // Force white/silver hair for elders, overriding selected color
                imageFilter = AVATAR_COLOR_PALETTE.find(c => c.name === 'White')?.filter || 'grayscale(1) brightness(2.5)';
            } else if (isHairLikeLayer) {
                const colorKey = `${layer.key}Color` as keyof AvatarState;
                const colorName = state[colorKey] as string | undefined;
                if(colorName) {
                    imageFilter = AVATAR_COLOR_PALETTE.find(c => c.name === colorName)?.filter || 'none';
                }
            }

            return (
              <img
                key={`${layer.key}-${optionId}`}
                src={finalSrc}
                alt={layer.label}
                className="absolute inset-0 w-full h-full object-contain select-none pointer-events-none"
                style={{ filter: imageFilter }}
                draggable={false}
              />
            );
        })}
      </div>
  );
};