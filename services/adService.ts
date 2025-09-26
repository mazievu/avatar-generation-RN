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
const rewardedAdUnitId = 'ca-app-pub-3940256099942544/5224354917'; // Rewarded Ad
const interstitialAdUnitId = 'ca-app-pub-3940256099942544/1033173712'; // Interstitial Ad
const appOpenAdUnitId = 'ca-app-pub-3940256099942544/3419835294'; // App Open Ad

let rewardedAd: RewardedAd | null = null;
let interstitialAd: InterstitialAd | null = null;
let appOpenAd: AppOpenAd | null = null;
let onRewardCallback: (() => void) | null = null; // To store the callback for rewarded ads

const AD_COOLDOWN_MS = 5000; // 5 seconds cooldown
let lastInterstitialAdShownTime = 0;
let lastRewardedAdShownTime = 0;

let eventCounter = 0;
const eventsBeforeAd = 10;

const MAX_RETRY_COUNT = 3;
let rewardedAdRetryCount = 0;
let interstitialAdRetryCount = 0;
let appOpenAdRetryCount = 0;

const initializeAds = async () => {
  try {
    await mobileAds().initialize();
    console.log('AdMob initialized successfully');
    // Preload ads if necessary
    loadRewardedAd();
    loadInterstitialAd();
    // loadAppOpenAd(); // Temporarily disabled
  } catch (error) {
    console.error('Failed to initialize AdMob:', error);
  }
};

const loadRewardedAd = () => {
  if (rewardedAdRetryCount >= MAX_RETRY_COUNT) {
    console.log('Max retry count reached for Rewarded Ad. Stopping further attempts.');
    return;
  }
  rewardedAd = RewardedAd.createForAdRequest(rewardedAdUnitId, {
    requestNonPersonalizedAdsOnly: true, // For testing, or based on user consent
  });

  rewardedAd.addAdEventListener(RewardedAdEventType.LOADED, () => {
    console.log('Rewarded Ad loaded');
    rewardedAdRetryCount = 0; // Reset retry count on successful load
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
    rewardedAdRetryCount++; // Increment retry count
    loadRewardedAd(); // Try to load again on error
  });

  rewardedAd.load();
};

const loadInterstitialAd = () => {
  if (interstitialAdRetryCount >= MAX_RETRY_COUNT) {
    console.log('Max retry count reached for Interstitial Ad. Stopping further attempts.');
    return;
  }
  interstitialAd = InterstitialAd.createForAdRequest(interstitialAdUnitId, {
    requestNonPersonalizedAdsOnly: true, // For testing, or based on user consent
  });

  interstitialAd.addAdEventListener(AdEventType.LOADED, () => {
    console.log('Interstitial Ad loaded');
    interstitialAdRetryCount = 0; // Reset retry count on successful load
  });
  interstitialAd.addAdEventListener(AdEventType.CLOSED, () => {
    console.log('Interstitial Ad closed');
    loadInterstitialAd(); // Preload next interstitial ad
  });
  interstitialAd.addAdEventListener(AdEventType.ERROR, error => {
    console.error('Interstitial Ad error:', error);
    interstitialAdRetryCount++; // Increment retry count
    loadInterstitialAd(); // Try to load again on error
  });

  interstitialAd.load();
};

const loadAppOpenAd = () => {
  if (appOpenAdRetryCount >= MAX_RETRY_COUNT) {
    console.log('Max retry count reached for App Open Ad. Stopping further attempts.');
    return;
  }
  appOpenAd = AppOpenAd.createForAdRequest(appOpenAdUnitId, {
    requestNonPersonalizedAdsOnly: true, // For testing, or based on user consent
  });

  appOpenAd.addAdEventListener(AdEventType.LOADED, () => {
    console.log('App Open Ad loaded');
    appOpenAdRetryCount = 0; // Reset retry count on successful load
  });
  appOpenAd.addAdEventListener(AdEventType.CLOSED, () => {
    console.log('App Open Ad closed');
    loadAppOpenAd(); // Preload next app open ad
  });
  appOpenAd.addAdEventListener(AdEventType.ERROR, error => {
    console.error('App Open Ad error:', error);
    appOpenAdRetryCount++; // Increment retry count
    loadAppOpenAd(); // Try to load again on error
  });

  appOpenAd.load();
};


const showRewardedAd = async (callback: () => void) => { // Accept a callback
  const now = Date.now();
  if (now - lastRewardedAdShownTime < AD_COOLDOWN_MS) {
    console.log('Rewarded Ad is on cooldown. Skipping.');
    return;
  }

  onRewardCallback = callback; // Store the callback
  if (rewardedAd && rewardedAd.loaded) {
    rewardedAd.show();
    lastRewardedAdShownTime = now;
  } else {
    console.log('Rewarded Ad not loaded yet. Attempting to load...');
    loadRewardedAd(); // Try to load if not loaded
  }
};

const showInterstitialAd = async () => {
  const now = Date.now();
  if (now - lastInterstitialAdShownTime < AD_COOLDOWN_MS) {
    console.log('Interstitial Ad is on cooldown. Skipping.');
    return;
  }

  if (interstitialAd && interstitialAd.loaded) {
    interstitialAd.show();
    lastInterstitialAdShownTime = now;
  } else {
    console.log('Interstitial Ad not loaded yet. Attempting to load...');
    loadInterstitialAd(); // Try to load if not loaded
  }
};

const maybeShowInterstitialAd = () => {
  eventCounter++;
  if (eventCounter >= eventsBeforeAd) {
    showInterstitialAd();
    eventCounter = 0;
  }
};

const showAppOpenAd = async () => {
  console.log('App Open Ad is temporarily disabled.');
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
  showAppOpenAd,
  maybeShowInterstitialAd,
};