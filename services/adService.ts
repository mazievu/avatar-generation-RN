// services/adService.ts
import mobileAds, {
  RewardedAd,
  InterstitialAd,
  AppOpenAd,
  AdEventType,
  RewardedAdEventType,
} from 'react-native-google-mobile-ads';

// Replace with your actual AdMob ad unit IDs
// For testing, you can use Google's test ad unit IDs:
// Rewarded: ca-app-pub-3940256099942544/5224354917
// Interstitial: ca-app-pub-3940256099942544/1033173712
// App Open: ca-app-pub-3940256099942544/3419835294
const rewardedAdUnitId = 'ca-app-pub-5890106170626370/6179367010'; // Rewarded Ad
const interstitialAdUnitId = 'ca-app-pub-5890106170626370/4555842898'; // Interstitial Ad
const appOpenAdUnitId = 'ca-app-pub-5890106170626370/2638759012'; // App Open Ad

let rewardedAd: RewardedAd | null = null;
let interstitialAd: InterstitialAd | null = null;
let appOpenAd: AppOpenAd | null = null;
let onRewardCallback: (() => void) | null = null; // To store the callback for rewarded ads

const initializeAds = async () => {
  try {
    await mobileAds().initialize();
    console.log('AdMob initialized successfully');
    // Preload ads if necessary
    loadRewardedAd();
    loadInterstitialAd();
    loadAppOpenAd();
  } catch (error) {
    console.error('Failed to initialize AdMob:', error);
  }
};

const loadRewardedAd = () => {
  rewardedAd = RewardedAd.createForAdRequest(rewardedAdUnitId, {
    requestNonPersonalizedAdsOnly: true, // For testing, or based on user consent
  });

  rewardedAd.addAdEventListener(RewardedAdEventType.LOADED, () => {
    console.log('Rewarded Ad loaded');
  });
  rewardedAd.addAdEventListener(RewardedAdEventType.EARNED_REWARD, reward => {
    console.log('User earned reward of ', reward);
    if (onRewardCallback) {
      onRewardCallback(); // Trigger the stored callback
      onRewardCallback = null; // Clear the callback after use
    }
  });
  rewardedAd.addAdEventListener(AdEventType.CLOSED, () => {
    console.log('Rewarded Ad closed');
    onRewardCallback = null; // Clear callback on close
    loadRewardedAd(); // Preload next rewarded ad
  });
  rewardedAd.addAdEventListener(AdEventType.ERROR, error => {
    console.error('Rewarded Ad error:', error);
    onRewardCallback = null; // Clear callback on error
    loadRewardedAd(); // Try to load again on error
  });

  rewardedAd.load();
};

const loadInterstitialAd = () => {
  interstitialAd = InterstitialAd.createForAdRequest(interstitialAdUnitId, {
    requestNonPersonalizedAdsOnly: true, // For testing, or based on user consent
  });

  interstitialAd.addAdEventListener(AdEventType.LOADED, () => {
    console.log('Interstitial Ad loaded');
  });
  interstitialAd.addAdEventListener(AdEventType.CLOSED, () => {
    console.log('Interstitial Ad closed');
    loadInterstitialAd(); // Preload next interstitial ad
  });
  interstitialAd.addAdEventListener(AdEventType.ERROR, error => {
    console.error('Interstitial Ad error:', error);
    loadInterstitialAd(); // Try to load again on error
  });

  interstitialAd.load();
};

const loadAppOpenAd = () => {
  appOpenAd = AppOpenAd.createForAdRequest(appOpenAdUnitId, {
    requestNonPersonalizedAdsOnly: true, // For testing, or based on user consent
  });

  appOpenAd.addAdEventListener(AdEventType.LOADED, () => {
    console.log('App Open Ad loaded');
  });
  appOpenAd.addAdEventListener(AdEventType.CLOSED, () => {
    console.log('App Open Ad closed');
    loadAppOpenAd(); // Preload next app open ad
  });
  appOpenAd.addAdEventListener(AdEventType.ERROR, error => {
    console.error('App Open Ad error:', error);
    loadAppOpenAd(); // Try to load again on error
  });

  appOpenAd.load();
};


const showRewardedAd = async (callback: () => void) => { // Accept a callback
  onRewardCallback = callback; // Store the callback
  if (rewardedAd && rewardedAd.isLoaded()) {
    rewardedAd.show();
  } else {
    console.log('Rewarded Ad not loaded yet. Attempting to load...');
    loadRewardedAd(); // Try to load if not loaded
  }
};

const showInterstitialAd = async () => {
  if (interstitialAd && interstitialAd.isLoaded()) {
    interstitialAd.show();
  } else {
    console.log('Interstitial Ad not loaded yet. Attempting to load...');
    loadInterstitialAd(); // Try to load if not loaded
  }
};

const showAppOpenAd = async () => {
  if (appOpenAd && appOpenAd.isLoaded()) {
    appOpenAd.show();
  } else {
    console.log('App Open Ad not loaded yet. Attempting to load...');
    loadAppOpenAd(); // Try to load if not loaded
  }
};

// Placeholder for banner ad, not implemented with AdMob logic yet
const showBannerAd = () => {
  console.log('Showing banner ad (placeholder)');
};


export const adService = {
  initializeAds,
  showBannerAd,
  showInterstitialAd,
  showRewardedAd,
  showAppOpenAd, // Export the new app open ad function
};