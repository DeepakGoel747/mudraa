import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    Dimensions,
} from 'react-native';
import { COLORS } from '../../constants/colors';
import { AnimatedBlob } from '../../components/common/AnimatedBlob';
import { Button } from '../../components/common/Button';

const { width } = Dimensions.get('window');

export const WelcomeScreen = ({ navigation }: any) => {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.blobContainer}>
                <AnimatedBlob style={styles.topBlob} />
                <AnimatedBlob
                    style={[styles.bottomBlob, { transform: [{ rotate: '180deg' }] }]}
                />
            </View>

            <View style={styles.content}>
                <Text style={styles.title}>Welcome to Mudra</Text>
                <Text style={styles.subtitle}>
                    Your gateway to smart and seamless stock market trading
                </Text>
            </View>

            <View style={styles.buttonContainer}>
                <Button
                    title="Get Started"
                    onPress={() => navigation.navigate('Login')}
                    style={styles.button}
                />
                <Button
                    title="I already have an account"
                    onPress={() => navigation.navigate('Login')}
                    variant="outline"
                    style={styles.button}
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    blobContainer: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
    },
    topBlob: {
        top: -100,
        left: -width * 0.2,
    },
    bottomBlob: {
        bottom: -150,
        right: -width * 0.2,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: COLORS.text.primary,
        textAlign: 'center',
        marginBottom: 16,
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.text.secondary,
        textAlign: 'center',
        marginBottom: 32,
    },
    buttonContainer: {
        paddingHorizontal: 24,
        paddingBottom: 24,
    },
    button: {
        marginBottom: 12,
    },
}); 