
import { Platform } from 'react-native';

// Define the structure for a premium product
export interface PremiumProduct {
  id: string;
  title: string;
  description: string;
  price: string;
  isPurchased: boolean;
}

// --- Mock IAP Service ---
// This is a placeholder to simulate a real IAP library like react-native-iap.

const mockProducts: PremiumProduct[] = [
  {
    id: Platform.OS === 'ios' ? 'com.yourapp.doubleincome' : 'double_income',
    title: 'premium_item_double_income_title', // Using localization keys
    description: 'premium_item_double_income_desc',
    price: '$4.99',
    isPurchased: false,
  },
  {
    id: Platform.OS === 'ios' ? 'com.yourapp.removeads' : 'remove_ads',
    title: 'premium_item_remove_ads_title',
    description: 'premium_item_remove_ads_desc',
    price: '$2.99',
    isPurchased: false,
  },
];

// Simulates fetching available products from the app store
const getProducts = async (): Promise<PremiumProduct[]> => {
  console.log('[IAPService] Fetching products...');
  // In a real app, you would call your IAP library's method to get products
  // For example: await RNIap.getProducts(productIds);
  return new Promise(resolve => {
    setTimeout(() => {
      console.log('[IAPService] Products fetched.');
      resolve(mockProducts);
    }, 1000);
  });
};

// Simulates initiating a purchase flow
const requestPurchase = async (productId: string): Promise<boolean> => {
  console.log(`[IAPService] Requesting purchase for ${productId}...`);
  // In a real app, you would call: await RNIap.requestPurchase(productId);
  return new Promise(resolve => {
    setTimeout(() => {
      console.log(`[IAPService] Purchase successful for ${productId}.`);
      // Find the product and mark it as purchased in our mock data
      const product = mockProducts.find(p => p.id === productId);
      if (product) {
        product.isPurchased = true;
      }
      resolve(true); // Simulate successful purchase
    }, 1500);
  });
};

// Simulates restoring previous purchases
const restorePurchases = async (): Promise<PremiumProduct[]> => {
    console.log('[IAPService] Restoring purchases...');
    // In a real app, you would call your IAP library's method to get available purchases.
    // This is important for users who reinstall the app or use a new device.
    return new Promise(resolve => {
        setTimeout(() => {
            console.log('[IAPService] Purchases restored.');
            // Return the updated list of products with their purchase status
            resolve(mockProducts.filter(p => p.isPurchased));
        }, 1000);
    });
};


const iapService = {
  getProducts,
  requestPurchase,
  restorePurchases,
};

export default iapService;
