// services/BackgroundBaker.ts
import { getOrBakeVariantFromModule } from './ColorBaker.expo';
import { exampleManifest } from '../core/types';
import { AVATAR_COLOR_PALETTE } from '../core/constants';
import { imageAssets } from '../components/ImageAssets';

// Utility function to create a delay
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

let isBaking = false;

/**
 * Starts a low-priority background process to pre-bake all possible avatar
 * color variants. This ensures that when the user enters the character creator,
 * most options will load instantly from the cache.
 */
export async function startBackgroundBaking() {
  if (isBaking) {
    console.log("Background baking is already in progress.");
    return;
  }
  isBaking = true;
  console.log("Starting background baking process...");

  const colorableLayers = ['frontHair', 'backHair', 'eyebrows', 'beard', 'eyes', 'mouth'];

  try {
    // Iterate through each layer defined in the manifest
    for (const layer of exampleManifest) {
      // Check if the layer is one of the colorable types
      if (colorableLayers.includes(layer.key)) {
        // Iterate through all options for that layer (e.g., all hairstyles)
        for (const option of layer.options) {
          // For each option, iterate through the entire color palette
          for (const color of AVATAR_COLOR_PALETTE) {
            const moduleId = imageAssets[option.src];
            const colorHex = color.previewBackground;

            // Ensure we have a valid module ID and color before baking
            if (typeof moduleId === 'number' && colorHex) {
              // Calling getOrBake will automatically check the cache and only
              // bake if the variant doesn't already exist.
              await getOrBakeVariantFromModule(moduleId, colorHex);
              
              // Wait a short moment to yield to the main thread, preventing UI lag.
              await delay(50);
            }
          }
        }
      }
    }
  } catch (error) {
    console.error("An error occurred during background baking:", error);
  }

  console.log("Background baking process finished.");
  isBaking = false;
}
