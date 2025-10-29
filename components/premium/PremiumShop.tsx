import React, { useState, useEffect, useCallback } from 'react';
import PremiumShopModal from '../PremiumShopModal';
import iapService, { PremiumProduct } from '../../services/iapService';
import { GameState, Language } from '../../core/types';

interface PremiumShopProps {
    isVisible: boolean;
    onClose: () => void;
    lang: Language;
    isIncomeDoubled: boolean;
    areAdsRemoved: boolean;
    onPurchaseSuccess: (productId: string) => void;
}

const PremiumShop: React.FC<PremiumShopProps> = React.memo(({
    isVisible,
    onClose,
    lang,
    isIncomeDoubled,
    areAdsRemoved,
    onPurchaseSuccess,
}) => {
    const [products, setProducts] = useState<PremiumProduct[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch products when the modal becomes visible
    useEffect(() => {
        if (isVisible) {
            setIsLoading(true);
            iapService.getProducts().then(fetchedProducts => {
                // Here you would also check against the gameState to set the initial `isPurchased` status
                const updatedProducts = fetchedProducts.map(p => ({
                    ...p,
                    isPurchased: p.id.includes('income') ? isIncomeDoubled : areAdsRemoved
                }));
                setProducts(updatedProducts);
                setIsLoading(false);
            });
        }
    }, [isVisible, isIncomeDoubled, areAdsRemoved]);

    const handlePurchase = useCallback(async (productId: string) => {
        setIsLoading(true);
        try {
            const success = await iapService.requestPurchase(productId);
            if (success) {
                console.log(`Purchase successful for ${productId}, updating game state...`);
                // Notify the main game engine to update the state
                onPurchaseSuccess(productId);
            }
        } catch (error) {
            console.error('Purchase failed:', error);
            // Optionally: show an error message to the user
        } finally {
            setIsLoading(false);
        }
    }, [onPurchaseSuccess]);

    return (
        <PremiumShopModal
            isVisible={isVisible}
            onClose={onClose}
            lang={lang}
            products={products}
            onPurchase={handlePurchase}
            isLoading={isLoading}
        />
    );
});

export default PremiumShop;