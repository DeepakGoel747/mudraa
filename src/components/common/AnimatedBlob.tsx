import React, { useEffect } from 'react';
import { StyleSheet, Animated } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { COLORS } from '../../constants/colors';

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface AnimatedBlobProps {
    style?: any;
}

export const AnimatedBlob: React.FC<AnimatedBlobProps> = ({ style }) => {
    const animation = new Animated.Value(0);

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(animation, {
                    toValue: 1,
                    duration: 5000,
                    useNativeDriver: true,
                }),
                Animated.timing(animation, {
                    toValue: 0,
                    duration: 5000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, [animation]);

    const translateX = animation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 20],
    });

    const translateY = animation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 15],
    });

    const scale = animation.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [1, 1.1, 1],
    });

    return (
        <Animated.View
            style={[
                styles.container,
                style,
                {
                    transform: [
                        { translateX },
                        { translateY },
                        { scale },
                    ],
                },
            ]}
        >
            <Svg height="300" width="300" viewBox="0 0 200 200">
                <AnimatedPath
                    d="M40,-50C51.2,-41.2,59.1,-27.4,63.3,-11.9C67.4,3.6,67.8,20.8,60.5,33.5C53.2,46.2,38.2,54.3,22.4,58.7C6.6,63.1,-10,63.7,-24.8,58.6C-39.7,53.5,-52.8,42.6,-60.1,28.2C-67.4,13.8,-69,-4.1,-63.8,-19.2C-58.6,-34.3,-46.6,-46.5,-33.3,-54.6C-19.9,-62.7,-5.2,-66.7,8.1,-64.9C21.3,-63.1,28.8,-58.8,40,-50Z"
                    fill={`url(#grad)`}
                    transform="translate(100 100)"
                />
                <defs>
                    <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor={COLORS.purple.light} />
                        <stop offset="100%" stopColor={COLORS.purple.dark} />
                    </linearGradient>
                </defs>
            </Svg>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        opacity: 0.6,
    },
});
