// components/StatBar.tsx
import * as React from 'react';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing, useAnimatedProps, withSequence, runOnJS, withDelay } from 'react-native-reanimated';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { IqIcon, HappinessIcon, EqIcon, HealthIcon, SkillIcon, MoneyIcon } from './icons'; // Assuming these are needed for StatBar or its related components
import type { Stats, Language } from '../core/types'; // Assuming these types are needed

interface StatBarProps {
  Icon: React.ElementType;
  value: number; // This will be the FINAL value
  max: number;
  label: string;
  color: string;
  // Optional for animation
  initialValue?: number;
}

// Particle type definition
type Particle = {
  id: number;
  type: 'sparkle' | 'smoke';
  style: object; // Changed from React.CSSProperties to object
};

const Particle: React.FC<{ onAnimationComplete: () => void, type: 'sparkle' | 'smoke' }> = ({ onAnimationComplete, type }) => {
    const opacity = useSharedValue(1);
    const translateY = useSharedValue(0);
    const translateX = useSharedValue((Math.random() - 0.5) * 40);
    const scale = useSharedValue(1);

    React.useEffect(() => {
        const randomDelay = Math.random() * 300;
        opacity.value = withDelay(randomDelay, withTiming(0, { duration: 700 }));
        translateY.value = withDelay(randomDelay, withTiming(-50, { duration: 1000, easing: Easing.out(Easing.quad) }));
        scale.value = withDelay(randomDelay, withTiming(0.5, { duration: 1000 }));
        
        const timer = setTimeout(() => {
            runOnJS(onAnimationComplete)();
        }, 1000 + randomDelay);
        
        return () => clearTimeout(timer);
    }, [onAnimationComplete, opacity, scale, translateX, translateY]);

    const animatedStyle = useAnimatedStyle(() => {
        const transform: any = [
            { translateX: translateX.value },
            { translateY: translateY.value },
            { scale: scale.value },
        ];
        return {
            opacity: opacity.value,
            transform,
        };
    });

    const particleStyle = type === 'sparkle' ? statBarStyles.sparkleParticle : statBarStyles.smokeParticle;

    return <Animated.View style={[statBarStyles.particleBase, particleStyle, animatedStyle]} />;
};

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

export const StatBar: React.FC<StatBarProps> = ({ Icon, value, max, label, color, initialValue }) => {
    const isAnimated = typeof initialValue === 'number' && initialValue !== value;
    const progress = useSharedValue(isAnimated ? initialValue : value);
    const [particles, setParticles] = React.useState<{ id: number; type: 'sparkle' | 'smoke' }[]>([]);

    React.useEffect(() => {
        if (isAnimated) {
            progress.value = withTiming(value, { duration: 800, easing: Easing.out(Easing.quad) });
            const change = value - (initialValue ?? value);
            if (change !== 0) {
                const numParticles = Math.min(Math.abs(Math.round(change)), 8);
                const particleType: 'sparkle' | 'smoke' = change > 0 ? 'sparkle' : 'smoke';
                const newParticles = Array.from({ length: numParticles }, () => ({ id: Math.random(), type: particleType }));
                setParticles(p => [...p, ...newParticles]);
            }
        } else {
            progress.value = value;
        }
    }, [value, isAnimated, progress]);

    const animatedStyle = useAnimatedStyle(() => ({
        width: `${(progress.value / max) * 100}%`,
    }));

    const removeParticle = (id: number) => {
        setParticles(currentParticles => currentParticles.filter(p => p.id !== id));
    };

    if (!isAnimated) {
        const displayValue = Math.round(value);
        return (
            <View style={statBarStyles.container}>
                <Icon />
                <Text style={statBarStyles.label}>{label}</Text>
                <View style={statBarStyles.barBackground}>
                    <View style={[statBarStyles.barFill, { width: `${(value / max) * 100}%`, backgroundColor: color }]} />
                </View>
                <Text style={statBarStyles.value}>{displayValue}</Text>
            </View>
        );
    }

    // Animated StatBar for the Event Outcome Modal
    const animatedFinalValueProps = useAnimatedProps(() => ({
        value: `${Math.round(progress.value)}`
    }));

    const animatedChangeProps = useAnimatedProps(() => {
        const change = Math.round(progress.value) - Math.round(initialValue || 0);
        return {
            value: `(${change >= 0 ? '+' : ''}${change})`
        };
    });

    const animatedColorStyle = useAnimatedStyle(() => {
        const change = progress.value - (initialValue || 0);
        return {
            color: change >= 0 ? '#22c55e' : '#ef4444', // green-500 or red-500
        };
    });

    const animatedBarFillStyle = useAnimatedStyle(() => ({
        backgroundColor: progress.value >= (initialValue || 0) ? '#4ade80' : '#f87171', // green-400 or red-400
    }));

    const animatedParticlesContainerStyle = useAnimatedStyle(() => {
        return {
            left: `${(progress.value / max) * 100}%`,
        };
    });
    
    return (
        <View style={statBarStyles.container}>
            <Icon color={animatedColorStyle.color} />
            <Text style={statBarStyles.label}>{label}</Text>
            <View style={statBarStyles.barBackground}>
                <Animated.View style={[statBarStyles.barFill, animatedBarFillStyle, animatedStyle]} />
                <Animated.View style={[statBarStyles.particlesContainer, animatedParticlesContainerStyle]}>
                    {particles.map(p => (
                        <Particle key={p.id} onAnimationComplete={() => removeParticle(p.id)} type={p.type} />
                    ))}
                </Animated.View>
            </View>
            <AnimatedTextInput editable={false} style={statBarStyles.value} animatedProps={animatedFinalValueProps} />
            <AnimatedTextInput editable={false} style={[statBarStyles.changeText, animatedColorStyle]} animatedProps={animatedChangeProps} />
        </View>
    );
};

const statBarStyles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    label: {
        marginLeft: 4,
        marginRight: 8,
        fontSize: 14,
        color: '#333',
    },
    barBackground: {
        flex: 1,
        height: 10,
        backgroundColor: '#e0e0e0',
        borderRadius: 5,
        overflow: 'hidden',
        marginRight: 8,
    },
    barFill: {
        height: '100%',
        borderRadius: 5,
    },
    value: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
    },
    absolute: {
        position: "absolute",
        top: 0,
        left: 0,
        bottom: 0,
        right: 0
    },
    changeText: {
        marginLeft: 4,
        fontSize: 12,
        fontWeight: 'bold',
    },
    changePositive: {
        color: '#22c55e', // green-500
    },
    changeNegative: {
        color: '#ef4444', // red-500
    },
    barPositive: {
        backgroundColor: '#4ade80', // green-400
    },
    barNegative: {
        backgroundColor: '#f87171', // red-400
    },
    particlesContainer: {
        position: 'absolute',
        top: 0,
        bottom: 0,
    },
    particleBase: {
        position: 'absolute',
        top: '50%', // Center vertically
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    sparkleParticle: {
        backgroundColor: '#facc15', // yellow-400
    },
    smokeParticle: {
        backgroundColor: '#94a3b8', // slate-400
    },
});
