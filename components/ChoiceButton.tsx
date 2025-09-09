import * as React from 'react';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { TouchableOpacity, StyleSheet } from 'react-native';

const ChoiceButton: React.FC<{onClick: () => void, disabled?: boolean, children: React.ReactNode}> = ({onClick, disabled, children}) => {
    const pressState = useSharedValue(0); // 0 for up, 1 for down

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: withTiming(pressState.value * 2, { duration: 75 }) }],
            borderBottomWidth: withTiming(4 - pressState.value * 2, { duration: 75 }),
        };
    });

    const handlePressIn = () => {
        if (!disabled) {
            pressState.value = 1;
        }
    };

    const handlePressOut = () => {
        if (!disabled) {
            pressState.value = 0;
        }
    };

    return (
        <TouchableOpacity onPress={onClick} onPressIn={handlePressIn} onPressOut={handlePressOut} disabled={disabled} activeOpacity={1}>
            <Animated.View style={[choiceButtonStyles.button, disabled && choiceButtonStyles.buttonDisabled, animatedStyle]}>
                {children}
            </Animated.View>
        </TouchableOpacity>
    );
};

export { ChoiceButton };

const choiceButtonStyles = StyleSheet.create({
    button: {
        backgroundColor: '#f1f5f9', // slate-100
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
        borderBottomWidth: 4,
        borderColor: '#e2e8f0', // slate-200
    },
    buttonDisabled: {
        opacity: 0.5,
        backgroundColor: '#e2e8f0', // slate-200
    },
});
