import { ImageSourcePropType } from 'react-native';
import { Character, LifePhase, PurchasedAsset, GameEvent } from '../core/types';

const journeyMapImages = {
  school2: require('../assets/journeymaps/School_2.webp'),
  school3: require('../assets/journeymaps/School_3.webp'),
  company1: require('../assets/journeymaps/company_1.webp'),
  company2: require('../assets/journeymaps/company_2.webp'),
  company3: require('../assets/journeymaps/company_3.webp'),
  house1: require('../assets/journeymaps/House_1.webp'),
  house2: require('../assets/journeymaps/House_2.webp'),
  house3: require('../assets/journeymaps/House_3.webp'),
};

export function getJourneyMapImage(
  character: Character,
  purchasedAssets: Record<string, PurchasedAsset>,
  event: GameEvent | null
): ImageSourcePropType | string {

  const getHousingImage = () => {
    if (purchasedAssets['housing_3']) return journeyMapImages.house3;
    if (purchasedAssets['housing_2']) return journeyMapImages.house2;
    if (purchasedAssets['housing_1']) return journeyMapImages.house1;
    return journeyMapImages.house1; // Default house
  }

  // If it's not a milestone event, it's a "life event", show housing.
  if (event && !event.isMilestone) {
    return getHousingImage();
  }

  // Otherwise, it's a "phase event" (or we don't have event info)
  switch (character.phase) {
    case LifePhase.Newborn:
    case LifePhase.Retired:
      return getHousingImage();

    case LifePhase.Elementary:
    case LifePhase.MiddleSchool:
      return journeyMapImages.school2;

    case LifePhase.HighSchool:
    case LifePhase.University:
      return journeyMapImages.school3;

    case LifePhase.PostGraduation:
      return journeyMapImages.company1;

    default:
      return '#d3d3d3';
  }
}