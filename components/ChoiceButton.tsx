import * as React from 'react';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { TouchableOpacity, StyleSheet, GestureResponderEvent } from 'react-native';
import { colors, spacing } from './designSystem';
import { soundManager } from '../services/soundManager'; // Import sound manager

const ChoiceButton: React.FC<{onClick: () => void, disabled?: boolean, children: React.ReactNode}> = ({onClick, disabled, children}) => {
    const pressState = useSharedValue(0); // 0 for up, 1 for down

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { translateY: withTiming(pressState.value * 2, { duration: 75 }) },
                { scale: withTiming(1 - pressState.value * 0.02, { duration: 75 }) }
            ] as const,
            borderBottomWidth: withTiming(4 - pressState.value * 2, { duration: 75 }),
        };
    });

    const handlePressIn = () => {
        if (!disabled) {
            pressState.value = 1;
            soundManager.play('click'); // Phát âm thanh khi nhấn
        }
    };

    const handlePressOut = () => {
        if (!disabled) {
            pressState.value = 0;
        }
    };

    const handlePress = (event: GestureResponderEvent) => {
        if (!disabled) {
            onClick();
        }
    }

    return (
        <TouchableOpacity onPress={handlePress} onPressIn={handlePressIn} onPressOut={handlePressOut} disabled={disabled} activeOpacity={1}>
            <Animated.View style={[choiceButtonStyles.button, disabled && choiceButtonStyles.buttonDisabled, animatedStyle]}>
                {children}
            </Animated.View>
        </TouchableOpacity>
    );
};

export { ChoiceButton };

const choiceButtonStyles = StyleSheet.create({
    button: {
        backgroundColor: colors.neutral100,
        padding: spacing.md,
        borderRadius: spacing.sm,
        marginBottom: spacing.md,
        borderBottomWidth: 4,
        borderColor: colors.neutral200,
        minHeight: 44, // Cải thiện Accessibility: Đảm bảo vùng chạm đủ lớn
        justifyContent: 'center',
    },
    buttonDisabled: {
        backgroundColor: colors.neutral200,
        opacity: 0.5,
    },
});
