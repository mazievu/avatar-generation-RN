import React, { useEffect, useMemo, useState } from "react";
import { LayerKey, Manifest, AvatarState, Character, Gender } from "../core/types";
import { LockClosedIcon } from './icons';
import { AVATAR_COLOR_PALETTE } from "../core/constants";

// =============================================
// Helpers
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

// Preload images - Exported for use in App.tsx
export function usePreloadedImages(urls: string[]) {
  const [loaded, setLoaded] = useState<Record<string, HTMLImageElement>>({});
  useEffect(() => {
    let cancelled = false;
    const cache: Record<string, HTMLImageElement> = {};
    let remaining = urls.length;
    if (remaining === 0) { setLoaded({}); return; }
    urls.forEach((u) => {
      if (!u) { remaining -= 1; if (remaining === 0) setLoaded(cache); return; }
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => { if (!cancelled) { cache[u] = img; if (--remaining === 0) setLoaded(cache);} };
      img.onerror = () => { if (!cancelled) { if (--remaining === 0) setLoaded(cache);} };
      img.src = u;
    });
    return () => { cancelled = true; };
  }, [JSON.stringify(urls.slice().sort())]);
  return { loaded };
}

// Draw to canvas with placeholder fallback
async function drawAvatarToCanvas(
  canvas: HTMLCanvasElement,
  manifest: Manifest,
  state: AvatarState,
  images: Record<string, HTMLImageElement>,
  size: { width: number; height: number }
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  canvas.width = size.width;
  canvas.height = size.height;
  ctx.clearRect(0, 0, size.width, size.height);
  const ordered = [...manifest].sort((a, b) => a.zIndex - b.zIndex);
  for (const layer of ordered) {
    const id = state[layer.key];
    if (!id && !layer.required) continue;
    if (id === null) continue;
    const opt = layer.options.find((o) => o.id === id);
    if (!opt) continue;
    const src = opt.src || opt.previewSrc || "";
    let img = images[src];
    if (!img && src) { // only create placeholder if src is defined but not loaded
      const url = makePlaceholderSVG(size.width, size.height, `${layer.label}: ${opt.name}`);
      img = await new Promise((resolve: (v: HTMLImageElement) => void) => {
        const i = new Image();
        i.onload = () => resolve(i);
        i.src = url;
      });
    }
     if (img) {
        const isHairLikeLayer = ['backHair', 'frontHair', 'eyebrows', 'beard'].includes(layer.key);
        let filter = 'none';
        if (isHairLikeLayer) {
            const colorName = state[`${layer.key}Color` as keyof AvatarState] as string | undefined;
            if (colorName) {
                filter = AVATAR_COLOR_PALETTE.find(c => c.name === colorName)?.filter || 'none';
            }
        }
        ctx.filter = filter;
        ctx.drawImage(img, 0, 0, size.width, size.height);
        ctx.filter = 'none'; // Reset filter for next layer
    }
  }
}

