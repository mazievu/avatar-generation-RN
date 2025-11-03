import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import ModalBase from './ModalBase';
import { Language } from '../core/types';
import { t } from '../core/localization';
import { PremiumProduct } from '../services/iapService'; // Import the new type

interface PremiumShopModalProps {
    isVisible: boolean;
    onClose: () => void;
    lang: Language;
    products: PremiumProduct[];
    onPurchase: (productId: string) => void;
    isLoading: boolean;
}

const PremiumShopModal: React.FC<PremiumShopModalProps> = ({
    isVisible,
    onClose,
    lang,
    products,
    onPurchase,
    isLoading,
}) => {
    return (
        <ModalBase
            isVisible={isVisible}
            onClose={onClose}
            title={t('premium_shop_title', lang)}
            contentContainerStyle={styles.modalContentContainer} // Apply style here
        >
            <View style={styles.container}>
                {isLoading && (
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="large" color="#f59e0b" />
                    </View>
                )}
                <Text style={styles.shopDescription}>{t('premium_shop_description', lang)}</Text>

                {products.map(product => (
                    <View key={product.id} style={styles.itemContainer}>
                        <View style={styles.itemDetails}>
                            <Text style={styles.itemTitle}>{t(product.title as any, lang)}</Text>
                            <Text style={styles.itemDescription}>{t(product.description as any, lang)}</Text>
                        </View>
                        <TouchableOpacity
                            style={[styles.buyButton, product.isPurchased && styles.disabledButton]}
                            disabled={product.isPurchased || isLoading}
                            onPress={() => onPurchase(product.id)}
                        >
                            <Text style={styles.buyButtonText}>
                                {product.isPurchased ? t('premium_item_purchased', lang) : product.price}
                            </Text>
                        </TouchableOpacity>
                    </View>
                ))}
            </View>
        </ModalBase>
    );
};

const styles = StyleSheet.create({
    modalContentContainer: {
        maxHeight: '80%', // Limit content height
        overflow: 'scroll', // Enable scrolling
    },
    container: {
        padding: 20,
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12, // Match ModalBase content radius
        zIndex: 10,
    },
    shopDescription: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 24,
        color: '#4b5563',
    },
    itemContainer: {
        backgroundColor: '#f3f4f6',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    itemDetails: {
        flex: 1,
        marginRight: 12,
    },
    itemTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    itemDescription: {
        fontSize: 14,
        color: '#6b7280',
        marginTop: 4,
    },
    buyButton: {
        backgroundColor: '#f59e0b', // amber-500
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
        minWidth: 80, // Ensure button has a minimum width
        alignItems: 'center',
    },
    buyButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    disabledButton: {
        backgroundColor: '#9ca3af', // gray-400
    },
});

export default PremiumShopModal;