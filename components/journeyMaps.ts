import { LifePhase } from '../core/types';

/**
 * This file maps each LifePhase to a specific map for the journey animation.
 * 
 * --- HOW TO USE YOUR OWN MAPS ---
 * 1. Create your .png map images (e.g., journey_newborn.png, journey_elementary.png, etc.).
 * 2. Place them in the `assets/maps/` directory (you may need to create the `maps` folder).
 * 3. Uncomment the `require` lines below and delete the placeholder color strings.
 */

// Using simple colors as placeholders for now.
// Replace these strings with `require('../assets/maps/journey_newborn.png')` etc. when you have the assets.
export const journeyMaps: Record<LifePhase, string> = {
  [LifePhase.Newborn]: '#f8f9fa', // Placeholder color for Newborn
  [LifePhase.Elementary]: '#a2d2ff', // Placeholder color for Elementary
  [LifePhase.MiddleSchool]: '#bde0fe', // Placeholder color for MiddleSchool
  [LifePhase.HighSchool]: '#ffafcc', // Placeholder color for HighSchool
  [LifePhase.University]: '#fcf6bd', // Placeholder color for University
  [LifePhase.PostGraduation]: '#d3d3d3', // Placeholder color for PostGraduation (Work)
  [LifePhase.Retired]: '#e9ecef', // Placeholder color for Retired
};