// =============================================
// AvatarPreview (stacked <img> with placeholders)
// =============================================
export function AvatarPreview({
  manifest,
  state,
  images,
  size = { width: 512, height: 512 },
}: {
  manifest: Manifest;
  state: AvatarState;
  images: Record<string, HTMLImageElement>;
  size?: { width: number; height: number };
}) {
  const ordered = useMemo(() => [...manifest].sort((a, b) => a.zIndex - b.zIndex), [manifest]);
  return (
    <div
      className="relative overflow-hidden rounded-2xl shadow-md bg-slate-200"
      style={{ width: size.width, height: size.height }}
    >
      {ordered.map((layer) => {
        const id = state[layer.key];
        if (!id && !layer.required) return null;
        if (id === null) return null;
        const opt = layer.options.find((o) => o.id === id);
        if (!opt) return null;
        const src = opt.previewSrc || opt.src;
        if (!src) return null; // Don't render anything for "none" options
        const hasImg = !!images[src];
        const displaySrc = hasImg ? src : makePlaceholderSVG(size.width, size.height, `${layer.label}: ${opt.name}`);

        const isHairLikeLayer = ['backHair', 'frontHair', 'eyebrows', 'beard'].includes(layer.key);
        let imageFilter = 'none';
        if (isHairLikeLayer) {
            const colorName = state[`${layer.key}Color` as keyof AvatarState] as string | undefined;
            if (colorName) {
                imageFilter = AVATAR_COLOR_PALETTE.find(c => c.name === colorName)?.filter || 'none';
            }
        }

        return (
          <img
            key={`${layer.key}:${id}`}
            src={displaySrc}
            alt={`${layer.label}: ${opt.name}`}
            className="absolute inset-0 w-full h-full object-contain select-none pointer-events-none"
            style={{ filter: imageFilter }}
            draggable={false}
          />
        );
      })}
    </div>
  );
}

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
    images: Record<string, HTMLImageElement>;
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

  async function exportPNG() {
    const canvas = document.createElement("canvas");
    const size = { width: 1024, height: 1024 };
    await drawAvatarToCanvas(canvas, manifest, state, images, size);
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `avatar-${Date.now()}.png`;
    a.click();
    URL.revokeObjectURL(url);
  }

    const renderLayerOptions = (layer: (typeof manifest)[0]) => {
    const options = getAgeAppropriateOptions(layer, characterAgeCategory);
    const isColorable = ['frontHair', 'eyebrows', 'beard'].includes(layer.key);
    let activeColorName: string | undefined;
    if (layer.key === 'frontHair') activeColorName = state.frontHairColor;
    if (layer.key === 'eyebrows') activeColorName = state.eyebrowsColor;
    if (layer.key === 'beard') activeColorName = state.beardColor;

    return (
      <div key={layer.key} className="rounded-2xl border bg-white p-3 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">{layer.label}</h3>
          {layer.allowNone && (
            <button className="text-sm underline text-slate-500 hover:text-slate-800" onClick={() => setLayer(layer.key, null)}>None</button>
          )}
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {options.map((opt) => {
            const selected = state[layer.key] === opt.id;
            const src = opt.previewSrc || opt.src;
            if (!src) return null;
            const hasImg = !!images[src];
            const displaySrc = hasImg ? src : makePlaceholderSVG(64, 64, opt.name);

            return (
              <button
                key={opt.id}
                className={`relative rounded-xl border-2 overflow-hidden aspect-square focus:outline-none focus:ring-2 ring-offset-2 ring-blue-400 ${selected ? "border-blue-500 ring-2" : "border-slate-200"}`}
                title={opt.name}
                onClick={() => setLayer(layer.key, opt.id)}
              >
                <img src={displaySrc} alt={opt.name} className="absolute inset-0 w-full h-full object-contain" style={{filter: layer.key === 'eyebrows' ? 'brightness(0.2) grayscale(1)' : 'none'}} draggable={false} />
              </button>
            );
          })}
        </div>
        {isColorable && state[layer.key] && (
            <div className="mt-3 pt-3 border-t">
                <h4 className="text-sm font-semibold mb-2 text-slate-600">Color</h4>
                <div className="flex flex-wrap gap-2">
                    {AVATAR_COLOR_PALETTE.map(color => (
                        <button
                            key={color.name}
                            title={color.name}
                            onClick={() => setColorForLayer(layer.key, color.name)}
                            className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${activeColorName === color.name ? 'border-blue-500 ring-2 ring-blue-400' : 'border-white'}`}
                            style={{ backgroundColor: color.previewBackground }}
                        />
                    ))}
                </div>
            </div>
        )}
      </div>
    );
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div className="comic-panel-wrapper" style={{'--rotate': '0deg'} as React.CSSProperties} onClick={e => e.stopPropagation()}>
            <div className="comic-panel p-4 bg-slate-50 max-h-[90vh] overflow-y-auto w-full max-w-6xl">
                <h2 className="text-3xl font-black text-blue-400 mb-4 text-center">Customize Avatar</h2>
                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="flex flex-col items-center gap-4">
                    <AvatarPreview manifest={manifest} state={state} images={images} size={{width: 512, height: 512}} />
                    <div className="flex items-center gap-2 flex-wrap justify-center p-2 bg-slate-100 rounded-2xl">
                      <button className="chunky-button chunky-button-pink" onClick={randomize}>Randomize</button>
                      <button className="chunky-button chunky-button-slate" onClick={exportPNG}>Export PNG</button>
                      <div className="flex items-center gap-1">
                        <label className="text-sm font-bold">Seed</label>
                        <input className="px-3 py-2 rounded-xl border w-28" value={seed} onChange={(e) => setSeed(parseInt(e.target.value || "0", 10) || 0)} />
                      </div>
                    </div>
                  </div>
            
                  <div className="grid gap-4 content-start max-h-[60vh] lg:max-h-[65vh] overflow-y-auto pr-2">
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
                  </div>
                </div>
                 <div className="mt-6 flex justify-center gap-4 border-t border-slate-200 pt-4">
                    <button className="chunky-button chunky-button-slate" onClick={onClose}>Cancel</button>
                    <button className="chunky-button chunky-button-green" onClick={() => onSave(state)}>Save</button>
                 </div>
            </div>
        </div>
    </div>
  );
}
// Định nghĩa kiểu chung cho layer
type LayerOption = {
  id: string;
  name: string;
  src: string;
  ageCategory?: 'baby' | 'normal' | 'old';
};

// Helper lấy tên file
const baseName = (path: string) =>
  path.split('/').pop()!.replace(/\.(png|webp)$/i, '');

// Backgrounds
const backgroundOptions: LayerOption[] = Object.entries(
  import.meta.glob('../src/asset/avatar-face/bg/*.{png,webp}', {
    eager: true,
    query: '?url', import: 'default'
  })
).map(([path, src]) => {
  const name = baseName(path);
  return { id: `bg-${name}`, name: `Background ${name}`, src: src as string };
});

// Back Hair
const backHairOptions: LayerOption[] = Object.entries(
  import.meta.glob('../src/asset/avatar-face/hair/back/*.{png,webp}', {
    eager: true,
    query: '?url', import: 'default'
  })
).map(([path, src]) => {
  const name = baseName(path);
  return { id: `${name}bh`, name, src: src as string };
});

// Eyes
const eyesOptions: LayerOption[] = Object.entries(
  import.meta.glob('../src/asset/avatar-face/eyes/*.{png,webp}', {
    eager: true,
    query: '?url', import: 'default'
  })
).map(([path, src]) => {
  const name = baseName(path);
  return { id: `${name}e`, name, src: src as string };
});

// Eyebrows
const eyebrowsOptions: LayerOption[] = Object.entries(
  import.meta.glob('/src/asset/avatar-face/eyebrows/*.{png,webp}', {
    eager: true,
    query: '?url', import: 'default'
  })
).map(([path, src]) => {
  const name = baseName(path);
  return { id: `${name}eb`, name, src: src as string };
});

// Mouth
const mouthOptions: LayerOption[] = Object.entries(
  import.meta.glob('/src/asset/avatar-face/mouth/*.{png,webp}', {
    eager: true,
    query: '?url', import: 'default'
  })
).map(([path, src]) => {
  const name = baseName(path);
  return { id: `${name}m`, name, src: src as string };
});

// Beard
const beardOptions: LayerOption[] = Object.entries(
  import.meta.glob('/src/asset/avatar-face/beard/*.{png,webp}', {
    eager: true,
    query: '?url', import: 'default'
  })
).map(([path, src]) => {
  const name = baseName(path);
  return { id: `${name}b`, name, src: src as string };
});

// Front Hair
const frontHairOptions: LayerOption[] = Object.entries(
  import.meta.glob('/src/asset/avatar-face/hair/front/*.{png,webp}', {
    eager: true,
    query: '?url', import: 'default'
  })
).map(([path, src]) => {
  const name = baseName(path);
  return { id: `${name}fh`, name, src: src as string };
});

// Features (có subfolder: baby / normal / old / ...)
const featureOptions: LayerOption[] = Object.entries(
  import.meta.glob('/src/asset/avatar-face/features/**/*.{png,webp}', {
    eager: true,
    query: '?url', import: 'default'
  })
).map(([path, src]) => {
  const parts = path.split('/');
  const ageCategory = parts[parts.length - 2] as 'baby' | 'normal' | 'old';
  const n = baseName(path);

  const name = n
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase());

  return { id: `feat-${n}`, name, src: src as string, ageCategory };
});

export const exampleManifest: Manifest = [
  { key: "background", label: "Background", zIndex: 0, required: true, options: backgroundOptions},
  { key: "backHair", label: "Hair (Back)", zIndex: 1, allowNone: true, required: false, options: backHairOptions},
  { key: "features", label: "Face Features", zIndex: 2, allowNone: false, required: false, options: featureOptions},
  { key: "eyes", label: "Eyes", zIndex: 3, required: true, options: eyesOptions},
  { key: "eyebrows", label: "Eyebrows", zIndex: 4, allowNone: true, required: false, options: eyebrowsOptions},
  { key: "mouth", label: "Mouth", zIndex: 6, required: true, options: mouthOptions},
  { key: "beard", label: "Beard", zIndex: 5, allowNone: true, required: false, options: beardOptions},
  { key: "frontHair", label: "Hair (Front)", zIndex: 7, allowNone: true, required: false, options: frontHairOptions},
];